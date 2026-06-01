import { ChapterSchema, type Chapter, type Stats } from "./schema";

/**
 * Derives the headline metrics from chapter data instead of hardcoding them.
 * Replaces the old hardcoded `total_users: 326` — which (verified) happens to
 * equal the sum of active-chapter attendees, so the rendered numbers are
 * unchanged, but they are now honest and self-updating.
 * Shared by the client and the /api/stats function (relative import only).
 */
export function deriveStats(chapters: Chapter[]): Stats {
  const active = chapters.filter((c) => c.status === "active");
  return {
    total_nodes: chapters.length,
    total_deployments: active.length,
    total_users: active.reduce((sum, c) => sum + (c.attendees ?? 0), 0),
  };
}

export { ChapterSchema };
