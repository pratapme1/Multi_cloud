import { getInvite } from '../../src/serverless/supabaseAuth.js';
import { method } from '../_shared.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;

  try {
    const invite = await getInvite(req.query.token);
    res.status(200).json({ invite });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Invite lookup failed' });
  }
}
