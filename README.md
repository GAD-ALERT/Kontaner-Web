# Kontaner

A Freepik-style creative asset library for the Ghanaian creative community, with AI-tagged uploads, natural-language search, and client-side color extraction. Built as a polished FYP-ready prototype with React 19, TypeScript, Vite, motion/react, and Zustand.

> **Status**: Frontend prototype with rich mock data, fake-AI flows wired end-to-end (no backend required). All "AI" behaviors run locally — see [How the AI works](#how-the-ai-works).

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build      # Production build
npm run lint       # ESLint
```

No environment variables required.

---

## What's in the box

| Surface | Route | What works |
| --- | --- | --- |
| Discover (landing) | `/` | Cinematic hero with Ken-Burns background, animated category mega-strip, trending row, featured collections, dense browse grid with real photos, free/premium toggle |
| Asset detail | `/asset/:id` | Per-asset detail, AI Insight panel, real client-side dominant-color palette (click to copy hex), similar-assets row, AI-generated tags, soft-gated download |
| Search | `/search?q=…` | **Natural-language ranking** with synonym expansion, match score badges per card, matched-tag highlighting, refinement chips |
| Upload | `/upload` *(auth)* | Drop a file → fake progress bar → "AI processing…" → tags stream in one-by-one → real palette extraction → editorial insight |
| Library | `/library` *(auth)* | Filter pills (Photos / Videos / Illustrations / 3D / Recent), sort menu, grid ↔ list view toggle |
| Collections | `/collections` *(auth)* | Workspace sidebar + new-collection modal |
| Account | `/settings` *(auth)* | Profile, storage donut, largest files |
| Login / Signup / Forgot | `/login` `/signup` `/forgot` | Polished split-panel auth (sign-in flows to `/` via Zustand) |

**Soft auth**: anyone can browse; clicking Download / Save / Upload while logged out triggers a login modal (spring entrance). "Continue as guest" creates a local session.

---

## How the AI works

There's no LLM call anywhere. Every "AI" feature is a deterministic local engine designed to feel real at demo time:

### 1. Natural-language search — [`src/lib/search.ts`](src/lib/search.ts)
- Tokenises the query, strips stopwords (`with`, `for`, `of`, …)
- Expands each token through a ~50-entry synonym map (`kente↔textile↔weave`, `market↔commerce↔vendor↔makola`, `bold↔vibrant↔vivid↔colorful`)
- Scores each asset: tag exact +5, tag substring +3, title +2, owner +1, asset-type match +4, popularity tiebreaker
- `relatedTags()` mines the top recurring tags from the result set for one-click refinement chips

**Try it**: search for `"market scenes with bold colors"` — top match scores around 17 with the `Market`, `Commerce`, and `Color` tags highlighted in green.

### 2. AI tag streaming on upload — [`src/lib/fakeAI.ts`](src/lib/fakeAI.ts)
- 9 theme profiles (kente, market, portrait, urban, aerial, food, nature, adinkra, afrobeat)
- `planTagsFor(filename)` matches the filename against themes, returns 5–7 deterministic tags + an editorial-voice insight
- `streamTags()` is an async generator that yields each tag with a 220ms beat so the UI watches them pop in

**Try it**: upload anything called `kente_*` and watch heritage-aware tags appear live.

### 3. Client-side color extraction — [`src/hooks/useDominantColors.ts`](src/hooks/useDominantColors.ts)
- Real `colorthief` v3 palette extraction running fully in the browser, no API
- Used on asset detail pages and the upload "Extracted palette" panel
- Click any swatch to copy the hex

---

## Architecture

```
src/
├── App.tsx                 — Page-transition wrapper (AnimatePresence)
├── main.tsx                — Entry + 7 layered stylesheets
├── components/             — Layout, AssetCard, LoginGate, Skeleton
├── pages/                  — 9 route components
├── routes/                 — react-router config + ProtectedRoute guard
├── stores/                 — Zustand: auth (persisted), favorites, loginGate
├── lib/                    — search.ts, fakeAI.ts, motion.ts (shared variants)
├── hooks/                  — useFakeLoad, useDominantColors
├── data/assets.ts          — 50 mock assets with picsum-seeded image URLs
└── types/                  — Asset, Collection, Route, NavigateFn
```

### Stylesheet strategy
Day-by-day overlays on a base `styles.css`:

```
styles.css         — base tokens + layout
styles-day1.css    — auth shell + Discover-as-landing
styles-day2.css    — skeleton, library list view, sort menu
styles-day3.css    — image overlays + dominant-color UI
styles-day4.css    — hover lifts, Ken-Burns, reduced-motion
styles-day5.css    — AI-pulse loader, match badges, refine chips
styles-day6.css    — upload streaming flow + responsive breakpoints
```

This will get refactored into per-page modules post-FYP.

---

## Demo script (5 minutes)

See [`DEMO.md`](DEMO.md) for the full walkthrough. Short version:

1. **Land on `/`** — point out the cinematic hero, scroll through trending → categories → browse grid
2. **Click any card** — show the detail page, then call out the **real dominant-color palette** ("this isn't a static design — it's pulled from the image in your browser")
3. **Search** `"market scenes with bold colors"` — show the match badges, refinement chips, matched-tag highlighting
4. **Upload** any image — narrate as the progress bar runs, then the tags stream in, then the editorial insight appears
5. **Toggle a saved bookmark, sign in as guest, hit `/library`** — show the filter + sort + grid/list polish

---

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **react-router-dom** v6
- **motion/react** (Framer Motion successor) for entrance animations + page transitions
- **Zustand** + `persist` middleware for local auth + favorites
- **lucide-react** for icons
- **colorthief** v3 for client-side palette extraction
- **picsum.photos** (CORS-enabled) for demo imagery

---

## Known limitations (for the panel)

- Images come from `picsum.photos` with stable seeds. Day-of-demo swap to curated Ghanaian shots is a one-line-per-asset change in [`src/data/assets.ts`](src/data/assets.ts).
- "Upload" mocks the network round-trip — files never leave the browser.
- Search is keyword-and-synonym, not an embedding model. The behavior is indistinguishable on a 50-asset catalog and far more reliable for a live demo.
- No tests yet.

---

## License

Prototype for educational / FYP use. All imagery from `picsum.photos` is public domain.
