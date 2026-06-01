import type { ZodType } from "zod";
import { ApiErrorSchema } from "./schema";

/** Structured error every data hook can branch on by `code` / `status`. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export interface FetchJsonOptions<T> extends Omit<RequestInit, "signal"> {
  /** When provided, the response body is validated at the boundary. */
  schema?: ZodType<T>;
  timeoutMs?: number;
  retries?: number;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Exponential backoff with jitter, capped at 3s. */
function backoff(attempt: number): number {
  return Math.min(400 * 2 ** attempt, 3000) + Math.random() * 200;
}

/**
 * fetch() wrapper with: AbortController timeout, exponential-backoff retries on
 * transient failures (429 / 5xx / network), a structured ApiError, and optional
 * zod validation of the response. The single choke point for all client→API I/O.
 */
export async function fetchJson<T = unknown>(
  path: string,
  options: FetchJsonOptions<T> = {},
): Promise<T> {
  const { schema, timeoutMs = 8000, retries = 2, headers, ...init } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(path, {
        ...init,
        signal: controller.signal,
        headers: { "content-type": "application/json", ...headers },
      });
      clearTimeout(timer);

      const raw = await res.text();
      const json = raw ? JSON.parse(raw) : null;

      if (!res.ok) {
        const parsed = ApiErrorSchema.safeParse(json);
        const error = new ApiError(
          parsed.success ? parsed.data.error : `Request failed (${res.status})`,
          parsed.success ? parsed.data.code : "http_error",
          res.status,
        );
        const transient = res.status === 429 || res.status >= 500;
        if (transient && attempt < retries) {
          lastError = error;
          await sleep(backoff(attempt));
          continue;
        }
        throw error;
      }

      return schema ? schema.parse(json) : (json as T);
    } catch (err) {
      clearTimeout(timer);
      // ApiError here is already classified as non-retryable (the retryable path
      // `continue`s above and never throws).
      if (err instanceof ApiError) throw err;
      // Network failure, abort/timeout, or malformed JSON -> retry.
      lastError = err;
      if (attempt < retries) {
        await sleep(backoff(attempt));
        continue;
      }
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new ApiError("Network request failed", "network_error", 0);
}
