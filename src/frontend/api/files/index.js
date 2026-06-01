import { listFiles, method, requireAuth } from '../_shared.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!requireAuth(req, res)) return;

  try {
    const files = await listFiles(req.query.provider ?? 'all');
    res.status(200).json(files);
  } catch (err) {
    const status = err.message.startsWith('Unknown provider') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
}
