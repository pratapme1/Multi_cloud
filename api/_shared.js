import express from 'express';
import multer from 'multer';
import { AwsProvider } from '../src/backend-node/providers/aws.js';
import { AzureProvider } from '../src/backend-node/providers/azure.js';
import { GcsProvider } from '../src/backend-node/providers/gcs.js';
import { verifyToken } from '../src/backend-node/auth/supabaseAuth.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

export const providers = {
  aws: new AwsProvider(),
  azure: new AzureProvider(),
  gcs: new GcsProvider(),
};

export async function requireAuth(req, res) {
  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  try {
    const user = await verifyToken(token);
    req.user = user;
    req.role = user.role;
    return true;
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
}

export function requireAdmin(req, res) {
  if (!['super_admin', 'admin'].includes(req.role)) {
    res.status(403).json({ error: 'Forbidden - admin access required' });
    return false;
  }
  return true;
}

export function method(req, res, allowed) {
  if (allowed.includes(req.method)) return true;
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: 'Method not allowed' });
  return false;
}

export async function listFiles(provider = 'all') {
  if (provider !== 'all') {
    if (!providers[provider]) throw new Error(`Unknown provider: ${provider}`);
    return providers[provider].listFiles();
  }

  const results = await Promise.allSettled([
    providers.aws.listFiles(),
    providers.azure.listFiles(),
    providers.gcs.listFiles(),
  ]);

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

  return [...map.values()].sort((a, b) => b.modifiedTs - a.modifiedTs);
}

export function withMulter(middleware, handler) {
  const app = express();
  app.use((req, res, next) => middleware(req, res, next));
  app.use(handler);
  return (req, res) => app(req, res);
}
