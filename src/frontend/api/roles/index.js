import { createInvite, listInvites, listUsers } from '../../src/serverless/supabaseAuth.js';
import { method, requireAuth } from '../_shared.js';

const canManageRoles = role => role === 'super_admin';

export default async function handler(req, res) {
  if (!method(req, res, ['GET', 'POST'])) return;
  if (!(await requireAuth(req, res))) return;

  if (!canManageRoles(req.role)) {
    return res.status(403).json({ error: 'Forbidden - Super Admin only' });
  }

  try {
    if (req.method === 'GET') {
      const [users, invites] = await Promise.all([listUsers(), listInvites()]);
      return res.status(200).json({ users, invites });
    }

    const invite = await createInvite({ role: req.body?.role, createdBy: req.user });
    return res.status(201).json({ invite });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Role management failed' });
  }
}
