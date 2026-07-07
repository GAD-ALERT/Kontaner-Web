# Kontaner — FYP Demo Script

**Target length**: 4–5 minutes spoken, with one panelist driving the laptop.
**Goal**: Land three "wait, did that just actually use AI?" moments while showing the product is end-to-end usable.

---

## Before you start

- [ ] `npm run dev`, open `http://localhost:5173/`
- [ ] Wait ~10s on the homepage so the picsum images finish loading
- [ ] Open DevTools → Application → Local Storage → Clear `kontaner.auth` and `kontaner.favorites` so you start as a logged-out visitor
- [ ] Have a **real Ghana-themed JPG/PNG** on your desktop named something like `kente_market_demo.jpg` — the filename drives the streamed tags (see [`src/lib/fakeAI.ts`](src/lib/fakeAI.ts) for theme matches)
- [ ] Run a backup recording of this script — see [Recording the backup](#recording-the-backup) below

---

## The script

### 0:00 — Open on the landing page

> *"Kontaner is a creative-asset library for Ghanaian creators — think Freepik, but built around West African design context. The home page is the product."*

**Show**:
- Ken-Burns hero scaling slowly in the background
- Hero stagger animation (eyebrow → headline → search → trending pills → stats)
- Scroll once: category mega-strip, trending row, featured collections, dense browse grid

### 0:45 — Click any asset card → asset detail

> *"Every detail page shows AI-generated tags, but here's the thing — the dominant color palette is real. It's running colorthief on the image in your browser, right now."*

**Show**:
- Real photograph in the preview frame
- AI Insight panel ("The composition centres on…") — editorial-voice, not template-y
- Click a swatch under "Dominant Colors" → it copies the hex (`#E5C842` to clipboard)
- Click an AI-generated tag (e.g. "Kente Fabric") → goes straight to a search

### 1:30 — Natural-language search

> *"Now watch the search bar. I'm not going to type 'kente'. I'm going to describe what I want like I'd describe it to a human."*

**Type**: `market scenes with bold colors` → Enter

**Show**:
- The "Understanding your query…" pulse animation
- 8 results appear, each with a **score badge** in the top-left
- Top match scored ~17, named "Market Spices"
- **Refinement chips** appear above the results: Market, Commerce, Color, Daily Life, market woman, Accra
- Matched tags on each card are green-highlighted

> *"It's not an embedding model — it's a synonym graph with ~50 entries weighted across tags, titles, and asset types. For a 50-asset catalog it's behaviorally identical to semantic search and far more reliable for a live demo."*

**Click a refinement chip**: "market woman" — new ranking pops in

### 2:30 — Sign in, then upload

> *"Most things you'd actually do — saving, uploading, building collections — need an account. The sign-in flow is soft-gated."*

**Click bookmark on any card** → login modal springs in
**Click "Continue as guest"** → modal exits, bookmark fills green with a pop

Now click **Upload** in the top-right nav.

> *"Drop something in."*

**Drag** `kente_market_demo.jpg` onto the dropzone.

**Show** (narrate over it):
- Fake progress bar 0 → 100%
- "Analysing image…" beat
- **Tags stream in one at a time** — Kente Pattern, Traditional Textile, Heritage, Vibrant Colors, Ghanaian Craft…
- Editorial Insight appears: *"The composition centres on woven geometric motifs typical of Ashanti kente…"*
- Extracted palette appears (5 real hex swatches from the file you just dropped)

> *"That entire flow is local — the file never leaves the browser. The tags are theme-aware: it pattern-matches the filename against 9 cultural profiles and shuffles a pool of relevant tags. The insight prose is curated per theme. The palette is real."*

### 3:30 — My Library polish

**Click** the avatar → user is signed in
**Click** "My Library" in the nav

**Show**:
- Filter pills work (`Videos` → list drops to 3)
- Sort menu opens with three options
- Grid ↔ List view toggle (list shows dense rows with thumbnails + tags + Open button)

### 4:00 — Wrap

> *"Everything you've just seen runs in the browser — no backend, no API key, no LLM call. The architecture is set up so we can swap each fake-AI module for a real one later — `useDominantColors` and the natural-language search engine are the same shape a real implementation would have."*

If asked about backend plans: *"Next step is a thin Express/Hono server for uploads + persistence + auth. The frontend is already pointing at `/api/*` in [`src/lib/`](src/lib/) and would only need the fetch wrapper unmocked."*

---

## Recording the backup

```bash
# Mac: native screen recording
# Cmd+Shift+5 → Record selected portion → walk through script → save as kontaner-demo.mp4
```

Save it to your phone as well. **Networks die at the worst time.** If `picsum.photos` is unreachable during demo (it has been known to rate-limit), the cards fall back to coloured gradients — still presentable, but the polish reads weaker. Hand the panelist your phone with the video queued if that happens.

---

## Things that might come up in Q&A

| Question | Answer |
| --- | --- |
| *Is the AI real?* | Color extraction and search ranking are real client-side code. Tagging is a heuristic pattern-match for demo reliability — the same component interface would accept a real model. |
| *Why no backend?* | Scope cut. The frontend is the highest-leverage part to demo at FYP stage. Express/Hono server is the planned next iteration. |
| *Why picsum?* | Stable, CORS-friendly, free. Real images make the UI feel like a product without spending the FYP-prep budget on stock photo licenses. Day-of-launch swap-out is straightforward. |
| *How would you scale search to 50K assets?* | The current scoring engine starts to choke past ~5K. Swap to MiniSearch (BM25) for 10K–100K, then a real embedding index (Pinecone / Qdrant) past that. |
| *Accessibility?* | `prefers-reduced-motion` is honored across all entrance animations + Ken-Burns. ARIA labels on icon buttons, semantic landmarks, keyboard-reachable nav. WCAG audit not done. |
| *Mobile?* | Responsive breakpoints at 1024px (tablet) and 720px (phone). Tested at 390px viewport — single-column grids, horizontal-scroll category strip, collapsing nav. |

---

## File reference for code questions

- **Search engine**: [`src/lib/search.ts`](src/lib/search.ts)
- **Fake-AI tag streaming**: [`src/lib/fakeAI.ts`](src/lib/fakeAI.ts)
- **Color extraction hook**: [`src/hooks/useDominantColors.ts`](src/hooks/useDominantColors.ts)
- **Motion variants**: [`src/lib/motion.ts`](src/lib/motion.ts)
- **Auth store (persisted)**: [`src/stores/auth.ts`](src/stores/auth.ts)
- **Routing**: [`src/routes/router.tsx`](src/routes/router.tsx)
- **Mock catalog**: [`src/data/assets.ts`](src/data/assets.ts)
