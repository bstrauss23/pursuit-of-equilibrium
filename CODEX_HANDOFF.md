# CODEX HANDOFF

Project: `pursuit-of-equilibrium` (Next.js + Tailwind + shadcn)

## How to use this doc
- This is a rolling Codex-to-Codex handoff.
- `Active Snapshot` is the current truth.
- `Session Log` is reverse chronological history.
- This file is project context, not a user request by itself.

## Active Snapshot (latest)
- Landing `/`:
  - Split Lux/Pendulums doorway experience.
  - Header on landing shows centered POE logo/title only.
- Pendulums `/pendulums`:
  - Hero + `Motion Carries Structure` section.
  - `The System` section with seeded iframe + output profile.
  - `About Pendulums` section with full article from `ABOUT.md`.
  - Interview video is inside About flow (under `MOTION AS MEMORY`, before `FROM LIGHT TO CODE`).
  - Tapered full-width section dividers between major sections.
- Gallery `/pendulums/gallery`:
  - 512 metadata gallery with search/sort/trait filters, chips, lazy paging, modal.
  - OpenSea snapshot integration:
    - `Listed` badge with price on cards.
    - `Only show Listed` toggle.
    - Listed-only price sort combobox (`high->low`, `low->high`).
  - Filters use shadcn `Drawer` (mobile bottom, desktop left).
  - Header style matches Playground (centered title + side lines + long description text).
- Playground `/pendulums/playground`:
  - Intro header + description + iframe embed.
  - Iframe source is local: `/pendulum-playground-15.html`.
  - Embedded control panel is scrollable (CSS in local html).
  - Width aligned with gallery (`max-w-[1600px]`).
- Header/nav:
  - Order: Lux, Pendulums, Algorithm, About, The Gallery, Playground.
  - Same-page hash links smooth-scroll.
- Global layout tokens:
  - `--content-max-width` + `.content-width`
  - `--section-gap` + `.section-gap`

## Open Risks / Verify Next
1. Gallery modal animation iframe stability:
   - Historically intermittent p5 `getImageData ... width is 0` issue; wrapper fix exists but should be browser-verified.
2. Gallery listed-only UX:
   - Verify combobox spacing and no layout shift on toggle.
3. Playground embed:
   - Verify panel scroll works across desktop/mobile heights.
4. Lint:
   - Non-blocking `@next/next/no-img-element` warnings remain in gallery intentionally.

## Key Files
- `src/components/site-header.tsx`
- `src/app/globals.css`
- `src/app/pendulums/page.tsx`
- `src/components/pendulums-system-section.tsx`
- `src/components/pendulums-gallery.tsx`
- `src/app/pendulums/playground/page.tsx`
- `public/pendulum-playground-15.html`
- `src/app/api/listings/status/route.ts`
- `src/lib/opensea.ts`
- `public/data/pendulums_1-512.json`

## Env
- `OPENSEA_API_KEY` (required)
- `OPENSEA_COLLECTION_SLUG` (optional fallback)

## Session Log

### 2026-03-05 (current)
- Clarified handoff purpose as Codex-to-Codex rolling summary.
- Built/iterated OpenSea listing integration:
  - Server-side API + caching.
  - Evolved from per-token fetches to collection snapshot strategy for reliability.
  - Removed per-token listing API route from active flow.
- Gallery updates:
  - Added listed indicator then converted to `Listed` badge with price.
  - Added `Only show Listed`.
  - Added listed-only shadcn combobox price sorting.
  - Header restyle + control row adjustments.
  - Filters drawer moved to desktop-left.
- Pendulums page layout updates:
  - Added `Motion Carries Structure` section and iterated placement.
  - Standardized widths via global `.content-width`.
  - Added global section gap utility and tapered dividers.
  - Moved interview video into About article flow.
- Playground:
  - Added `/pendulums/playground` route.
  - Tried native React playground, then intentionally scrapped.
  - Final approach: iframe embed + intro text.
  - Switched iframe to local `/pendulum-playground-15.html`.
  - Added scrollable control panel behavior inside embedded HTML.
- Header/nav:
  - Nav order updates.
  - Smooth-scroll for same-page hash links.
- Housekeeping:
  - Removed unused `children` param in `src/components/ui/combobox.tsx`.

### Pre-2026-03-05
- Existing core work already in place:
  - Landing doorway experience.
  - Pendulums system/about/perfection sections.
  - Gallery rebuild from reference metadata/html.
