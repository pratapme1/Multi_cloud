export const ROLES = {
  super_admin: {
    key: 'super_admin',
    label: 'Super Admin',
    description: 'Owns role access, invites, storage operations, and health visibility.',
    permissions: ['manage_roles', 'invite_users', 'upload', 'sync', 'delete', 'download', 'view_files', 'view_health'],
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    description: 'Runs day-to-day storage operations across AWS and Azure.',
    permissions: ['upload', 'sync', 'delete', 'download', 'view_files', 'view_health'],
  },
  viewer: {
    key: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to files, downloads, and provider health.',
    permissions: ['download', 'view_files', 'view_health'],
  },
};

const USERS_KEY = 'mc_users';
const INVITES_KEY = 'mc_invites';

export const roleLabel = role => ROLES[role]?.label ?? 'Viewer';
export const canRole = (role, permission) => !!ROLES[role]?.permissions.includes(permission);

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const builtInUsers = [
  { username: 'admin', email: 'admin@local', role: 'super_admin', source: 'Built-in' },
  { username: 'viewer', email: 'viewer@local', role: 'viewer', source: 'Built-in' },
];

export function getUsers() {
  const stored = readJson(USERS_KEY, []);
  const byName = new Map();
  for (const user of [...builtInUsers, ...stored]) byName.set(user.username, user);
  return [...byName.values()];
}

export function getStoredUser(username) {
  return readJson(USERS_KEY, []).find(user => user.username === username);
}

export function saveUser(user) {
  const users = readJson(USERS_KEY, []).filter(existing => existing.username !== user.username);
  users.push({ ...user, createdAt: user.createdAt ?? Date.now(), source: user.source ?? 'Invite' });
  writeJson(USERS_KEY, users);
}

export function getInvites() {
  return readJson(INVITES_KEY, []);
}

export function createInvite(role, createdBy = 'admin') {
  const token = `${role}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const invite = {
    token,
    role,
    createdBy,
    createdAt: Date.now(),
    usedBy: null,
  };
  writeJson(INVITES_KEY, [invite, ...getInvites()]);
  return invite;
}

export function getInvite(token) {
  return getInvites().find(invite => invite.token === token);
}

export function markInviteUsed(token, username) {
  const invites = getInvites().map(invite =>
    invite.token === token ? { ...invite, usedBy: username, usedAt: Date.now() } : invite
  );
  writeJson(INVITES_KEY, invites);
}
