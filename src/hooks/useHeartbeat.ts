import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import { HeartbeatSchema, type Heartbeat } from "@/lib/schema";
import { FLAGS } from "@/lib/flags";

const FALLBACK: Heartbeat = {
  status: "unknown",
  lastCommit: null,
  openIssues: null,
  stars: null,
  source: "",
  checkedAt: "",
};

/** GitHub-backed network heartbeat. Only polls when live; always degrades to
 *  a safe `unknown` state so the badge never errors. */
export function useHeartbeat() {
  const query = useQuery({
    queryKey: ["heartbeat"],
    queryFn: () => fetchJson<Heartbeat>("/api/heartbeat", { schema: HeartbeatSchema }),
    enabled: FLAGS.liveNetwork,
    placeholderData: FALLBACK,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
  return { ...query, heartbeat: query.data ?? FALLBACK };
}
