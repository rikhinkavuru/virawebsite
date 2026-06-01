import type { VercelRequest, VercelResponse } from "@vercel/node";

// Temporary diagnostic: which npm package imports resolve at runtime?
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const out: Record<string, string> = { node: process.version, requireType: typeof require };
  const probe = async (name: string, spec: string) => {
    try {
      const m = (await import(spec)) as Record<string, unknown>;
      out[name] = "ok keys=" + Object.keys(m).slice(0, 6).join(",");
    } catch (e) {
      const x = e as { code?: string; message?: string };
      out[name] = "ERR " + (x.code ?? "") + " :: " + String(x.message ?? e).slice(0, 200);
    }
  };
  await probe("zod", "zod");
  await probe("neon", "@neondatabase/serverless");
  await probe("anthropic", "@anthropic-ai/sdk");
  await probe("resend", "resend");
  res.status(200).json(out);
}
