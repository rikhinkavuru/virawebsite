# Vira Hacks

The marketing + operations site for **Vira Hacks** — a student-run network of
high-school healthcare hackathon chapters (live at [virahacks.com](https://virahacks.com)).
An interactive US map of chapter "nodes", a roster of chapter presidents, an
AI mentor that generates buildable hackathon ideas, and a chapter-application
flow — wrapped in a network-infrastructure / terminal aesthetic.

## Stack

- **React 18 + TypeScript + Vite** SPA, **React Router** v6
- **TanStack Query** (React Query) for the data layer — typed hooks, caching,
  optimistic mutations
- **Tailwind CSS** (utilities layered over a bespoke design system) + **shadcn/ui** primitives
- **Vercel Serverless Functions** (`/api`, TypeScript) for the backend — same repo, same deploy
- **Zod** as the single source of truth for the client ↔ server data contract
- **Anthropic**, **Neon Postgres**, **Resend**, and the **GitHub REST API** as integrations
- **Vitest** + Testing Library; **next-themes** for dark mode; **Framer Motion** for interactions

## Architecture

```
src/
  lib/
    schema.ts        zod schemas + inferred types (imported by client AND /api)
    stats.ts         deriveStats() — metrics computed from data, not hardcoded
    apiClient.ts     fetch wrapper: timeout, backoff+retry, zod parse, typed ApiError
    flags.ts         feature flags (ship dark, degrade gracefully)
  data/
    chapters.json    the network roster (single source of truth)
    chapters.ts      validated, typed exports + placeholderData
  hooks/
    useChapters / useStats / useHeartbeat        typed react-query reads
    useMentor / useApplyToChapter                typed mutations (one optimistic)
  components/network/
    NetworkSection   the interactive US map (code-split / lazy)
    MentorPanel      AI idea generator UI (all loading/empty/error/rate-limited states)
    ApplyForm        react-hook-form + zod, optimistic "pending node" on submit
api/
  chapters / stats / heartbeat                   typed serverless reads (edge-cached)
  mentor                                         Anthropic, behind a hard cost cap
  apply                                          Neon persistence + Resend email
  _lib/                                          db, usage/rate-limit, http helpers
server/server.mjs    local dev shim mirroring the /api functions (Vite proxies /api -> :3001)
```

**Data flow (one request, every layer):** GitHub/serverless handler → zod boundary
→ `react-query` hook (cache + `placeholderData` + backoff) → accessible UI with
explicit loading / empty / error / success states. Every read hook falls back to the
bundled static array, so a total API outage degrades to the original static page.

## The AI mentor's cost ceiling

The `/api/mentor` endpoint is publicly exposed but provably bounded to **≤ $0.50**:

1. An account-level **$0.50 workspace spend limit** in the Anthropic console (hard backstop)
2. The cheapest capable model (`claude-haiku-4-5`) + `max_tokens: 256` + prompt caching
3. A **global generation counter** (Postgres) that disables generation at a configurable cap
4. A **per-IP rate limit**
5. A **response cache** — identical prompts never re-bill

## Local development

```bash
npm install
cp .env.example .env   # optional; every feature degrades gracefully without keys
npm run dev            # Vite on :8080 + the /api dev shim on :3001
```

Quality gates:

```bash
npm run build            # production build
npm run typecheck:strict # strict TypeScript on all new code (api/, src/lib, src/hooks, src/data)
npm test                 # Vitest
```

## Deployment

Deploys to **Vercel** as a static SPA with co-located `/api` serverless functions —
one `git push`, no separate backend host. The new live-data features are gated behind
`VITE_FEATURE_LIVE_NETWORK` and each backend integration self-disables (HTTP 503
`not_configured`) when its env var is absent, so the site stays deployable with zero
keys configured. Required env vars are documented in [`.env.example`](./.env.example).
