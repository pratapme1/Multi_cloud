import { method } from '../_shared.js';
import { signIn } from '../../src/serverless/supabaseAuth.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;

  const { username, password } = req.body ?? {};
  try {
    const session = await signIn(username, password);
    res.status(200).json(session);
  } catch (err) {
    res.status(401).json({ error: err.message || 'Invalid username or password' });
  }
}
