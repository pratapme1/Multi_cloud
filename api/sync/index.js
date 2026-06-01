import { method, providers, requireAdmin, requireAuth } from '../_shared.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!requireAuth(req, res)) return;
  if (!requireAdmin(req, res)) return;

  const { from, targets = [] } = req.body ?? {};
  if (!providers[from]) return res.status(400).json({ error: `Unknown source provider: ${from}` });

  let copied = 0;
  let skipped = 0;
  let failed = 0;
  const details = [];

  try {
    const sourceFiles = await providers[from].listFiles();

    for (const targetKey of targets) {
      if (!providers[targetKey]) {
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
        targetFiles = await providers[targetKey].listFiles();
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
          const { buffer, contentType } = await providers[from].getFileContent(file.name);
          await providers[targetKey].uploadFile(buffer, file.name, contentType);
          copied++;
          details.push({ file: file.name, target: targetKey, status: 'ok' });
        } catch (err) {
          failed++;
          details.push({ file: file.name, target: targetKey, status: 'error', message: err.message });
        }
      }
    }

    res.status(200).json({ from, targets, copied, skipped, failed, details });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
