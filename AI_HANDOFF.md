# CODEX HANDOFF

Project: `pursuit-of-equilibrium` (Next.js + Tailwind + shadcn)

## READ THIS FIRST
- Purpose: provide context from previous sessions and fast familiarity with current project state.
- This document is not a prompt, specification, or execution plan.
- Nothing in this file should be treated as an instruction unless the user explicitly asks for it in the current session.
- Use this file to orient, then follow the user's actual request.
- Trigger phrase behavior:
  - If the user says "read codex handoff doc" (or equivalent), read this file, summarize current state briefly, and then wait for the user's actual task.
  - Do not proactively start implementation, validation passes, or backlog items from this file without an explicit request.

## How to use this doc
- This is a rolling Codex-to-Codex handoff.
- `Active Snapshot` is the current truth.
- `Session Log` is reverse chronological history.
- This file is context from prior sessions, not a user request by itself.
- Default behavior for future Codex sessions:
  - Do not execute anything from this file unless the user explicitly asks in the current session.
  - Treat all sections as background context only.
  - Confirm current user intent first, then use this doc for orientation.
- `Open Risks / Verify Next` is a backlog of optional checks, not a mandatory task list.

## Active Snapshot (as of 2026-03-06T23:59-07:00)
- Landing `/`:
  - Split Lux/Pendulums doorway experience.
  - Header on landing shows centered POE logo/title only.
  - Mobile pendulum overlay restored and redesigned:
    - Two masked bobs (white top / black bottom) to mirror desktop color-split behavior.
    - Oscillates around the exact center divider (shared doorway border).
    - Mobile doorways forced to equal 50/50 heights with an explicit center divider line.
- Lux `/lux`:
  - Route now uses a dedicated dark visual treatment (neutral-charcoal, reduced blue cast, subtle top glow).
  - Hero text stack now mirrors Pendulums hierarchy/placement:
    - `Chapter 1`, `LUX`, subtitle, and `by BEN STRAUSS`.
    - Same top-third anchored positioning and matching type scale conventions.
  - Lux route forces `html/body` background color while mounted to prevent white overscroll reveal.
  - Header and footer are route-aware dark mode on Lux.
  - Lux header nav now includes `About` (`/lux#about`) with same hash-scroll behavior/offset pattern as Pendulums.
  - Added Lux gallery grid driven by `public/data/lux.json`:
    - Numerical ordering (`Lux No. 1` through `Lux No. 7`).
    - Responsive masonry behavior with left-to-right row reading order.
    - Mobile layout is 2 columns.
    - Card hover title overlay (all caps) using work name.
  - Lux media handling:
    - Uses `next/image` optimization on Lux route.
    - Remote image allowlist added for `ipfs.io`, `dweb.link`, and `arweave.net`.
    - IPFS image fallback retries from `dweb.link` when `ipfs.io` fails.
  - Lux card details now open in a dark shadcn `Dialog` (not drawer):
    - Two-column desktop / stacked mobile.
    - Includes image, name, description, and attributes from `lux.json`.
    - Dialog scroll behavior is mobile-friendly (`y` overflow on mobile).
    - Includes secondary-acquisition inquiry copy (OpenSea CTA removed for now).
  - Lux About section added below grid:
    - Includes white-themed heading with side gradients and full article copy from `ABOUT.md`.
    - Uses same About anchor offset behavior and section divider rhythm as Pendulums.
  - Added animated ambient atmospheric dust layer near top light bleed:
    - Canvas-based noise drift with masking and blend for light-caught atmosphere.
    - Tuned for performance (adaptive particle count, frame cap, visibility pause).
- Pendulums `/pendulums`:
  - Hero + `Motion Carries Structure` section.
  - Hero media switched from static image to iframe background (`/pendulums-hero-script.html`).
  - Hero iframe/canvas behavior tuned for cover/crop, center alignment, and smoother masked fade.
  - Hero iframe mount is deferred (idle/timeout) to reduce initial scroll freeze during heavy script startup.
  - Hero title stack includes `Chapter 2` above `PENDULUMS` for chapter-style consistency with Lux.
  - Hero text tone set to `#333333` for the title block copy.
  - Added textured image backdrop layer behind iframe (`/temp-background-hero.jpg`).
  - `The System` section with seeded iframe + output profile.
  - `About Pendulums` section with full article from `ABOUT.md`.
  - Interview video is inside About flow (under `MOTION AS MEMORY`, before `FROM LIGHT TO CODE`).
  - `#about` anchor now targets the About heading row (not article body) so heading stays in view on nav jump.
  - Tapered full-width section dividers between major sections.
- Gallery `/pendulums/gallery`:
  - 512 metadata gallery with search/sort/trait filters, chips, lazy paging, modal.
  - OpenSea snapshot integration:
    - `Listed` badge with price on cards.
    - `Only show Listed` toggle.
    - Listed-only price sort combobox (`high->low`, `low->high`).
  - Filters use shadcn `Drawer` (mobile bottom, desktop left).
  - Header style matches Playground (centered title + side lines + long description text).
  - Added collector flow:
    - `Generate my grid` section under Gallery intro text.
    - Dialog with wallet/ENS input, on-demand fetch, preview grid, drag reorder, orientation swap, and PNG export.
    - Export uses square tiles with no skew; long edge set to 4096 (`Save PNG (4K)`).
  - Ownership fetch is no longer inferred from listings:
    - Dedicated owner API route fetches held Pendulums by wallet.
    - ENS input supported via server-side viem resolution and public RPC fallbacks.
  - Added loading spinners to grid workflow actions/status (`Fetch Pendulums`, `Save PNG`, etc.).
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

## Open Risks / Verify Next (context backlog, not implied TODOs)
1. Gallery modal animation iframe stability:
   - Historically intermittent p5 `getImageData ... width is 0` issue; wrapper fix exists but should be browser-verified.
2. Grid dialog drag UX:
   - Verify drag ghost alignment/feel across Safari iOS + Android touch.
3. Pendulums hero iframe performance/quality:
   - Validate startup latency + texture quality tradeoff on lower-powered mobile devices.
   - If residual jank remains, consider chunking p5 trace/texture generation over multiple frames.
4. Landing mobile pendulum:
   - Verify center-divider alignment and color split timing across different screen heights.
5. Lux route dark theme:
   - Verify no white flash/overscroll on iOS Safari and consistent dark header/footer colors after navigation.
6. Playground embed:
   - Verify panel scroll works across desktop/mobile heights.
7. Lint:
  - Non-blocking `@next/next/no-img-element` warnings remain in gallery intentionally.
8. Lux atmospheric dust:
   - Browser/device verify realism and performance on lower-powered mobile hardware.

## Key Files
- `src/components/site-header.tsx`
- `src/app/globals.css`
- `src/components/landing-doorways.tsx`
- `src/components/doorway-image.tsx`
- `src/components/deferred-hero-iframe.tsx`
- `src/components/lux-atmospheric-dust.tsx`
- `src/app/lux/page.tsx`
- `src/app/pendulums/page.tsx`
- `src/components/pendulums-system-section.tsx`
- `src/components/pendulums-gallery.tsx`
- `src/app/pendulums/playground/page.tsx`
- `next.config.ts`
- `public/pendulum-playground-15.html`
- `public/pendulums-hero-script.html`
- `public/temp-background-hero.jpg`
- `public/temp-background-hero-light.jpg`
- `public/data/lux.json`
- `src/app/api/listings/status/route.ts`
- `src/app/api/owners/pendulums/route.ts`
- `src/lib/ens.ts`
- `src/lib/opensea.ts`
- `public/data/pendulums_1-512.json`
- `http://cdn.transientlabs.xyz/tlx/pendulums/website-assets/`

## Env
- `OPENSEA_API_KEY` (required)
- `OPENSEA_COLLECTION_SLUG` (optional fallback)
- `PUBLIC_MAINNET_RPC_URL` (optional; ENS resolution override for viem/public RPC flow)

## Session Log

### 2026-03-06T23:59-07:00 (Lux expansion + interaction pass)
- Lux grid/content build-out:
  - Added Lux works grid under hero from `public/data/lux.json`.
  - Enforced numeric ordering and tuned responsive masonry behavior with correct left-to-right reading order.
  - Set mobile Lux grid to 2 columns.
  - Added hover/focus title overlays for Lux cards.
- Lux media URL/optimization pipeline:
  - Added IPFS URL normalization rules for Lux assets (`/media` handling for Lux No. 3-7; Lux No. 2 Arweave passthrough).
  - Added IPFS gateway fallback to `dweb.link` when primary fails.
  - Switched Lux images to `next/image` and configured remote image hosts in `next.config.ts`.
  - Tuned landing doorway `next/image` settings (`sizes`/quality).
- Lux details interaction:
  - Iterated from Drawer concept to final shadcn `Dialog` flow.
  - Removed card autoscroll/scale behavior; click now opens modal directly.
  - Dialog includes artwork image + metadata (name, description, attributes) and dark Lux styling.
  - Added secondary-acquisition inquiry copy (OpenSea button removed per current direction).
  - Desktop layout stabilized to keep image presentation consistent across varying description lengths.
- Lux About + navigation:
  - Added section divider and `About Lux` heading treatment to mirror Pendulums structure.
  - Inserted Lux About article copy from `ABOUT.md` (figures deferred).
  - Added Lux header `About` nav item (`/lux#about`) and aligned anchor offset behavior (`scroll-mt-28`).
- Lux atmospheric pass:
  - Added new top-of-page animated dust component (`src/components/lux-atmospheric-dust.tsx`) tied to top light bleed.
  - Multiple rounds of motion/size/blur tuning for realism.
  - Added performance safeguards: adaptive particle count, capped FPS, reduced-motion handling, and tab visibility pause.

### 2026-03-06T23:59-07:00
- Lux side kickoff / dark mode pass:
  - Built Lux dark visual shell (darker neutral charcoal + subtler top light bleed; less blue).
  - Made Lux header and footer route-aware dark variants.
  - Trimmed Lux route nav to `Lux` + `Pendulums` only for now.
  - Added Lux hero text stack matching Pendulums sizing/placement and added `by BEN STRAUSS`.
  - Set Lux route `html/body` background color during mount to avoid white overscroll reveal.
- Pendulums hero + performance polish:
  - Removed side divider lines flanking `PENDULUMS`.
  - Added `Chapter 2` above hero title with tuned spacing.
  - Ensured hero title row remains centered after divider removal.
  - Added deferred hero iframe mount component to mitigate page scroll freeze while p5 hero script initializes.
- Typography/mobile polish:
  - Applied mobile paragraph downshift pattern (`text-base md:text-lg`) across Pendulums content containers and related sections where `p` text used large defaults.
- Landing mobile pendulum correction:
  - Reworked motion and positioning to match centerline behavior; tightened oscillation range and enforced center border alignment.

### 2026-03-05T18:00-07:00
- Gallery collector/grid workflow:
  - Added `Generate my grid` UI section and shadcn dialog flow.
  - Added wallet/ENS input with on-demand fetch only.
  - Added `Enter` submit behavior for wallet input.
  - Added auto grid dimensioning + optional orientation swap (`AxB` <-> `BxA`).
  - Added drag/touch tile reordering + damped drag ghost preview.
  - Added 4K PNG export with square tiles, long-edge lock at 4096, and aspect-safe cover rendering.
  - Added shadcn spinner affordances for loading states.
- Ownership + ENS APIs:
  - Added `/api/owners/pendulums` for wallet-held token IDs.
  - Added viem-based ENS resolver with public RPC fallback chain.
  - Added `ownerAddress` parsing in listing model for broader metadata completeness.
- Pendulums hero:
  - Replaced static hero image with iframe-based script background.
  - Tuned iframe/script behavior for center alignment and cover-style crop.
  - Introduced hero texture backdrop image (`temp-background-hero.jpg`) behind iframe.
  - Smoothed hero mask fade with multi-stop gradient.
  - Tuned hero script performance and removed legacy high-res download code path.
  - Updated hero title block color to `#333333`.
- Pendulums anchors/layout:
  - Moved `#about` anchor target to heading row so heading lands in view after hash scroll.
- Landing mobile animation:
  - Restored mobile pendulum animation using two masked bobs (white/black split at center line).
  - Enforced equal mobile doorway heights and explicit center divider alignment.

### 2026-03-05T10:00-07:00
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
