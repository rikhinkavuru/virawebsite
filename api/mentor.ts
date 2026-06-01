import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { MentorRequestSchema, MentorResponseSchema } from "../src/lib/schema";
import { getDb, ensureSchema } from "./_lib/db";
import { consumeMentorQuota } from "./_lib/usage";
import { getClientIp, methodNotAllowed, sendError } from "./_lib/http";

const SYSTEM_PROMPT =
  "You are a mentor for high-school students at a healthcare-focused hackathon " +
  "network called Vira Hacks. Given a topic or interest, propose ONE concrete, " +
  "buildable hackathon project idea that addresses a real clinical or public-health " +
  "problem. Respond in under 90 words as: a bold one-line title, then 2-3 sentences " +
  "covering the problem, the build, and a stretch goal. Be specific and encouraging. " +
  "No preamble, no markdown headers.";

/**
 * POST /api/mentor — AI idea generator with a hard cost ceiling.
 * Defense in depth: (1) account-level $0.50 Anthropic spend limit, (2) cheapest
 * capable model + tiny max_tokens + prompt caching, (3) a global generation cap,
 * (4) per-IP rate limit, (5) a response cache so identical prompts never re-bill.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (methodNotAllowed(req, res, "POST")) return;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return sendError(res, 503, "not_configured", "The AI mentor is not configured yet.");
  const sql = getDb();
  if (!sql) return sendError(res, 503, "not_configured", "The mentor datastore is not configured yet.");

  const parsed = MentorRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "invalid_input", parsed.error.issues[0]?.message ?? "Invalid topic.");
  }
  const topic = parsed.data.topic;
  const cacheKey = topic.toLowerCase().replace(/\s+/g, " ").trim();

  try {
    await ensureSchema(sql);

    const cached = (await sql`SELECT idea FROM mentor_cache WHERE topic = ${cacheKey} LIMIT 1`) as {
      idea: string;
    }[];
    if (cached.length > 0) {
      return res
        .status(200)
        .json(MentorResponseSchema.parse({ idea: cached[0].idea, cached: true, remaining: -1 }));
    }

    const quota = await consumeMentorQuota(sql, getClientIp(req));
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
    const idea = message.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    await sql`INSERT INTO mentor_cache (topic, idea) VALUES (${cacheKey}, ${idea}) ON CONFLICT (topic) DO NOTHING`;
    return res
      .status(200)
      .json(MentorResponseSchema.parse({ idea, cached: false, remaining: quota.remaining }));
  } catch {
    return sendError(res, 502, "upstream_error", "The mentor service is temporarily unavailable.");
  }
}
