import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { ApplicationSchema, type Application } from "../src/lib/schema";
import { getDb, ensureSchema } from "./_lib/db";
import { consumeApplyQuota } from "./_lib/usage";
import { getClientIp, methodNotAllowed, sendError } from "./_lib/http";

/** POST /api/apply — persist a chapter application + email notifications.
 *  Applications are private/pending: they are NOT added to the public /api/chapters
 *  list, so there is no way to spam the live map. Honeypot + per-IP throttle guard
 *  the endpoint. Email is best-effort and never fails the request. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (methodNotAllowed(req, res, "POST")) return;

  const sql = getDb();
  if (!sql) return sendError(res, 503, "not_configured", "Applications are not configured yet.");

  const parsed = ApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "invalid_input", parsed.error.issues[0]?.message ?? "Please check the form.");
  }
  const app = parsed.data;

  // Honeypot tripped -> silently accept so bots can't distinguish success.
  if (app.company && app.company.length > 0) {
    return res.status(200).json({ ok: true });
  }

  try {
    await ensureSchema(sql);
    if (!(await consumeApplyQuota(sql, getClientIp(req)))) {
      return sendError(res, 429, "rate_limited", "Too many submissions — please try again later.");
    }
    await sql`INSERT INTO applications (name, email, school, state, city, message)
      VALUES (${app.name}, ${app.email}, ${app.school}, ${app.state}, ${app.city}, ${app.message ?? null})`;
    await sendEmails(app).catch(() => {/* email is best-effort */});
    return res.status(201).json({ ok: true });
  } catch {
    return sendError(res, 500, "server_error", "Could not submit your application.");
  }
}

async function sendEmails(app: Application): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const resend = new Resend(key);
  const from = process.env.RESEND_FROM ?? "Vira Hacks <onboarding@resend.dev>";
  const founder = process.env.FOUNDER_EMAIL ?? "rikhinkavuru@gmail.com";

  await resend.emails.send({
    from,
    to: founder,
    replyTo: app.email,
    subject: `New chapter application: ${app.school} (${app.city}, ${app.state})`,
    text: `${app.name} <${app.email}> wants to host a Vira chapter at ${app.school}, ${app.city}, ${app.state}.\n\n${app.message || "(no message)"}`,
  });

  // Applicant confirmation — only delivers on the free tier if `from` is a
  // verified domain; harmless no-op otherwise.
  await resend.emails.send({
    from,
    to: app.email,
    subject: "We received your Vira Hacks chapter application",
    text: `Hi ${app.name},\n\nThanks for applying to host a Vira Hacks chapter at ${app.school}. Your node is marked pending while we review it — we'll be in touch soon.\n\n— The Vira Hacks network`,
  });
}
