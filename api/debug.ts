import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

// Temporary diagnostic for the DB path that mentor/apply run before their try/catch.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const url = process.env.DATABASE_URL ?? "";
  const out: Record<string, unknown> = {
    node: process.version,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasDbUrl: !!url,
    dbUrlPrefix: url.slice(0, 14),
    dbUrlHasPooler: url.includes("-pooler"),
  };
  try {
    const sql = neon(url);
    out.neonConstruct = "ok";
    try {
      const rows = (await sql`SELECT 1 as ok`) as unknown[];
      out.query = "ok rows=" + JSON.stringify(rows).slice(0, 80);
    } catch (e) {
      out.queryErr = String((e as Error)?.message ?? e).slice(0, 220);
    }
  } catch (e) {
    out.neonConstructErr = String((e as Error)?.message ?? e).slice(0, 220);
  }
  res.status(200).json(out);
}
