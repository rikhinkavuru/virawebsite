import type { VercelRequest, VercelResponse } from "@vercel/node";

// Temporary diagnostic. Self-contained (no runtime relative/JSON imports), so it
// loads even when the other functions don't, and reports WHY they fail.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const out: Record<string, unknown> = {
    node: process.version,
    // "function" => CJS or bundled; "undefined" => native ESM (unbundled)
    requireType: typeof require,
  };
  const probe = async (label: string, path: string) => {
    try {
      const m = (await import(path)) as Record<string, unknown>;
      out[label] = "ok keys=" + Object.keys(m).slice(0, 6).join(",");
    } catch (e) {
      const err = e as { code?: string; message?: string };
      out[label] = "ERR " + (err?.code ?? "") + " :: " + String(err?.message ?? e).slice(0, 240);
    }
  };
  await probe("schema", "../src/lib/schema");
  await probe("http", "./_lib/http");
  await probe("json", "../src/data/chapters.json");
  await probe("chapters", "./chapters");
  res.status(200).json(out);
}
