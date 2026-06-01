import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type Sql = NeonQueryFunction<false, false>;

/** Returns a Neon tagged-template client, or null when DATABASE_URL is unset
 *  (so callers can respond 503 not_configured instead of crashing). */
export function getDb(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

let ensured = false;

/** Idempotently creates the tables. Cheap (CREATE TABLE IF NOT EXISTS) and
 *  memoized per warm lambda so it runs at most once per cold start. */
export async function ensureSchema(sql: Sql): Promise<void> {
  if (ensured) return;
  await sql`CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    school TEXT NOT NULL,
    state TEXT,
    city TEXT,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS usage_counters (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS mentor_cache (
    topic TEXT PRIMARY KEY,
    idea TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  ensured = true;
}
