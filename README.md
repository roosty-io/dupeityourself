# Dupe It Yourself 🔨

**Turn expensive inspiration into a custom DIY build plan.**

Paste a product link or upload photos of something expensive you want to recreate.
Dupe It Yourself analyzes the reference, scores whether the project is worth
building, creates multiple build paths, adapts the plan to your tools and budget,
generates a store-ready shopping list, creates cut instructions, walks you through
the build, and helps troubleshoot problems along the way.

Every plan is an original, brand-safe, **inspired-by** guide — not a replica of any
protected design.

## Quick start

```bash
npm install
npm run dev
```

- Client: http://localhost:5173 (Vite dev server, proxies `/api` to the server)
- Server: http://localhost:3001 (Express API)

The app works fully **without any API keys** — the AI pipeline runs in mock mode
with a high-quality template engine, and ships with a complete demo project
(a designer oak pedestal dining table inspired build: reference retail ≈ $3,999 →
DIY $580–$840).

### Production build

```bash
npm run build   # builds client to dist/public and bundles server to dist/server.js
npm start       # serves API + built client on :3001
```

### Type checking

```bash
npm run typecheck
```

## Environment variables

Copy `.env.example` to `.env`. All variables are optional:

| Variable | Default | Purpose |
|---|---|---|
| `AI_PROVIDER` | `mock` | `anthropic`, `openai`, or `mock` |
| `USE_MOCK_AI` | `true` | Set `false` (with a key) to enable real LLM calls |
| `ANTHROPIC_API_KEY` | — | Anthropic API key |
| `ANTHROPIC_MODEL` | `claude-sonnet-5` | Model used for real AI calls |
| `OPENAI_API_KEY` | — | OpenAI API key (alternative provider) |
| `PORT` | `3001` | API server port |

## Architecture

```
client/           React 18 + Vite + Tailwind (warm DIY design system)
  src/pages/      Landing, wizard, plan manual, library, gallery, settings…
  src/components/ ui primitives, wizard steps, 30+ plan section components
server/
  index.ts        Express bootstrap (serves built client in production)
  routes.ts       REST API (projects, pipeline, refine, chat, exports…)
  storage.ts      File-backed storage (swap-ready interface for Postgres)
  ai/
    llmClient.ts  Provider abstraction (Anthropic / OpenAI / mock)
    pipeline.ts   25-stage agent pipeline with live progress
    agents/       One module per expert agent (intake, vision, materials,
                  engineering, cost, shopping, cuts, finish, safety, QA…)
  exports/        Markdown build manual, store cut sheet, handoff brief, CSV
  data/           Flagship demo plan, dupe library, gallery seed data
shared/
  types.ts        Single source of truth for all structured plan data
  constants.ts    Stages, tool/store options, legal disclaimer, feature flags
```

### The AI agent pipeline

Plan generation runs a staged pipeline (intake → vision → classification →
feasibility → worth-it scoring → build paths → materials → swaps → engineering →
tools/skill → tool adaptation → cost → shopping → cut optimization → finish
matching → instructions → diagrams → safety → safety design review →
alternatives → mistake prevention → mini lessons → builder handoff → QA →
compose). Each agent is a modular unit with a real prompt scaffold for LLM mode
and a deterministic mock implementation, so the whole system can be upgraded to
per-agent LLM calls without restructuring.

## Safety & IP guardrails

- Plans use "inspired-by" language only; no logos/trademarks are reproduced.
- High-risk categories (structural, electrical, children's cribs/bunks, etc.)
  get conservative warnings or are unsupported.
- Load claims are conservative; users are pointed to professionals for
  structural/load-rated needs.
- A legal/safety disclaimer is shown in the app footer.
