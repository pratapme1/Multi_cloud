import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { createRoleInvite, getRoleState } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ROLES, canRole, roleLabel } from '../roles.js';

const fmt = ts => ts ? new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-';

export default function RolesPage() {
  const { user, can } = useAuth();
  const toast = useToast();
  const [role, setRole] = useState('admin');
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!can('manage_roles')) return <Navigate to="/app/files" replace />;

  const inviteUrl = token => `${window.location.origin}/signup?invite=${encodeURIComponent(token)}`;

  const loadRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRoleState();
      setUsers(data.users ?? []);
      setInvites(data.invites ?? []);
    } catch (err) {
      setError(err.message || 'Could not load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleCreateInvite = async () => {
    const invite = await createRoleInvite(role);
    await loadRoles();
    setCopied(invite.token);
    navigator.clipboard?.writeText(inviteUrl(invite.token)).catch(() => {});
    toast(`${roleLabel(role)} invite link created`, 'ok', 'Invite ready');
  };

  const handleCopy = token => {
    navigator.clipboard?.writeText(inviteUrl(token)).catch(() => {});
    setCopied(token);
    toast('Invite link copied', 'ok');
  };

  return (
    <div className="roles-page">
      <header className="topbar">
        <span className="tb-title">Role Management</span>
        <div className="tb-right">
          <span className="role-pill">Signed in as {roleLabel(user?.role)}</span>
        </div>
      </header>

      <section className="roles-hero">
        <div>
          <div className="eyebrow">Access model</div>
          <h1>Invite users into the right role</h1>
          <p>Create an invite link for Super Admin, Admin, or Viewer. Until email invites are available, copy the link and share it manually.</p>
        </div>
        <div className="invite-panel">
          <label className="fl">Invite role</label>
          <select className="sel" value={role} onChange={e => setRole(e.target.value)}>
            {Object.values(ROLES).map(r => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
          <button className="btn btn-p btn-full" onClick={handleCreateInvite}>Create invite link</button>
        </div>
      </section>

      <section className="role-grid">
        {Object.values(ROLES).map(r => (
          <article className="role-card" key={r.key}>
            <div className="role-card-head">
              <div>
                <h2>{r.label}</h2>
                <p>{r.description}</p>
              </div>
              <span className="role-count">{users.filter(u => u.role === r.key).length}</span>
            </div>
            <div className="perm-list">
              {['manage_roles', 'invite_users', 'upload', 'sync', 'delete', 'download', 'view_files', 'view_health'].map(permission => (
                <span key={permission} className={canRole(r.key, permission) ? 'perm on' : 'perm'}>
                  {permission.replaceAll('_', ' ')}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="roles-table-wrap">
        <div className="section-head">
          <div>
            <h2>Invite Links</h2>
            <p>Invite links are stored in Supabase under the multi_cloud schema.</p>
          </div>
        </div>
        <div className="roles-table">
          <div className="rt-head"><span>Role</span><span>Created</span><span>Status</span><span>Link</span></div>
          {loading ? (
            <div className="rt-empty">Loading invite links...</div>
          ) : error ? (
            <div className="rt-empty">{error}</div>
          ) : invites.length === 0 ? (
            <div className="rt-empty">No invite links yet. Create one from the panel above.</div>
          ) : invites.map(invite => (
            <div className="rt-row" key={invite.token}>
              <span className="role-pill">{roleLabel(invite.role)}</span>
              <span>{fmt(invite.createdAt)}</span>
              <span>{invite.usedBy ? `Used by ${invite.usedBy}` : 'Open'}</span>
              <button className="btn btn-s btn-sm" onClick={() => handleCopy(invite.token)}>
                {copied === invite.token ? 'Copied' : 'Copy link'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="roles-table-wrap">
        <div className="section-head">
          <div>
            <h2>Users</h2>
            <p>Supabase Auth users with profiles in the multi_cloud schema.</p>
          </div>
        </div>
        <div className="roles-table">
          <div className="rt-head"><span>User</span><span>Email</span><span>Role</span><span>Source</span></div>
          {loading ? (
            <div className="rt-empty">Loading users...</div>
          ) : users.map(account => (
            <div className="rt-row" key={account.username}>
              <strong>{account.username}</strong>
              <span>{account.email ?? '-'}</span>
              <span className="role-pill">{roleLabel(account.role)}</span>
              <span>{account.source ?? 'Invite'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
