# CODEX HANDOFF

Project: `pursuit-of-equilibrium` (Next.js + Tailwind + shadcn)

This file is a rolling handoff between Codex sessions so each new session can quickly understand recent work and continue smoothly.
It is a project context summary, not a user request by itself.

## Current state

- Landing `/`:
  - Split Lux/Pendulums doorway experience.
  - Pendulum animation hidden on mobile when doorways stack.
  - Header on landing shows only centered POE logo/title (no nav links).

- Pendulums `/pendulums`:
  - Hero with side lines around `PENDULUMS`.
  - Added **The System** section directly under hero:
    - Seeded iframe runner for `https://cdn.transientlabs.xyz/tlx/pendulums/Pendulums-23.html?seed=...`
    - `Run the System` button at bottom of right panel.
    - Right panel is `Output Profile` cards (Perfection, Style, Period, Amplitude, Damping, Cycle).
    - Mobile Output Profile uses collapsible shadcn `Accordion` (starts collapsed).
    - Mobile text in system section is centered.
  - Added `About Pendulums` section header (matching system-style title lines).
  - Interview video block below that header.
  - Full About article content and figures implemented from `ABOUT.md`.
  - Perfection tabs section implemented with shadcn Tabs.

- Gallery `/pendulums/gallery`:
  - React-native gallery rebuilt from reference HTML/JSON.
  - 512 metadata loaded from `public/data/pendulums_1-512.json`.
  - Search, sort, trait filters, applied filter chips, infinite/lazy paging.
  - Clicking card opens item details modal.
  - OpenSea listing integration:
    - Green status dot on cards when token has an active listing.
    - Modal OpenSea button now shows live list price when listed.
    - Uses internal API routes (server-side key usage):
      - `/api/listings/status?tokenIds=...`
      - `/api/listings/[tokenId]`
    - Shared OpenSea helper/caching in `src/lib/opensea.ts`.
  - Filter controls now use shadcn `Drawer`:
    - Mobile: bottom drawer
    - Desktop: right-side drawer
  - Active filter chips + `Clear all` shown near Filters button even when drawer closed.
  - Mobile header layout for gallery changed so filter controls appear on their own row under title block.

## Important files

- Header/nav:
  - `src/components/site-header.tsx`

- Landing:
  - `src/components/landing-doorways.tsx`

- Pendulums page:
  - `src/app/pendulums/page.tsx`
  - `src/components/pendulums-system-section.tsx`
  - `src/components/pendulums-interview-video.tsx`

- Gallery:
  - `src/app/pendulums/gallery/page.tsx`
  - `src/components/pendulums-gallery.tsx`
  - `src/app/api/listings/status/route.ts`
  - `src/app/api/listings/[tokenId]/route.ts`
  - `src/lib/opensea.ts`

- shadcn ui:
  - `src/components/ui/dialog.tsx`
  - `src/components/ui/drawer.tsx`
  - `src/components/ui/accordion.tsx`
  - `src/components/ui/tabs.tsx`
  - `src/components/ui/button.tsx` (installed later; now used by dialog)

- Lint ignores:
  - `eslint.config.mjs` (includes `reference-materials/**`)

## Reference assets

- `reference-materials/` contains:
  - `webflow-side-system.html`
  - `the-system.html`
  - `pendulum-gallery-17.html`
  - original `pendulums_1-512.json`

- Runtime gallery json used by app:
  - `public/data/pendulums_1-512.json`

## Known issue to verify first next session

- After switching gallery modal to shadcn `Dialog`, p5 iframe had an intermittent error:
  - `IndexSizeError: getImageData ... source width is 0`
- A stabilization fix was applied (fixed-size media wrapper before iframe mount), but needs real-browser verification across several animated tokens.

## Remaining non-blocking lint warnings

- `src/components/pendulums-gallery.tsx` has `@next/next/no-img-element` warnings (using `<img>` intentionally for external IPFS/media behavior).

## Suggested first checks for next Codex

1. Run app and verify:
   - Gallery card modal animation iframe reliability (no p5 width=0 errors).
   - OpenSea dots reflect listing status and modal price text renders correctly.
   - Filters drawer UX on desktop and mobile.
   - System metadata fields all populate each run.
2. Ensure env is present for listing endpoints:
   - `OPENSEA_API_KEY` (required)
   - `OPENSEA_COLLECTION_SLUG` (optional fallback if contract lookup cannot resolve slug)
3. If desired, convert gallery images to `next/image` with proper remote patterns in `next.config.ts`.
