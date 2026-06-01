import { method, providers, requireAdmin, requireAuth } from '../_shared.js';

export default async function handler(req, res) {
  if (!method(req, res, ['DELETE'])) return;
  if (!requireAuth(req, res)) return;
  if (!requireAdmin(req, res)) return;

  const filename = decodeURIComponent(req.query.filename);
  const provider = req.query.provider ?? 'aws';
  if (!providers[provider]) return res.status(400).json({ error: `Unknown provider: ${provider}` });

  try {
    await providers[provider].deleteFile(filename);
    res.status(200).json({ message: `Deleted "${filename}" from ${provider}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
