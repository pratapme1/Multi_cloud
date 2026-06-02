import { createClient } from '@supabase/supabase-js';

export const ROLES = ['super_admin', 'admin', 'viewer'];
const SCHEMA = 'multi_cloud';

const env = name => process.env[name];
const supabaseUrl = () => env('SUPABASE_URL') || env('NEXT_PUBLIC_SUPABASE_URL');
const anonKey = () => env('SUPABASE_ANON_KEY') || env('NEXT_PUBLIC_SUPABASE_ANON_KEY') || env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
const serviceKey = () => env('SUPABASE_SERVICE_ROLE_KEY');

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
};

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && anonKey() && serviceKey());
}

function serviceClient() {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured');
  return createClient(supabaseUrl(), serviceKey(), clientOptions);
}

function publicClient() {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured');
  return createClient(supabaseUrl(), anonKey(), clientOptions);
}

const db = client => client.schema(SCHEMA);
const normalizeRole = role => (ROLES.includes(role) ? role : 'viewer');

const publicProfile = profile => ({
  id: profile.id,
  username: profile.username,
  email: profile.email,
  role: profile.role,
  source: profile.source,
  createdAt: profile.created_at ? Date.parse(profile.created_at) : undefined,
});

const publicInvite = invite => ({
  id: invite.id,
  token: invite.token,
  role: invite.role,
  createdBy: invite.created_by_username,
  createdAt: invite.created_at ? Date.parse(invite.created_at) : undefined,
  usedBy: invite.used_by_username,
  usedAt: invite.used_at ? Date.parse(invite.used_at) : undefined,
});

async function findProfileByUsernameOrEmail(client, login) {
  const byUsername = await db(client).from('profiles').select('*').eq('username', login).maybeSingle();
  if (byUsername.error) throw byUsername.error;
  if (byUsername.data) return byUsername.data;

  const byEmail = await db(client).from('profiles').select('*').eq('email', login).maybeSingle();
  if (byEmail.error) throw byEmail.error;
  return byEmail.data;
}

async function findProfileById(client, id) {
  const { data, error } = await db(client).from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function ensureDemoUser({ username, email, password, role }) {
  const admin = serviceClient();
  const existing = await findProfileByUsernameOrEmail(admin, username);
  if (existing) return existing;

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (created.error && !created.error.message?.toLowerCase().includes('already')) {
    throw created.error;
  }

  let userId = created.data?.user?.id;
  if (!userId) {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    userId = data.users.find(user => user.email === email)?.id;
  }
  if (!userId) throw new Error(`Unable to bootstrap ${username}`);

  const { data, error } = await db(admin)
    .from('profiles')
    .upsert({ id: userId, username, email, role, source: 'Built-in' }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function ensureBootstrapUsers() {
  if (process.env.SUPABASE_BOOTSTRAP_DEMO_USERS === 'false') return;
  await ensureDemoUser({ username: 'admin', email: 'admin@multi-cloud.example.com', password: 'Admin@123', role: 'super_admin' });
  await ensureDemoUser({ username: 'viewer', email: 'viewer@multi-cloud.example.com', password: 'View@123', role: 'viewer' });
}

export async function signIn(username, password) {
  await ensureBootstrapUsers();
  const admin = serviceClient();
  const profile = await findProfileByUsernameOrEmail(admin, username);
  const email = profile?.email ?? username;

  const signedIn = await publicClient().auth.signInWithPassword({ email, password });
  if (signedIn.error) throw signedIn.error;

  const currentProfile = await findProfileById(admin, signedIn.data.user.id);
  if (!currentProfile) throw new Error('User profile is missing');

  return {
    token: signedIn.data.session.access_token,
    role: currentProfile.role,
    username: currentProfile.username,
    email: currentProfile.email,
  };
}

export async function registerUser({ username, email, password, inviteToken }) {
  await ensureBootstrapUsers();
  const admin = serviceClient();
  const cleanUsername = String(username ?? '').trim();
  const cleanEmail = String(email ?? '').trim().toLowerCase();

  if (cleanUsername.length < 3) throw Object.assign(new Error('Username must be at least 3 characters.'), { field: 'username' });
  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) throw Object.assign(new Error('Username may only contain letters, numbers, and underscores.'), { field: 'username' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw Object.assign(new Error('Enter a valid email address.'), { field: 'email' });
  if (!password || password.length < 6) throw Object.assign(new Error('Password must be at least 6 characters.'), { field: 'password' });

  const existing = await findProfileByUsernameOrEmail(admin, cleanUsername);
  if (existing) throw Object.assign(new Error('Username is already taken.'), { field: 'username' });
  const existingEmail = await findProfileByUsernameOrEmail(admin, cleanEmail);
  if (existingEmail) throw Object.assign(new Error('Email is already registered.'), { field: 'email' });

  let invite = null;
  if (inviteToken) {
    const result = await db(admin).from('invites').select('*').eq('token', inviteToken).maybeSingle();
    if (result.error) throw result.error;
    if (result.data && !result.data.used_by) invite = result.data;
  }

  const role = normalizeRole(invite?.role);
  const created = await admin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: { username: cleanUsername },
  });
  if (created.error) throw Object.assign(new Error(created.error.message), { field: 'email' });

  const profileInsert = await db(admin)
    .from('profiles')
    .insert({ id: created.data.user.id, username: cleanUsername, email: cleanEmail, role, source: invite ? 'Invite' : 'Signup' })
    .select()
    .single();
  if (profileInsert.error) throw profileInsert.error;

  if (invite) {
    const used = await db(admin)
      .from('invites')
      .update({ used_by: created.data.user.id, used_by_username: cleanUsername, used_at: new Date().toISOString() })
      .eq('id', invite.id);
    if (used.error) throw used.error;
  }

  return publicProfile(profileInsert.data);
}

export async function verifyToken(token) {
  if (!token) throw new Error('Unauthorized');
  const admin = serviceClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw error ?? new Error('Unauthorized');
  const profile = await findProfileById(admin, data.user.id);
  if (!profile) throw new Error('User profile is missing');
  return { id: data.user.id, ...publicProfile(profile) };
}

export async function listUsers() {
  await ensureBootstrapUsers();
  const { data, error } = await db(serviceClient()).from('profiles').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(publicProfile);
}

export async function listInvites() {
  const { data, error } = await db(serviceClient()).from('invites').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(publicInvite);
}

export async function getInvite(token) {
  if (!token) return null;
  const { data, error } = await db(serviceClient()).from('invites').select('*').eq('token', token).maybeSingle();
  if (error) throw error;
  return data ? publicInvite(data) : null;
}

export async function createInvite({ role, createdBy }) {
  const normalizedRole = normalizeRole(role);
  const token = `${normalizedRole}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await db(serviceClient())
    .from('invites')
    .insert({
      token,
      role: normalizedRole,
      created_by: createdBy?.id,
      created_by_username: createdBy?.username,
    })
    .select()
    .single();
  if (error) throw error;
  return publicInvite(data);
}
