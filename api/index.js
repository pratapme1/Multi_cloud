import express from 'express';
import multer from 'multer';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { AwsProvider } from '../src/backend-node/providers/aws.js';
import { AzureProvider } from '../src/backend-node/providers/azure.js';
import { GcsProvider } from '../src/backend-node/providers/gcs.js';
import {
  createInvite,
  getInvite,
  listInvites,
  listUsers,
  registerUser,
  signIn,
  verifyToken,
} from '../src/backend-node/auth/supabaseAuth.js';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.use((req, _res, next) => {
  const url = new URL(req.url, 'https://local.vercel');
  const rewritePath = url.searchParams.get('path');

  if (rewritePath) {
    url.searchParams.delete('path');
    const search = url.searchParams.toString();
    req.url = `/api/${rewritePath}${search ? `?${search}` : ''}`;
  } else if (!req.url.startsWith('/api/')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }

  next();
});

app.use(express.json());

const aws = new AwsProvider();
const azure = new AzureProvider();
const gcs = new GcsProvider();
const PROVIDERS = { aws, azure, gcs };

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

const parseAzureConnectionString = connectionString => {
  const parts = Object.fromEntries(
    connectionString.split(';').map(part => {
      const index = part.indexOf('=');
      return index > -1 ? [part.slice(0, index), part.slice(index + 1)] : [part, ''];
    })
  );
  return {
    accountName: parts.AccountName,
    accountKey: parts.AccountKey,
    endpointSuffix: parts.EndpointSuffix ?? 'core.windows.net',
  };
};

const awsUploadUrl = async ({ name, contentType }) => {
  const client = new S3Client({
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    followRegionRedirects: true,
  });

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: name,
    ContentType: contentType ?? 'application/octet-stream',
  });

  return {
    provider: 'aws',
    method: 'PUT',
    url: await getSignedUrl(client, command, { expiresIn: 60 * 10 }),
    headers: { 'Content-Type': contentType ?? 'application/octet-stream' },
  };
};

const azureUploadUrl = ({ name, contentType }) => {
  const { accountName, accountKey, endpointSuffix } = parseAzureConnectionString(process.env.AZURE_CONNECTION_STRING ?? '');
  const containerName = process.env.AZURE_CONTAINER_NAME;
  if (!accountName || !accountKey || !containerName) throw new Error('Azure not configured');

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const startsOn = new Date(Date.now() - 60 * 1000);
  const expiresOn = new Date(Date.now() + 10 * 60 * 1000);
  const sas = generateBlobSASQueryParameters({
    containerName,
    blobName: name,
    permissions: BlobSASPermissions.parse('cw'),
    startsOn,
    expiresOn,
    protocol: SASProtocol.Https,
    contentType: contentType ?? 'application/octet-stream',
  }, credential).toString();

  return {
    provider: 'azure',
    method: 'PUT',
    url: `https://${accountName}.blob.${endpointSuffix}/${encodeURIComponent(containerName)}/${encodeURIComponent(name)}?${sas}`,
    headers: {
      'Content-Type': contentType ?? 'application/octet-stream',
      'x-ms-blob-type': 'BlockBlob',
    },
  };
};

app.post('/api/files/upload-url', requireAuth, requireAdmin, async (req, res) => {
  const { name, contentType, providers = ['aws'] } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'File name is required' });

  const urls = {};
  const errors = {};
  await Promise.allSettled(providers.filter(provider => provider !== 'gcs').map(async provider => {
    try {
      if (provider === 'aws') urls.aws = await awsUploadUrl({ name, contentType });
      else if (provider === 'azure') urls.azure = azureUploadUrl({ name, contentType });
      else errors[provider] = 'Unknown provider';
    } catch (err) {
      errors[provider] = err.message;
    }
  }));

  res.status(Object.keys(errors).length ? 207 : 200).json({ urls, errors });
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
