const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const token = () => localStorage.getItem('mc_token') ?? '';
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

const handleRes = async res => {
  if (res.ok) return res.json();
  const body = await res.json().catch(() => ({}));
  const err = new Error(body.error ?? `HTTP ${res.status}`);
  err.response = { status: res.status };
  throw err;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
// Users registered via sign-up are kept in memory for this session.
// Persistent user management is deferred to M3 (JWT + DB).
const SESSION_USERS = {};

export const login = async (username, password) => {
  if (SESSION_USERS[username]) {
    await new Promise(r => setTimeout(r, 400));
    if (SESSION_USERS[username].password !== password) throw new Error('Invalid credentials');
    return { token: 'mock-viewer-token', role: 'viewer', username };
  }
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleRes(res);
};

export const register = async ({ username, email, password }) => {
  await new Promise(r => setTimeout(r, 800));
  if (!username || username.length < 3)
    throw Object.assign(new Error('Username must be at least 3 characters.'), { field: 'username' });
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    throw Object.assign(new Error('Username may only contain letters, numbers, and underscores.'), { field: 'username' });
  if (username === 'admin' || username === 'viewer' || SESSION_USERS[username])
    throw Object.assign(new Error('Username is already taken.'), { field: 'username' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Object.assign(new Error('Enter a valid email address.'), { field: 'email' });
  if (!password || password.length < 6)
    throw Object.assign(new Error('Password must be at least 6 characters.'), { field: 'password' });
  SESSION_USERS[username] = { password, role: 'viewer', email };
  return { username, role: 'viewer' };
};

// ── Files ─────────────────────────────────────────────────────────────────────
export const getFiles = async (provider = 'all') => {
  const res = await fetch(`${BASE}/files?provider=${encodeURIComponent(provider)}`, {
    headers: authHeader(),
  });
  return handleRes(res);
};

export const uploadFile = async (file, providers) => {
  const provArray = Array.isArray(providers) ? providers : [providers];
  const form = new FormData();
  form.append('file', file);
  form.append('providers', JSON.stringify(provArray));
  // No Content-Type header — browser sets multipart/form-data boundary automatically
  const res = await fetch(`${BASE}/files/upload`, {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
  return handleRes(res);
};

export const deleteFile = async (name, providers = ['aws']) => {
  const provArray = Array.isArray(providers) ? providers : [providers];
  const errors = [];
  await Promise.all(provArray.map(async prov => {
    const res = await fetch(
      `${BASE}/files/${encodeURIComponent(name)}?provider=${prov}`,
      { method: 'DELETE', headers: authHeader() }
    );
    if (!res.ok && res.status !== 404) {
      const body = await res.json().catch(() => ({}));
      errors.push(`${prov}: ${body.error ?? res.status}`);
    }
  }));
  if (errors.length) throw new Error(errors.join(', '));
  return { message: `Deleted ${name}` };
};

// ── Sync ──────────────────────────────────────────────────────────────────────
export const runSync = async (from, targets) => {
  const targetList = Array.isArray(targets) ? targets : [targets];
  const res = await fetch(`${BASE}/sync`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, targets: targetList }),
  });
  return handleRes(res);
};

// ── Download ──────────────────────────────────────────────────────────────────
export const downloadFile = async (name, provider = 'aws') => {
  const res = await fetch(
    `${BASE}/files/download/${encodeURIComponent(name)}?provider=${provider}`,
    { headers: authHeader() }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ── Health ────────────────────────────────────────────────────────────────────
export const getHealth = async () => {
  const res = await fetch(`${BASE}/health`, { headers: authHeader() });
  return handleRes(res);
};
