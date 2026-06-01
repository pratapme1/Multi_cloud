import express from 'express';
import multer from 'multer';
import { AwsProvider } from '../src/backend-node/providers/aws.js';
import { AzureProvider } from '../src/backend-node/providers/azure.js';
import { GcsProvider } from '../src/backend-node/providers/gcs.js';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.use(express.json());

const aws = new AwsProvider();
const azure = new AzureProvider();
const gcs = new GcsProvider();
const PROVIDERS = { aws, azure, gcs };

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization ?? '';
  if (!auth.startsWith('Bearer mock-')) return res.status(401).json({ error: 'Unauthorized' });
  req.role = auth.includes('viewer') ? 'viewer' : 'admin';
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Forbidden - admin only' });
  next();
};

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (username === 'admin' && password === 'Admin@123') {
    return res.json({ token: 'mock-super_admin-token', role: 'super_admin', username });
  }
  if (username === 'viewer' && password === 'View@123') {
    return res.json({ token: 'mock-viewer-token', role: 'viewer', username });
  }
  res.status(401).json({ error: 'Invalid username or password' });
});

app.get('/api/files', requireAuth, async (req, res) => {
  const { provider = 'all' } = req.query;

  try {
    let files;

    if (provider === 'all') {
      const results = await Promise.allSettled([aws.listFiles(), azure.listFiles(), gcs.listFiles()]);
      const map = new Map();

      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        for (const file of result.value) {
          if (map.has(file.name)) {
            const existing = map.get(file.name);
            existing.providers = [...new Set([...existing.providers, ...file.providers])];
          } else {
            map.set(file.name, { ...file });
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
    res.status(500).json({ error: err.message });
  }
});

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
      if (!PROVIDERS[key]) {
        providerResults[key] = { status: 'error', message: 'Unknown provider' };
        return;
      }

      try {
        await PROVIDERS[key].uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
        providerResults[key] = { status: 'ok' };
      } catch (err) {
        providerResults[key] = { status: 'error', message: err.message };
      }
    })
  );

  const allOk = Object.values(providerResults).every(r => r.status === 'ok');
  res.status(allOk ? 200 : 207).json({
    name: req.file.originalname,
    sizeBytes: req.file.size,
    providers: targets,
    results: providerResults,
  });
});

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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/files/:filename', requireAuth, requireAdmin, async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const { provider = 'aws' } = req.query;
  if (!PROVIDERS[provider]) return res.status(400).json({ error: `Unknown provider: ${provider}` });

  try {
    await PROVIDERS[provider].deleteFile(filename);
    res.json({ message: `Deleted "${filename}" from ${provider}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sync', requireAuth, requireAdmin, async (req, res) => {
  const { from, targets = [] } = req.body ?? {};
  if (!PROVIDERS[from]) return res.status(400).json({ error: `Unknown source provider: ${from}` });

  let copied = 0;
  let skipped = 0;
  let failed = 0;
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
      try {
        targetFiles = await PROVIDERS[targetKey].listFiles();
      } catch {
        targetFiles = [];
      }

      const targetNames = new Set(targetFiles.map(file => file.name));
      for (const file of sourceFiles) {
        if (targetNames.has(file.name)) {
          skipped++;
          continue;
        }

        try {
          const { buffer, contentType } = await PROVIDERS[from].getFileContent(file.name);
          await PROVIDERS[targetKey].uploadFile(buffer, file.name, contentType);
          copied++;
          details.push({ file: file.name, target: targetKey, status: 'ok' });
        } catch (err) {
          failed++;
          details.push({ file: file.name, target: targetKey, status: 'error', message: err.message });
        }
      }
    }

    res.json({ from, targets, copied, skipped, failed, details });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', requireAuth, async (_req, res) => {
  const results = await Promise.allSettled([aws.health(), azure.health(), gcs.health()]);
  const providers = results.map(result =>
    result.status === 'fulfilled'
      ? result.value
      : { status: 'error', message: result.reason?.message }
  );

  const degraded = providers.some(provider => provider.status === 'error');
  res.status(degraded ? 207 : 200).json({
    status: degraded ? 'degraded' : 'ok',
    providers,
  });
});

app.get('/api/test-credentials', async (_req, res) => {
  const [awsR, azureR, gcsR] = await Promise.allSettled([aws.health(), azure.health(), gcs.health()]);
  res.json({
    aws: awsR.status === 'fulfilled' ? awsR.value : { status: 'error', message: awsR.reason?.message },
    azure: azureR.status === 'fulfilled' ? azureR.value : { status: 'error', message: azureR.reason?.message },
    gcs: gcsR.status === 'fulfilled' ? gcsR.value : { status: 'error', message: gcsR.reason?.message },
  });
});

export default app;
