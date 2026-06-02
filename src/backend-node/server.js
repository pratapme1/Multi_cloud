import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { AwsProvider }   from './providers/aws.js';
import { AzureProvider } from './providers/azure.js';
import { GcsProvider }   from './providers/gcs.js';
import {
  createInvite,
  getInvite,
  listInvites,
  listUsers,
  registerUser,
  signIn,
  verifyToken,
} from './auth/supabaseAuth.js';

const app    = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

const PORT = process.env.PORT ?? 3001;

const aws   = new AwsProvider();
const azure = new AzureProvider();
const gcs   = new GcsProvider();
const PROVIDERS = { aws, azure, gcs };

// Auth middleware
const requireAuth = async (req, res, next) => {
  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  try {
    const user = await verifyToken(token);
    req.user = user;
    req.role = user.role;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!['super_admin', 'admin'].includes(req.role)) return res.status(403).json({ error: 'Forbidden - admin access required' });
  next();
};

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  try {
    res.json(await signIn(username, password));
  } catch (err) {
    res.status(401).json({ error: err.message || 'Invalid username or password' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    res.status(201).json(await registerUser(req.body ?? {}));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed', field: err.field });
  }
});

app.get('/api/auth/invite', async (req, res) => {
  try {
    res.json({ invite: await getInvite(req.query.token) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Invite lookup failed' });
  }
});

app.get('/api/roles', requireAuth, async (req, res) => {
  if (req.role !== 'super_admin') return res.status(403).json({ error: 'Forbidden - Super Admin only' });
  try {
    const [users, invites] = await Promise.all([listUsers(), listInvites()]);
    res.json({ users, invites });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Role management failed' });
  }
});

app.post('/api/roles', requireAuth, async (req, res) => {
  if (req.role !== 'super_admin') return res.status(403).json({ error: 'Forbidden - Super Admin only' });
  try {
    res.status(201).json({ invite: await createInvite({ role: req.body?.role, createdBy: req.user }) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Role management failed' });
  }
});
// ── Files — list ───────────────────────────────────────────────────────────────
app.get('/api/files', requireAuth, async (req, res) => {
  const { provider = 'all' } = req.query;

  try {
    let files;

    if (provider === 'all') {
      // Fetch from all providers in parallel; failures are tolerated
      const [awsR, azureR, gcsR] = await Promise.allSettled([
        aws.listFiles(), azure.listFiles(), gcs.listFiles(),
      ]);
      // Merge by filename — if a file exists on multiple providers combine their arrays
      const map = new Map();
      for (const result of [awsR, azureR, gcsR]) {
        if (result.status !== 'fulfilled') continue;
        for (const f of result.value) {
          if (map.has(f.name)) {
            const existing = map.get(f.name);
            existing.providers = [...new Set([...existing.providers, ...f.providers])];
            if ((!existing.uploadedBy || existing.uploadedBy === 'Unknown') && f.uploadedBy && f.uploadedBy !== 'Unknown') {
              existing.uploadedBy = f.uploadedBy;
              existing.owner = f.uploadedBy;
            }
          } else {
            map.set(f.name, { ...f });
          }
        }
      }
      files = [...map.values()].sort((a, b) => b.modifiedTs - a.modifiedTs);

    } else if (PROVIDERS[provider]) {
      files = await PROVIDERS[provider].listFiles();
    } else {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    res.json(files);
  } catch (err) {
    console.error('[files]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Files — upload ─────────────────────────────────────────────────────────────
app.post('/api/files/upload', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  let targets;
  try {
    targets = JSON.parse(req.body.providers ?? '["aws"]');
  } catch {
    targets = ['aws'];
  }

  const providerResults = {};
  await Promise.allSettled(
    targets.map(async key => {
      if (!PROVIDERS[key]) { providerResults[key] = { status: 'error', message: 'Unknown provider' }; return; }
      try {
        await PROVIDERS[key].uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, {
          uploadedBy: req.user?.username ?? 'Unknown',
        });
        providerResults[key] = { status: 'ok' };
      } catch (err) {
        providerResults[key] = { status: 'error', message: err.message };
      }
    })
  );

  const allOk = Object.values(providerResults).every(r => r.status === 'ok');
  res.status(allOk ? 200 : 207).json({
    name:      req.file.originalname,
    sizeBytes: req.file.size,
    providers: targets,
    results:   providerResults,
  });
});

// ── Files — download ──────────────────────────────────────────────────────────
app.get('/api/files/download/:filename', requireAuth, async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const { provider = 'aws' } = req.query;
  if (!PROVIDERS[provider]) return res.status(400).json({ error: `Unknown provider: ${provider}` });
  try {
    const { buffer, contentType } = await PROVIDERS[provider].getFileContent(filename);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', contentType);
    res.end(buffer);
  } catch (err) {
    console.error('[download]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Files — delete ─────────────────────────────────────────────────────────────
app.delete('/api/files/:filename', requireAuth, requireAdmin, async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const { provider = 'aws' } = req.query;

  if (!PROVIDERS[provider]) return res.status(400).json({ error: `Unknown provider: ${provider}` });

  try {
    await PROVIDERS[provider].deleteFile(filename);
    res.json({ message: `Deleted "${filename}" from ${provider}` });
  } catch (err) {
    console.error('[delete]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync ───────────────────────────────────────────────────────────────────────
// Copies files from source provider to one or more destinations.
// Cross-cloud copy requires both providers to be configured.
app.post('/api/sync', requireAuth, requireAdmin, async (req, res) => {
  const { from, targets = [] } = req.body ?? {};

  if (!PROVIDERS[from]) return res.status(400).json({ error: `Unknown source provider: ${from}` });

  let copied = 0, skipped = 0, failed = 0;
  const details = [];

  try {
    const sourceFiles = await PROVIDERS[from].listFiles();

    for (const targetKey of targets) {
      if (!PROVIDERS[targetKey]) {
        details.push({ target: targetKey, status: 'error', message: 'Unknown provider' });
        failed++;
        continue;
      }
      if (targetKey === from) {
        details.push({ target: targetKey, status: 'skipped', message: 'Source and target are the same' });
        skipped += sourceFiles.length;
        continue;
      }

      let targetFiles = [];
      try { targetFiles = await PROVIDERS[targetKey].listFiles(); } catch { /* placeholder returns [] */ }
      const targetNames = new Set(targetFiles.map(f => f.name));

      for (const file of sourceFiles) {
        if (targetNames.has(file.name)) {
          skipped++;
        } else {
          try {
            const { buffer, contentType } = await PROVIDERS[from].getFileContent(file.name);
            await PROVIDERS[targetKey].uploadFile(buffer, file.name, contentType, {
              uploadedBy: req.user?.username ?? 'Unknown',
            });
            copied++;
            details.push({ file: file.name, target: targetKey, status: 'ok' });
          } catch (err) {
            failed++;
            details.push({ file: file.name, target: targetKey, status: 'error', message: err.message });
          }
        }
      }
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  res.json({ from, targets, copied, skipped, failed, details });
});

// ── Health ─────────────────────────────────────────────────────────────────────
app.get('/api/health', requireAuth, async (_req, res) => {
  const [awsR, azureR, gcsR] = await Promise.allSettled([
    aws.health(), azure.health(), gcs.health(),
  ]);

  const providers = [awsR, azureR, gcsR].map(r =>
    r.status === 'fulfilled'
      ? r.value
      : { status: 'error', message: r.reason?.message }
  );

  const degraded = providers.some(p => p.status === 'error');
  res.status(degraded ? 207 : 200).json({
    status: degraded ? 'degraded' : 'ok',
    providers,
  });
});

// ── Credential / connectivity test (dev only) ─────────────────────────────────
app.get('/api/test-credentials', async (_req, res) => {
  const [awsR, azureR, gcsR] = await Promise.allSettled([
    aws.health(), azure.health(), gcs.health(),
  ]);
  res.json({
    aws:   awsR.status   === 'fulfilled' ? awsR.value   : { status: 'error', message: awsR.reason?.message },
    azure: azureR.status === 'fulfilled' ? azureR.value : { status: 'error', message: azureR.reason?.message },
    gcs:   gcsR.status   === 'fulfilled' ? gcsR.value   : { status: 'error', message: gcsR.reason?.message },
  });
});

app.listen(PORT, () => {
  console.log(`\nMultiCloud API  →  http://localhost:${PORT}`);
  console.log(`Test endpoint   →  http://localhost:${PORT}/api/test-credentials`);
  console.log(`Files (AWS)     →  http://localhost:${PORT}/api/files  (needs Bearer header)\n`);
});
