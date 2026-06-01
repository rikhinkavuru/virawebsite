import type { VercelRequest, VercelResponse } from "@vercel/node";
import raw from "../src/data/chapters.json";
import { ChaptersResponseSchema } from "../src/lib/schema";
import { methodNotAllowed, sendError } from "./_lib/http";

/** GET /api/chapters — the typed network roster, validated before it leaves the
 *  server. Cached at the edge; the client also holds the static array as
 *  placeholderData, so this 500ing degrades to today's page. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (methodNotAllowed(req, res, "GET")) return;
  const parsed = ChaptersResponseSchema.safeParse({ chapters: raw.chapters });
  if (!parsed.success) {
    sendError(res, 500, "invalid_data", "Chapter data failed validation.");
    return;
  }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.status(200).json(parsed.data);
}
