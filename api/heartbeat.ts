import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * GET /api/heartbeat — a real external API (GitHub REST) framed as the network's
 * "infrastructure heartbeat". Server-side token (never in the bundle), edge-cached,
 * and on any rate-limit/error returns status "unknown" with 200 so the UI never
 * blanks. Self-contained (no local imports — see api/chapters.ts).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Use GET.", code: "method_not_allowed" });
    return;
  }
  const repo = process.env.GITHUB_REPO ?? "rikhinkavuru/virawebsite";
  const token = process.env.GITHUB_TOKEN;
  const checkedAt = new Date().toISOString();
  const unknown = {
    status: "unknown" as const,
    lastCommit: null,
    openIssues: null,
    stars: null,
    source: repo,
    checkedAt,
  };

  try {
    const r = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        "user-agent": "vira-hacks-site",
        accept: "application/vnd.github+json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    if (!r.ok) {
      res.status(200).json(unknown);
      return;
    }
    const data = (await r.json()) as {
      pushed_at?: string;
      open_issues_count?: number;
      stargazers_count?: number;
      full_name?: string;
    };
    res.status(200).json({
      status: "online",
      lastCommit: data.pushed_at ?? null,
      openIssues: data.open_issues_count ?? null,
      stars: data.stargazers_count ?? null,
      source: data.full_name ?? repo,
      checkedAt,
    });
  } catch {
    res.status(200).json(unknown);
  }
}
