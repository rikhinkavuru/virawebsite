import { describe, it, expect, vi, afterEach } from "vitest";
import { z } from "zod";
import { fetchJson, ApiError } from "./apiClient";

afterEach(() => vi.restoreAllMocks());

describe("fetchJson", () => {
  it("validates a successful response against the schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
    const data = await fetchJson("/x", { schema: z.object({ ok: z.boolean() }) });
    expect(data.ok).toBe(true);
  });

  it("throws a typed ApiError carrying the server's code on a 4xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "slow down", code: "rate_limited" }), { status: 429 })),
    );
    await expect(fetchJson("/x", { retries: 0 })).rejects.toMatchObject({
      code: "rate_limited",
      status: 429,
    });
    await expect(fetchJson("/x", { retries: 0 })).rejects.toBeInstanceOf(ApiError);
  });
});
