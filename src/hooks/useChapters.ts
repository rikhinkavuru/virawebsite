import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import { ChaptersResponseSchema, type Chapter } from "@/lib/schema";
import { CHAPTERS } from "@/data/chapters";
import { FLAGS } from "@/lib/flags";

/** Hierarchical query keys — one place to derive every chapter-related key. */
export const chapterKeys = {
  all: ["chapters"] as const,
  list: () => [...chapterKeys.all, "list"] as const,
};

/**
 * The map/roster read the network from here. With the live flag off (default)
 * no request is made and the bundled static array is served; with it on, the
 * typed /api/chapters response is validated and cached. Either way `chapters`
 * is always populated (placeholderData + a hard fallback), so an API outage
 * degrades to today's exact page rather than a blank map.
 */
export function useChapters() {
  const query = useQuery({
    queryKey: chapterKeys.list(),
    queryFn: async (): Promise<Chapter[]> => {
      const data = await fetchJson("/api/chapters", { schema: ChaptersResponseSchema });
      return data.chapters;
    },
    enabled: FLAGS.liveNetwork,
    placeholderData: CHAPTERS,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return { ...query, chapters: query.data ?? CHAPTERS };
}
