import { useMutation } from "@tanstack/react-query";
import { fetchJson, ApiError } from "@/lib/apiClient";
import { MentorResponseSchema, type MentorResponse } from "@/lib/schema";

/** AI mentor mutation. Retries are off — a paid, quota'd endpoint should fail
 *  fast and surface the reason (rate_limited / cap_reached / not_configured). */
export function useMentor() {
  return useMutation<MentorResponse, ApiError, string>({
    mutationFn: (topic: string) =>
      fetchJson("/api/mentor", {
        method: "POST",
        body: JSON.stringify({ topic }),
        schema: MentorResponseSchema,
        retries: 0,
      }),
  });
}
