import { method } from '../_shared.js';

export default function handler(req, res) {
  if (!method(req, res, ['POST'])) return;

  const { username, password } = req.body ?? {};
  if (username === 'admin' && password === 'Admin@123') {
    return res.status(200).json({ token: 'mock-super_admin-token', role: 'super_admin', username });
  }
  if (username === 'viewer' && password === 'View@123') {
    return res.status(200).json({ token: 'mock-viewer-token', role: 'viewer', username });
  }
  res.status(401).json({ error: 'Invalid username or password' });
}
