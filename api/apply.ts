import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Self-contained (Vercel doesn't include local imports in /api functions).
type Sql = NeonQueryFunction<false, false>;

interface Application {
  name: string;
  email: string;
  school: string;
  state: string;
  city: string;
  message: string;
}

function sendError(res: VercelResponse, status: number, code: string, error: string): void {
  res.status(status).json({ error, code });
}

function getClientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0];
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real.length > 0) return real;
  return req.socket?.remoteAddress ?? "unknown";
}

function getDb(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    return neon(url); // throws on a malformed connection string
  } catch {
    return null; // treat a bad DATABASE_URL as "not configured" rather than crashing
  }
}

let ensured = false;
async function ensureSchema(sql: Sql): Promise<void> {
  if (ensured) return;
  await sql`CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, school TEXT NOT NULL,
    state TEXT, city TEXT, message TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
  await sql`CREATE TABLE IF NOT EXISTS usage_counters (
    key TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now())`;
  ensured = true;
}

async function withinRateLimit(sql: Sql, ip: string): Promise<boolean> {
  const LIMIT = Number(process.env.APPLY_IP_LIMIT) || 5;
  const WINDOW = Number(process.env.APPLY_IP_WINDOW_SEC) || 3600;
  const rows = (await sql`
    INSERT INTO usage_counters (key, count, window_start)
    VALUES (${`apply:ip:${ip}`}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN now() - usage_counters.window_start > ${WINDOW} * interval '1 second'
                   THEN 1 ELSE usage_counters.count + 1 END,
      window_start = CASE WHEN now() - usage_counters.window_start > ${WINDOW} * interval '1 second'
                   THEN now() ELSE usage_counters.window_start END
    RETURNING count`) as { count: number }[];
  return (rows[0]?.count ?? 0) <= LIMIT;
}

async function sendEmails(app: Application): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const resend = new Resend(key);
  const from = process.env.RESEND_FROM ?? "Vira Hacks <onboarding@resend.dev>";
  const founder = process.env.FOUNDER_EMAIL ?? "rikhinkavuru@gmail.com";
  await resend.emails.send({
    from,
    to: founder,
    replyTo: app.email,
    subject: `New chapter application: ${app.school} (${app.city}, ${app.state})`,
    text: `${app.name} <${app.email}> wants to host a Vira chapter at ${app.school}, ${app.city}, ${app.state}.\n\n${app.message || "(no message)"}`,
  });
  await resend.emails.send({
    from,
    to: app.email,
    subject: "We received your Vira Hacks chapter application",
    text: `Hi ${app.name},\n\nThanks for applying to host a Vira Hacks chapter at ${app.school}. Your node is marked pending while we review it — we'll be in touch soon.\n\n— The Vira Hacks network`,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return sendError(res, 405, "method_not_allowed", "Use POST.");

  const sql = getDb();
  if (!sql) return sendError(res, 503, "not_configured", "Applications are not configured yet.");

  const b = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  // Honeypot — real users never fill `company`; bots do. Silently accept.
  if (str(b.company).length > 0) return res.status(200).json({ ok: true });

  const app: Application = {
    name: str(b.name),
    email: str(b.email),
    school: str(b.school),
    state: str(b.state),
    city: str(b.city),
    message: str(b.message),
  };
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(app.email);
  if (app.name.length < 2 || !emailOk || app.school.length < 2 || app.state.length !== 2 || app.city.length < 2) {
    return sendError(res, 400, "invalid_input", "Please check the form fields.");
  }

  try {
    await ensureSchema(sql);
    if (!(await withinRateLimit(sql, getClientIp(req)))) {
      return sendError(res, 429, "rate_limited", "Too many submissions — please try again later.");
    }
    await sql`INSERT INTO applications (name, email, school, state, city, message)
      VALUES (${app.name}, ${app.email}, ${app.school}, ${app.state}, ${app.city}, ${app.message || null})`;
    await sendEmails(app).catch(() => {/* email is best-effort */});
    return res.status(201).json({ ok: true });
  } catch {
    return sendError(res, 500, "server_error", "Could not submit your application.");
  }
}
