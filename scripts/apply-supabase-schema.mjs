import { readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

const readEnv = path => {
  const env = {};
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
};

const root = resolve(import.meta.dirname, '..');
const env = { ...readEnv(resolve(root, '.env')), ...process.env };
const connectionStrings = [env.DIRECT_URL, env.DATABASE_URL, env.POOLED_DATABASE_URL].filter(Boolean);

if (!connectionStrings.length) {
  console.error('Missing DIRECT_URL, DATABASE_URL, or POOLED_DATABASE_URL in .env');
  process.exit(1);
}

const sql = readFileSync(resolve(root, 'supabase/migrations/20260602000000_multi_cloud_schema.sql'), 'utf8');

let lastError;
for (const connectionString of connectionStrings) {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Supabase schema applied: multi_cloud');
    process.exit(0);
  } catch (err) {
    lastError = err;
  } finally {
    await client.end().catch(() => {});
  }
}

console.error(`Unable to apply Supabase schema: ${lastError?.message ?? 'unknown error'}`);
process.exit(1);
