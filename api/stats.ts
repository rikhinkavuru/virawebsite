import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import raw from "../src/data/chapters.json";
import { ChapterSchema } from "../src/lib/schema";
import { deriveStats } from "../src/lib/stats";
import { methodNotAllowed, sendError } from "./_lib/http";

/** GET /api/stats — metrics derived from chapter data (never hardcoded). */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (methodNotAllowed(req, res, "GET")) return;
  const parsed = z.array(ChapterSchema).safeParse(raw.chapters);
  if (!parsed.success) {
    sendError(res, 500, "invalid_data", "Chapter data failed validation.");
    return;
  }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.status(200).json(deriveStats(parsed.data));
}
