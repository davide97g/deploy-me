# Caffè del Deploy

**Dal caos al commit. Un caffè alla volta.**

Monorepo demo for multi-platform deploy tutorials. Four connected apps themed as an Italian coffee bar — throw chaotic dev notes at the counter, get polished copy back from the Kimi barista.

```
Vetrina (Astro)  →  Bancone (React)  →  Cucina (Hono)  →  Macinino (FastAPI/Kimi)
   Netlify              Vercel              Render              Fly.io
```

## Apps

| App | Folder | Stack | Deploy target |
|-----|--------|-------|---------------|
| Vetrina | `apps/landing` | Astro | Netlify |
| Bancone | `apps/web` | React + Vite | Vercel |
| Cucina | `apps/api` | Hono | Render (alt: Railway) |
| Macinino | `apps/engine` | FastAPI + Kimi | Fly.io |

## Local development

### Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.12+ (for engine)

### Setup

```bash
pnpm bootstrap
cp .env.example .env   # optional — per-app .env files already work for local dev
```

`bootstrap` installs Node deps and creates the Python venv at `apps/engine/.venv`.

Per-app env files (already created for local dev):

```bash
# apps/web/.env
VITE_API_URL=http://localhost:3000

# apps/landing/.env
PUBLIC_WEB_URL=http://localhost:5173

# apps/api/.env
WEB_ORIGIN=http://localhost:5173
ENGINE_URL=http://localhost:8000
```

### Run everything (one command)

```bash
pnpm dev:all
```

If ports are stuck from a previous session: `pnpm dev:stop` then retry.

This starts all four services:

| Service | URL |
|---------|-----|
| Vetrina (landing) | http://localhost:4321 |
| Bancone (web) | http://localhost:5173 |
| Cucina (api) | http://localhost:3000 |
| Macinino (engine) | http://localhost:8000 |

Or run JS apps and engine separately:

```bash
pnpm dev          # landing + web + api
pnpm dev:engine   # Python engine only
```

Without `MOONSHOT_API_KEY`, the engine runs in mock mode.

### Build

```bash
pnpm build
```

## Environment variables

| Variable | App | Description |
|----------|-----|-------------|
| `PUBLIC_WEB_URL` | landing | CTA link to web app |
| `VITE_API_URL` | web | API base URL |
| `WEB_ORIGIN` | api | CORS origin (web URL) |
| `ENGINE_URL` | api | Engine base URL |
| `MOONSHOT_API_KEY` | engine | Kimi / Moonshot API key |
| `PORT` | api, engine | Server port |

## Deploy checklist (YouTube script)

### 1. Macinino — Fly.io

```bash
cd apps/engine
fly launch --no-deploy  # or fly apps create caffe-del-deploy-engine
fly secrets set MOONSHOT_API_KEY=sk-...
fly deploy
```

Note the URL: `https://caffe-del-deploy-engine.fly.dev`

### 2. Cucina — Render

1. Connect GitHub repo on Render
2. Use `apps/api/render.yaml` or create a Web Service:
   - Root: `apps/api`
   - Build: `cd ../.. && pnpm install && pnpm --filter @caffe-del-deploy/api build`
   - Start: `node dist/index.js`
3. Set env: `ENGINE_URL`, `WEB_ORIGIN`

### 3. Bancone — Vercel

1. Import repo, set **Root Directory** to `apps/web`
2. Set `VITE_API_URL` to your Render API URL
3. Deploy

### 4. Vetrina — Netlify

1. Connect repo
2. Base directory: `apps/landing` (or use `netlify.toml`)
3. Set `PUBLIC_WEB_URL` to your Vercel web URL
4. Deploy

### 5. Bonus — Cucina on Railway

1. New project from repo, set root to `apps/api`
2. Same env vars as Render
3. Redeploy — same bar, different kitchen

### 6. Auto-deploy

Push to `main`. Netlify, Vercel, and Render redeploy via Git hooks. Fly.io can use the included GitHub Action (set `FLY_API_TOKEN` secret).

## API

### `GET /health` (api)

```json
{ "status": "aperto", "macinino": "online" }
```

### `POST /ordina` (api)

Request:

```json
{ "note": "il mio readme fa schifo aiutami" }
```

Response:

```json
{ "risultato": "..." }
```

## License

MIT
