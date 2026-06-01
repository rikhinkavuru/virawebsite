/**
 * Feature flags. New code ships dark and degrades gracefully.
 *
 * - liveNetwork: when true, the map/stats/heartbeat hooks fetch from /api.
 *   When false (default), they render the bundled static data with zero network
 *   calls. Either way the map looks identical because the static array is the
 *   react-query `placeholderData` — so a total API outage degrades to today's
 *   exact page. Flip on via a Vercel preview env var once the API is proven.
 * - mentor / apply: showcase features. On by default; the backend self-disables
 *   (HTTP 503 `not_configured`) when its env vars are missing and the UI shows a
 *   graceful state, so it is always safe to render.
 */
export const FLAGS = {
  liveNetwork: import.meta.env.VITE_FEATURE_LIVE_NETWORK === "true",
  mentor: import.meta.env.VITE_FEATURE_MENTOR !== "false",
  apply: import.meta.env.VITE_FEATURE_APPLY !== "false",
} as const;
