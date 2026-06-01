import { method, providers, requireAdmin, requireAuth, upload, withMulter } from '../_shared.js';

async function uploadHandler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!requireAuth(req, res)) return;
  if (!requireAdmin(req, res)) return;
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  let targets;
  try {
    targets = JSON.parse(req.body.providers ?? '["aws"]');
  } catch {
    targets = ['aws'];
  }

  const results = {};
  await Promise.allSettled(targets.map(async key => {
    if (!providers[key]) {
      results[key] = { status: 'error', message: 'Unknown provider' };
      return;
    }
    try {
      await providers[key].uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      results[key] = { status: 'ok' };
    } catch (err) {
      results[key] = { status: 'error', message: err.message };
    }
  }));

  const allOk = Object.values(results).every(result => result.status === 'ok');
  res.status(allOk ? 200 : 207).json({
    name: req.file.originalname,
    sizeBytes: req.file.size,
    providers: targets,
    results,
  });
}

export default withMulter(upload.single('file'), uploadHandler);
