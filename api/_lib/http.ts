import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Uniform error envelope (matches ApiErrorSchema on the client). */
export function sendError(
  res: VercelResponse,
  status: number,
  code: string,
  error: string,
): void {
  res.status(status).json({ error, code });
}

export function methodNotAllowed(
  req: VercelRequest,
  res: VercelResponse,
  allowed: string,
): boolean {
  if (req.method !== allowed) {
    res.setHeader("Allow", allowed);
    sendError(res, 405, "method_not_allowed", `Use ${allowed}.`);
    return true;
  }
  return false;
}

/** Best-effort client IP for rate limiting (Vercel sets x-forwarded-for). */
export function getClientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0];
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real.length > 0) return real;
  return req.socket?.remoteAddress ?? "unknown";
}
