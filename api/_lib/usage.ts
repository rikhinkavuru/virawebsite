import type { Sql } from "./db";

export interface QuotaResult {
  allowed: boolean;
  reason?: "rate_limited" | "cap_reached";
  /** Remaining global generations before the demo cap. */
  remaining: number;
}

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/**
 * Layered cost/abuse control for the AI mentor endpoint, backed by Postgres:
 *  1. per-IP sliding window (default 5 / 24h)
 *  2. a single global generation counter (default 150 total -> well under $0.50)
 * The account-level $0.50 Anthropic spend limit is the ultimate hard backstop;
 * this just stops us reaching it. Counts are consumed BEFORE the model call so
 * the cap fails safe (over-counts rather than under-counts).
 */
export async function consumeMentorQuota(sql: Sql, ip: string): Promise<QuotaResult> {
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
    RETURNING count` ) as { count: number }[];
  if ((ipRows[0]?.count ?? 0) > IP_LIMIT) {
    return { allowed: false, reason: "rate_limited", remaining: 0 };
  }

  const gRows = (await sql`
    INSERT INTO usage_counters (key, count, window_start)
    VALUES ('mentor:global', 1, now())
    ON CONFLICT (key) DO UPDATE SET count = usage_counters.count + 1
    RETURNING count` ) as { count: number }[];
  const gCount = gRows[0]?.count ?? 0;
  if (gCount > GLOBAL_LIMIT) {
    return { allowed: false, reason: "cap_reached", remaining: 0 };
  }
  return { allowed: true, remaining: Math.max(0, GLOBAL_LIMIT - gCount) };
}

/** Lightweight per-IP throttle for the public application form (anti-spam). */
export async function consumeApplyQuota(sql: Sql, ip: string): Promise<boolean> {
  const LIMIT = num(process.env.APPLY_IP_LIMIT, 5);
  const WINDOW_SEC = num(process.env.APPLY_IP_WINDOW_SEC, 3600);
  const rows = (await sql`
    INSERT INTO usage_counters (key, count, window_start)
    VALUES (${`apply:ip:${ip}`}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN now() - usage_counters.window_start > ${WINDOW_SEC} * interval '1 second'
                   THEN 1 ELSE usage_counters.count + 1 END,
      window_start = CASE WHEN now() - usage_counters.window_start > ${WINDOW_SEC} * interval '1 second'
                   THEN now() ELSE usage_counters.window_start END
    RETURNING count` ) as { count: number }[];
  return (rows[0]?.count ?? 0) <= LIMIT;
}
