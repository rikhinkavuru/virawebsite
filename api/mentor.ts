import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Self-contained (Vercel doesn't include local imports in /api functions).
type Sql = NeonQueryFunction<false, false>;

const SYSTEM_PROMPT =
  "You are a mentor for high-school students at a healthcare-focused hackathon " +
  "network called Vira Hacks. Given a topic or interest, propose ONE concrete, " +
  "buildable hackathon project idea that addresses a real clinical or public-health " +
  "problem. Respond in under 90 words as: a bold one-line title, then 2-3 sentences " +
  "covering the problem, the build, and a stretch goal. Be specific and encouraging. " +
  "No preamble, no markdown headers.";

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
  await sql`CREATE TABLE IF NOT EXISTS usage_counters (
    key TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now())`;
  await sql`CREATE TABLE IF NOT EXISTS mentor_cache (
    topic TEXT PRIMARY KEY, idea TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
  ensured = true;
}

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Layered cost guard: per-IP window + a single global generation cap. Consumed
 *  BEFORE the model call so it fails safe (over-counts rather than under-counts).
 *  The $0.50 Anthropic workspace spend limit is the ultimate hard backstop. */
async function consumeQuota(sql: Sql, ip: string): Promise<{ allowed: boolean; reason?: string; remaining: number }> {
  const GLOBAL_LIMIT = num(process.env.MENTOR_GLOBAL_LIMIT, 150);
  const IP_LIMIT = num(process.env.MENTOR_IP_LIMIT, 5);
  const IP_WINDOW_SEC = num(process.env.MENTOR_IP_WINDOW_SEC, 86400);

  const ipRows = (await sql`
    INSERT INTO usage_counters (key, count, window_start)
    VALUES (${`mentor:ip:${ip}`}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN now() - usage_counters.window_start > ${IP_WINDOW_SEC} * interval '1 second'
                   THEN 1 ELSE usage_counters.count + 1 END,
      window_start = CASE WHEN now() - usage_counters.window_start > ${IP_WINDOW_SEC} * interval '1 second'
                   THEN now() ELSE usage_counters.window_start END
    RETURNING count`) as { count: number }[];
  if ((ipRows[0]?.count ?? 0) > IP_LIMIT) return { allowed: false, reason: "rate_limited", remaining: 0 };

  const gRows = (await sql`
    INSERT INTO usage_counters (key, count, window_start) VALUES ('mentor:global', 1, now())
    ON CONFLICT (key) DO UPDATE SET count = usage_counters.count + 1
    RETURNING count`) as { count: number }[];
  const gCount = gRows[0]?.count ?? 0;
  if (gCount > GLOBAL_LIMIT) return { allowed: false, reason: "cap_reached", remaining: 0 };
  return { allowed: true, remaining: Math.max(0, GLOBAL_LIMIT - gCount) };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return sendError(res, 405, "method_not_allowed", "Use POST.");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return sendError(res, 503, "not_configured", "The AI mentor is not configured yet.");
  const sql = getDb();
  if (!sql) return sendError(res, 503, "not_configured", "The mentor datastore is not configured yet.");

  const body = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (topic.length < 3 || topic.length > 200) {
    return sendError(res, 400, "invalid_input", "Give me a few words to work with (3-200 characters).");
  }
  const cacheKey = topic.toLowerCase().replace(/\s+/g, " ").trim();

  try {
    await ensureSchema(sql);
    const cached = (await sql`SELECT idea FROM mentor_cache WHERE topic = ${cacheKey} LIMIT 1`) as { idea: string }[];
    if (cached.length > 0) {
      return res.status(200).json({ idea: cached[0].idea, cached: true, remaining: -1 });
    }

    const quota = await consumeQuota(sql, getClientIp(req));
    if (!quota.allowed) {
      if (quota.reason === "cap_reached") {
        return sendError(res, 503, "cap_reached", "The demo generation budget for this portfolio has been reached.");
      }
      return sendError(res, 429, "rate_limited", "You've hit the limit for now — try again later.");
    }

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5",
      max_tokens: 256,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `Topic / interest: ${topic}` }],
    });
    const idea = message.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();

    await sql`INSERT INTO mentor_cache (topic, idea) VALUES (${cacheKey}, ${idea}) ON CONFLICT (topic) DO NOTHING`;
    return res.status(200).json({ idea, cached: false, remaining: quota.remaining });
  } catch {
    return sendError(res, 502, "upstream_error", "The mentor service is temporarily unavailable.");
  }
}
