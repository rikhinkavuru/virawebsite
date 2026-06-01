import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * GET /api/stats — headline metrics, derived from the chapter roster.
 * Self-contained (see api/chapters.ts for why). These are the deriveStats()
 * outputs for the current roster: 21 nodes, 5 active, 326 attendees
 * (58+42+73+88+65). Keep in sync with src/data/chapters.json.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Use GET.", code: "method_not_allowed" });
    return;
  }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.status(200).json({ total_nodes: 21, total_deployments: 5, total_users: 326 });
}
