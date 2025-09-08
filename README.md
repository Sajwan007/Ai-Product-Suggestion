# AI Product Recommendation (React + Vite + Gemini)

A React (Vite) app with an AI-powered product recommendation API. Uses Google Gemini when available and falls back to a deterministic local matcher.

## Features
- AI-first recommendations via Google Gemini (`@google/generative-ai`)
- Local fallback: budget extraction + keyword/synonym scoring
- Clean UI with filters and AI suggestions
- Vercel-ready serverless API at `api/recommend.ts`

## Stack
- Frontend: React + Vite + Tailwind utilities
- Dev API: Express (`server.js`)
- Prod API (Vercel): `api/recommend.ts`

## Quick Start (Local)
1) Install dependencies
```bash
npm install
```

2) Create `.env` in project root
```bash
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

3) Start the API (dev server)
```bash
node server.js
```
- API runs at http://localhost:5000

4) Start the frontend (Vite)
```bash
npm run dev
```
- App runs at http://localhost:5173
- Vite proxy (`vite.config.ts`) forwards `/api` → `http://localhost:5000`

## API
### POST /api/recommend
Body:
```json
{
  "query": "phone under 500",
  "products": [
    { "id": 1, "name": "...", "price": 299, "category": "phone", "brand": "..." }
  ]
}
```
Response:
```json
{
  "recommendations": [ { "id": 3, "name": "...", "price": 299, "category": "phone" } ]
}
```
Behavior:
- If `GEMINI_API_KEY` is set, tries Gemini first (model: `gemini-1.5-flash`).
- If Gemini fails/returns invalid JSON or no IDs, falls back to local scoring.
- Local matcher extracts budget (e.g., “under 500”), normalizes/synonymizes terms, scores by name/brand/category, then returns top matches within budget.

## Deploy to Vercel
This repo includes a serverless function: `api/recommend.ts`.

Steps:
1) Push this repo to GitHub.
2) On Vercel: Import Project
- Framework Preset: Vite
- Build Command: `vite build`
- Output Directory: `dist`
3) Set Environment Variable:
- `GEMINI_API_KEY=your_gemini_api_key`
4) Deploy

Notes:
- In production on Vercel, the client calls `/api/recommend` served by `api/recommend.ts`. You do not need `server.js` there.
- For local dev, continue using `node server.js` + Vite with proxy.

## Troubleshooting
- Tailwind/PostCSS error: ensure `src/index.css` is imported from `src/main.tsx`, and do not `@import "tailwindcss"` in other CSS files.
- Module export errors (UI): primitives are implemented under `src/components/ui/` (`button`, `card`, `input`, `badge`, `label`, `select`, `slider`).
- React version/peer deps: if npm install fails, try `--legacy-peer-deps` or align React to 18.x.
- API key issues: verify `GEMINI_API_KEY` is set; server logs will fall back to local recommendations when unavailable.

## License
MIT
