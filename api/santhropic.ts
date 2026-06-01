import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ anthropic: typeof Anthropic });
}
