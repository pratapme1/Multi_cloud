import { getStoredUser, getUsers, getInvite, markInviteUsed, saveUser } from '../roles.js';

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
export const login = async (username, password) => {
  const storedUser = getStoredUser(username);
  if (storedUser) {
    await new Promise(r => setTimeout(r, 400));
    if (storedUser.password !== password) throw new Error('Invalid credentials');
    return { token: `mock-${storedUser.role}-token`, role: storedUser.role, username };
  }
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleRes(res);
};

export const register = async ({ username, email, password, inviteToken }) => {
  await new Promise(r => setTimeout(r, 800));
  if (!username || username.length < 3)
    throw Object.assign(new Error('Username must be at least 3 characters.'), { field: 'username' });
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    throw Object.assign(new Error('Username may only contain letters, numbers, and underscores.'), { field: 'username' });
  if (getUsers().some(user => user.username === username))
    throw Object.assign(new Error('Username is already taken.'), { field: 'username' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Object.assign(new Error('Enter a valid email address.'), { field: 'email' });
  if (!password || password.length < 6)
    throw Object.assign(new Error('Password must be at least 6 characters.'), { field: 'password' });
  const invite = getInvite(inviteToken);
  const role = invite?.role ?? 'viewer';
  saveUser({ username, email, password, role });
  if (invite) markInviteUsed(invite.token, username);
  return { username, role };
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
  if (window.location.hostname.endsWith('vercel.app') || import.meta.env.VITE_DIRECT_UPLOADS === 'true') {
    return uploadFileDirect(file, provArray);
  }

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

export const uploadFileDirect = async (file, providers) => {
  const res = await fetch(`${BASE}/files/upload-url`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: file.name,
      contentType: file.type || 'application/octet-stream',
      providers,
    }),
  });
  const data = await handleRes(res);

  const results = {};
  await Promise.all(providers.map(async provider => {
    try {
      const target = data.urls?.[provider];
      if (!target) {
        results[provider] = { status: 'error', message: data.errors?.[provider] ?? 'No upload URL returned' };
        return;
      }

      const uploadRes = await fetch(target.url, {
        method: target.method ?? 'PUT',
        headers: target.headers ?? {},
        body: file,
      });

      results[provider] = uploadRes.ok
        ? { status: 'ok' }
        : { status: 'error', message: `Direct upload failed: HTTP ${uploadRes.status}` };
    } catch (err) {
      results[provider] = {
        status: 'error',
        message: err?.message?.includes('Failed to fetch')
          ? 'Browser blocked direct upload. Check storage CORS for this Vercel domain.'
          : err.message,
      };
    }
  }));

  return {
    name: file.name,
    sizeBytes: file.size,
    providers,
    results,
  };
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
