import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * GET /api/stats — headline metrics, derived from the chapter roster.
 * Self-contained (see api/chapters.ts for why). These are the deriveStats()
 * outputs for the current roster: 14 nodes, 14 active, 566 attendees.
 * Keep in sync with src/data/chapters.json.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Use GET.", code: "method_not_allowed" });
    return;
  }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.status(200).json({ total_nodes: 14, total_deployments: 14, total_users: 566 });
}
