# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Caffè del Deploy** — a demo monorepo for multi-platform deploy tutorials, themed as an Italian coffee bar. A user throws chaotic dev notes at the web app and gets polished Italian copy back from an LLM "barista". Each of the four apps is deliberately deployed to a *different* host (that's the point of the demo).

## The request chain

The whole app is a proxy chain — each service forwards to the next:

```
Vetrina (Astro :4321) ──link──▶ Bancone (React/Vite :5173)
                                       │ POST /ordina {note}
                                       ▼
                                Cucina (Hono :3000)
                                       │ POST /macina {note}
                                       ▼
                                Macinino (FastAPI :8000) ──▶ Kimi/Moonshot LLM
```

| App | Folder | Stack | Port | Deploy target | Config |
|-----|--------|-------|------|---------------|--------|
| Vetrina | `apps/landing` | Astro | 4321 | Netlify | `netlify.toml` |
| Bancone | `apps/web` | React 19 + Vite | 5173 | Vercel | `vercel.json` |
| Cucina | `apps/api` | Hono | 3000 | Render (alt: Railway) | `render.yaml`, `railway.toml` |
| Macinino | `apps/engine` | FastAPI + OpenAI SDK | 8000 | Fly.io | `fly.toml`, `Dockerfile` |
| Cassa (Stats) | `apps/stats` | React 19 + Vite | 5174 | TBD (Supabase direct) | — |

**Naming shift across the boundary:** web↔api speak `OrdinaRequest`/`OrdinaResponse` (`note` → `risultato`); api↔engine speak `MacinaRequest`/`MacinaResponse`. The api (`apps/api/src/index.ts`) translates `/ordina` into a call to the engine's `/macina`. Keep this in mind when changing payloads — types live in `packages/shared/src/index.ts` for the Node side only; the engine defines its own Pydantic models.

## Critical architecture facts

- **The engine is NOT in the pnpm/turbo graph.** It's Python, managed by a venv at `apps/engine/.venv`. `pnpm dev` / `pnpm build` / `turbo build` only touch the three Node apps. The engine is run/built/deployed separately.
- **Shared workspace packages** (consumed only by Node apps): `@caffe-del-deploy/shared` (TS interfaces, imported as source `.ts`, no build step) and `@caffe-del-deploy/theme` (raw CSS tokens, fonts, SVG logo — no JS).
- **Engine has a mock fallback.** With no `MOONSHOT_API_KEY` set, `/macina` returns a `[MOCK]` response instead of calling Kimi. This is why local dev works with zero secrets — don't "fix" the missing key.
- **No tests, no linter.** `lint` scripts are `echo` stubs; there is no test runner. The real check is `typecheck` (`tsc --noEmit`). CI = `turbo lint typecheck build` + a one-line engine import smoke test.
- **Stats (Cassa) bypasses the request chain.** It does NOT call api/engine — it reads its data "directly from the database (serverless)" in the browser. Today that's a **mock Supabase client** in `apps/stats/src/lib/supabase.ts` (seeded fake rows, same `from().select()` shape as `supabase-js`). The real Supabase swap is predisposed/commented there + in `.env` (`VITE_SUPABASE_*`); it's mock-only by design — don't wire the real client unless asked.

## Commands

```bash
pnpm bootstrap        # install Node deps + create engine venv + pip install (run once)
pnpm dev:all          # run ALL five services (concurrently). Frees ports first.
pnpm dev              # turbo dev — four Node apps only, NO engine
pnpm dev:engine       # engine alone (sets up venv + uvicorn --reload :8000)
pnpm dev:stop         # kill anything on ports 3000/4321/5173/5174/8000
pnpm build            # turbo build — Node apps only
pnpm typecheck        # turbo typecheck — the real correctness gate
```

If `dev:all` fails with a port-in-use error, run `pnpm dev:stop` and retry (`scripts/kill-ports.sh`).

Run one app directly with a filter, e.g. `pnpm --filter @caffe-del-deploy/api dev`.

Engine-only Python work: `cd apps/engine && .venv/bin/uvicorn main:app --reload --port 8000`.

## Env vars

Per-app `.env` files already exist for local dev. Root `.env.example` documents all of them. Notable: `VITE_API_URL` (web→api), `WEB_ORIGIN` (api CORS), `ENGINE_URL` (api→engine), `MOONSHOT_API_KEY` (engine; optional locally — triggers real Kimi vs mock).

## Deploy

- **Engine** auto-deploys to Fly.io via `.github/workflows/deploy-engine.yml` on push to `apps/engine/**` (needs `FLY_API_TOKEN` secret).
- The other three deploy via their host's git integration using the config files in each app folder. Render/Railway build the api from the monorepo root (`cd ../.. && pnpm install && pnpm --filter ... build`). Full step-by-step is in `README.md`.
