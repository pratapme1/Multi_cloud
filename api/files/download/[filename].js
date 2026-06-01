import { method, providers, requireAuth } from '../../_shared.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!requireAuth(req, res)) return;

  const filename = decodeURIComponent(req.query.filename);
  const provider = req.query.provider ?? 'aws';
  if (!providers[provider]) return res.status(400).json({ error: `Unknown provider: ${provider}` });

  try {
    const { buffer, contentType } = await providers[provider].getFileContent(filename);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', contentType);
    res.end(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
