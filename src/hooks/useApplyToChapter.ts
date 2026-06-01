import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, ApiError } from "@/lib/apiClient";
import { ApplyResponseSchema, type Application, type ApplyResponse, type Chapter } from "@/lib/schema";
import { CHAPTERS } from "@/data/chapters";
import { STATE_CENTROIDS } from "@/data/usGeo";
import { chapterKeys } from "@/hooks/useChapters";

interface ApplyContext {
  previous: Chapter[];
  optimisticId: string;
}

/** Build a client-only "pending" node placed at the chosen state's centroid
 *  (small jitter so multiple don't overlap). Never persisted to the public list. */
function makeOptimisticNode(app: Application): Chapter {
  const base = STATE_CENTROIDS[app.state] ?? [-98, 39];
  const jitter = () => (Math.random() - 0.5) * 1.6;
  return {
    id: `apply-${app.school}-${Date.now()}`,
    name: app.school,
    loc: `${app.city}, ${app.state}`,
    status: "pending",
    coordinates: [base[0] + jitter(), base[1] + jitter()],
    info: "Your application — provisioning a pending node for review.",
    optimistic: true,
  };
}

/**
 * Optimistic "apply to host a chapter" mutation. onMutate snapshots the chapter
 * list and inserts the pending node so it appears on the map instantly; onError
 * rolls back to the snapshot. We deliberately do NOT invalidate on success:
 * applications stay private/pending and never enter the public /api/chapters
 * list, so the optimistic node remains as the applicant's session confirmation.
 */
export function useApplyToChapter() {
  const qc = useQueryClient();
  return useMutation<ApplyResponse, ApiError, Application, ApplyContext>({
    mutationFn: (app) =>
      fetchJson("/api/apply", {
        method: "POST",
        body: JSON.stringify(app),
        schema: ApplyResponseSchema,
        retries: 0,
      }),
    onMutate: async (app) => {
      await qc.cancelQueries({ queryKey: chapterKeys.list() });
      const previous = qc.getQueryData<Chapter[]>(chapterKeys.list()) ?? CHAPTERS;
      const node = makeOptimisticNode(app);
      qc.setQueryData<Chapter[]>(chapterKeys.list(), [...previous, node]);
      return { previous, optimisticId: node.id };
    },
    onError: (_err, _app, ctx) => {
      if (ctx) qc.setQueryData(chapterKeys.list(), ctx.previous);
    },
  });
}
