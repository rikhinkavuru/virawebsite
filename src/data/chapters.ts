import { z } from "zod";
import raw from "./chapters.json";
import { ChapterSchema, OperatorSchema, type Chapter, type Operator } from "../lib/schema";
import { deriveStats } from "../lib/stats";

/**
 * Typed, validated source of truth for the network data. The arrays were lifted
 * verbatim out of the 445-line Index.tsx (identical shape, so render output is
 * unchanged) and now double as react-query `placeholderData`/fallback.
 */
export const CHAPTERS: Chapter[] = z.array(ChapterSchema).parse(raw.chapters);
export const OPERATORS: Operator[] = z.array(OperatorSchema).parse(raw.operators);

/** Derived (not hardcoded) — see src/lib/stats.ts. */
export const DEPLOYMENT_STATS = deriveStats(CHAPTERS);

export { deriveStats };
