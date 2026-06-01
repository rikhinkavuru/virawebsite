import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ resend: typeof Resend });
}
