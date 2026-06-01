import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, "../src/data/chapters.json"), "utf8"));

// Mirrors src/lib/stats.ts so dev metrics match production.
function deriveStats(chapters) {
  const active = chapters.filter((c) => c.status === "active");
  return {
    total_nodes: chapters.length,
    total_deployments: active.length,
    total_users: active.reduce((sum, c) => sum + (c.attendees ?? 0), 0),
  };
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * Local-dev API shim. The Vite dev server proxies /api -> :3001 (vite.config.ts),
 * so this mirrors the Vercel serverless functions in api/ for local development
 * without needing `vercel dev`. Mentor/apply return mock responses so the UI's
 * happy path is testable without live keys; the real functions run on Vercel.
 */
app.get("/api/chapters", (_req, res) => res.json({ chapters: data.chapters }));
app.get("/api/stats", (_req, res) => res.json(deriveStats(data.chapters)));
app.get("/api/heartbeat", (_req, res) =>
  res.json({
    status: "unknown",
    lastCommit: null,
    openIssues: null,
    stars: null,
    source: process.env.GITHUB_REPO || "rikhinkavuru/virawebsite",
    checkedAt: new Date().toISOString(),
  }),
);
app.post("/api/mentor", (req, res) => {
  const topic = (req.body?.topic || "").toString().trim();
  if (topic.length < 3) {
    return res.status(400).json({ error: "Give me a few words to work with.", code: "invalid_input" });
  }
  const t = topic.charAt(0).toUpperCase() + topic.slice(1);
  res.json({
    idea: `[dev mock] ${t} Triage Companion — a phone-first tool that helps clinic staff prioritize ${topic} cases with a simple risk score. Build: React + a small rules API. Stretch: SMS reminders for follow-ups.`,
    cached: false,
    remaining: 99,
  });
});
app.post("/api/apply", (req, res) => {
  const b = req.body || {};
  if (b.company) return res.json({ ok: true }); // honeypot
  if (!b.name || !b.email || !b.school || !b.state || !b.city) {
    return res.status(400).json({ error: "Please check the form.", code: "invalid_input" });
  }
  res.status(201).json({ ok: true });
});

app.listen(port, () => {
  console.log(`Dev API shim on http://localhost:${port} (mirrors /api functions)`);
});
