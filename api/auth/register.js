import { method } from '../_shared.js';
import { registerUser } from '../../src/backend-node/auth/supabaseAuth.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;

  try {
    const user = await registerUser(req.body ?? {});
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed', field: err.field });
  }
}
