import { z } from "zod";

/**
 * Single source of truth for the data contract.
 * Imported by BOTH the React client and the /api serverless functions, so the
 * shape can never drift between the two. Keep this module dependency-free
 * (only `zod`) and free of the `@/` path alias so the Vercel function bundler
 * can resolve it with a plain relative import.
 */

export const ChapterStatus = z.enum(["active", "pending"]);
export type ChapterStatus = z.infer<typeof ChapterStatus>;

export const ChapterSchema = z.object({
  id: z.string(),
  name: z.string(),
  loc: z.string(),
  status: ChapterStatus,
  /** [longitude, latitude] for react-simple-maps Marker. */
  coordinates: z.tuple([z.number(), z.number()]),
  event: z.string().optional(),
  date: z.string().optional(),
  attendees: z.number().optional(),
  website: z.string().url().optional(),
  info: z.string(),
  /** Marks a client-only optimistic node so the UI can style/label it. */
  optimistic: z.boolean().optional(),
});
export type Chapter = z.infer<typeof ChapterSchema>;

export const OperatorSchema = z.object({
  name: z.string(),
  school: z.string(),
  role: z.string(),
  uptime: z.string(),
  status: ChapterStatus,
});
export type Operator = z.infer<typeof OperatorSchema>;

export const StatsSchema = z.object({
  total_nodes: z.number(),
  total_deployments: z.number(),
  total_users: z.number(),
});
export type Stats = z.infer<typeof StatsSchema>;

export const ChaptersResponseSchema = z.object({
  chapters: z.array(ChapterSchema),
});
export type ChaptersResponse = z.infer<typeof ChaptersResponseSchema>;

/** GitHub-backed "network heartbeat" — degrades to `unknown` on rate-limit/error. */
export const HeartbeatSchema = z.object({
  status: z.enum(["online", "degraded", "unknown"]),
  lastCommit: z.string().nullable(),
  openIssues: z.number().nullable(),
  stars: z.number().nullable(),
  source: z.string(),
  checkedAt: z.string(),
});
export type Heartbeat = z.infer<typeof HeartbeatSchema>;

export const MentorRequestSchema = z.object({
  topic: z.string().trim().min(3, "Give me a few words to work with.").max(200),
});
export type MentorRequest = z.infer<typeof MentorRequestSchema>;

export const MentorResponseSchema = z.object({
  idea: z.string(),
  cached: z.boolean(),
  /** Remaining global generations before the demo cap; -1 when served from cache. */
  remaining: z.number(),
});
export type MentorResponse = z.infer<typeof MentorResponseSchema>;

export const ApplicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email."),
  school: z.string().trim().min(2, "Which school?").max(120),
  state: z.string().trim().length(2, "Pick a state."),
  city: z.string().trim().min(2, "Which city?").max(120),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  /** Honeypot — real users never fill this; bots do. Must be empty. */
  company: z.string().max(0).optional().or(z.literal("")),
});
export type Application = z.infer<typeof ApplicationSchema>;

export const ApplyResponseSchema = z.object({ ok: z.boolean() });
export type ApplyResponse = z.infer<typeof ApplyResponseSchema>;

/** Uniform error envelope every /api function returns on failure. */
export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});
export type ApiErrorBody = z.infer<typeof ApiErrorSchema>;
