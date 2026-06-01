import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import { StatsSchema, type Stats } from "@/lib/schema";
import { DEPLOYMENT_STATS } from "@/data/chapters";
import { FLAGS } from "@/lib/flags";

/** Headline metrics, derived server-side and validated on the way in. */
export function useStats() {
  const query = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetchJson<Stats>("/api/stats", { schema: StatsSchema }),
    enabled: FLAGS.liveNetwork,
    placeholderData: DEPLOYMENT_STATS,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return { ...query, stats: query.data ?? DEPLOYMENT_STATS };
}
