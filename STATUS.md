# adfast-landing Audit

Audit date: 2026-11-19. Source files were not edited; no dev server was started.

## Git state

- Branch: `main`
- `git status --short` at completion: `M src/components/Home/HomePage.tsx`; `M src/features/post-ad/Step5Summary.tsx`
- `origin/main...HEAD`: 0 behind, 1 ahead. `git diff --stat origin/main..HEAD`: 11 files, 776 insertions, 1,069 deletions.
- Last commit: `b821aab wip: my manual changes` (2026-11-19).
- Last-commit manual-change review:
  - `src/app/(console)/dashboard/page.tsx` — replaced dashboard composition with dark dashboard components; **Broken** because it imports missing `DashboardPrimitives`.
  - `src/app/(console)/publisher/page.tsx` — changed dashboard labels; **Risky** because the rupee and middle-dot display as mojibake (`â‚¹`, `Â·`).
  - `src/components/Home/HomePage.tsx` — substantially reworked landing page and interactions; **Good**, but pricing is not linked/rendered.
  - `src/features/advertiser/CampaignAiAssistant.tsx` — revised chat behavior and scrolling/error handling; **Good** for the mock UI.
  - `src/features/advertiser/CampaignWizard.tsx` — expanded objective and location/audience flows; **Risky**, with four unused-variable lint warnings.
  - `src/features/advertiser/LeafletMap.tsx` — added multiple location pins, suggestions and radius controls; **Risky**, `Date.now()` triggers a lint error.
  - `src/features/advertiser/MapPicker.tsx` — adapted picker to typed target locations; **Good**.
  - `src/features/advertiser/campaignObjectives.ts` — readiness now checks target-location arrays; **Good**.
  - `src/features/advertiser/locationSuggestions.ts` — added mock city/country/PIN suggestions; **Good** as prototype data.
  - `src/services/campaignAi.ts` — expanded local draft inference for audience/location inputs; **Good** for a mock service, not a live AI integration.
  - `src/types/campaign.ts` — added multi-location targeting types and helpers; **Good**.

## Routes

“Working” means substantive prototype content/interaction, not a live backend.

| Route | Status |
|---|---|
| `/` | Working |
| `/signup` | Working |
| `/reset-password` | Working |
| `/publishers` | Working |
| `/login` | Working |
| `/forgot-password` | Working |
| `/dashboard/publisher` | Stub |
| `/ad-formats` | Working |
| `/advertisers` | Working |
| `/(console)/[slug]` | Stub |
| `/admin/websites` | Working |
| `/admin/users` | Working |
| `/traffic-chart` | Working |
| `/admin/support` | Working |
| `/support` | Working |
| `/admin/settings` | Working |
| `/admin/publishers` | Working |
| `/admin` | Working |
| `/settings` | Working |
| `/admin/campaigns` | Working |
| `/admin/advertisers` | Working |
| `/reports` | Working |
| `/finance` | Working |
| `/add-funds` | Working |
| `/dashboard` | Broken |
| `/post-ad` | Working |
| `/conversion-tracking` | Working |
| `/campaigns` | Working |
| `/publisher/payments` | Working |
| `/publisher` | Basic |
| `/publisher/websites` | Working |
| `/publisher/earnings` | Working |
| `/publisher/placements` | Working |
| `/publisher/statistics` | Working |
| `/campaigns/new` | Working |
| `/campaigns/new/advanced` | Working |
| `/campaigns/new/ai` | Working |
| `/campaigns/new/manual` | Working |

Counts: 35 Working, 1 Basic, 1 Broken, 2 Stub (39 routes total). The catch-all route explicitly says “This page will be built later”; publisher dashboard destination is explicitly a placeholder. Build failure prevents runtime verification of all routes.

## Packages

Beyond Next, React/React DOM and Tailwind: `@types/leaflet`, `class-variance-authority`, `clsx`, `leaflet`, `lucide-react`, `motion`, `radix-ui`, `react-day-picker`, `react-icons`, `react-leaflet`, `tailwind-merge`, `tw-animate-css`. Additional dev dependencies: `@tailwindcss/postcss`, `@tailwindcss/turbopack`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `typescript`.

## Lint and build

- `npm run lint`: **FAIL** (1 error, 5 warnings). First error: `src/features/advertiser/LeafletMap.tsx:57:56` — `Date.now` is impure during render. Warnings include four unused values in `CampaignWizard.tsx` and missing `alt` in `Step3Preview.tsx`.
- `npm run build`: **FAIL**. First error: `src/app/(console)/dashboard/page.tsx` cannot resolve `@/components/shared/DashboardPrimitives` (file absent).

## Checklist

| Item | Judgment | Evidence |
|---|---|---|
| A | Done | Flat styling; no gradient, blur, colored-opacity shadow or oversized rounded class hits; shared Lucide icon usage. |
| B | Partial | Advertiser chart uses sample data; publisher chart says no activity yet; admin dashboard is mock KPI content, not a complete realistic chart set. |
| C | Done | Four objectives have conditional flows; `Get Leads` has configurable lead-form fields and preview. |
| D | Done | Search suggestions, separate map markers, map camera updates, city/country labels, Indian PIN entry, and adjustable 1–50 km radius exist. |
| E | Done | Audience includes age/interests and separate Include/Exclude country controls, with India recommended for Include. |
| F | Partial | Ticket creation/categories/status and admin replies exist; no attachment control or user-side conversation history. Publisher nav says “Help,” not “Support.” |
| G | Done | Role-specific navigation and admin routes exist; no role-switch control was found. Admin uses a dedicated route group/interface. |
| H | Partial | Pricing component contains illustrative mock plans but is not rendered as a page; `/domains` falls through to the stub route. |
| I | Missing | No Revenue Ads product/domain route or reference found. |
| J | Partial | Reusable campaign template data/presets exist; no template pages/routes found. |
| K | Partial | No `href="#"` or empty `onClick`; one active lead-preview button has no handler (`AdPreview.tsx:38`), and several nav destinations resolve to the stub. |
| L | Partial | Has a hero, product/example sections and FAQ, but does not follow OpenFilm’s “What is it” → capabilities → examples → FAQ structure. |
| M | Partial | No `/campaigns/[id]` page or global topbar search; sidebar is dark rather than light (active item is navy-on-navy). |
| N | Partial | AI route and local mock service are implemented, but the failed project build means route operation cannot be verified. |
| O | Partial | `qa-viewport.mjs` checks 360px overflow/routes, but was not run; no dev server was started. Console uses minimum-height wrappers, not fixed `h-screen`. |

## Problem search counts

- Dead controls: 0 `href="#"`; 0 empty `onClick`; 1 clearly active button without a handler at `src/features/advertiser/AdPreview.tsx:38`. Of 96 matched button tags, other missing inline handlers were a menu trigger, a dialog close wrapper, or a disabled control.
- Placeholder terms: 58 hits across 24 files when including generic “Demo”; 10 hits excluding that broad term (`will be built later`, `Lorem`, `TODO`, `Mock account`, `Simulated`, `coming soon`). Explicit stub text: `src/app/(console)/[slug]/page.tsx:20`. Most “Demo” hits are sample data or prototype disclosures.
- AI-look styles: 0 gradient/text-gradient, blur/backdrop-blur, opacity-shadow, animate-pulse, float utility, or `rounded-2xl`/`rounded-3xl` hits. 3 emoji-range symbol hits (check/cross glyphs used as icons).
- Colors: 66 hex-color hits in 8 files; 516 Tailwind `blue`/`indigo`/`slate` palette hits in 80 files (many are neutral slate). Examples of hardcoded blue/hex brand colors are in `src/features/advertiser/LeafletMap.tsx:43,129` and dashboard styles.
- Scroll: 0 exact `h-screen`; 15 `overflow-hidden` hits across 13 files (often clipping); two console `100vh` minimum-height calculations at `src/layout/Sidebar.tsx:98` and `src/layout/ConsoleLayout.tsx:43`.
- Import casing: 0 casing mismatches found. Separate resolution failure: missing `DashboardPrimitives` import at `src/app/(console)/dashboard/page.tsx:10`.
- Role switcher: 0 switch/change/select-role UI matches.

## Fix first

1. Restore or add the missing `DashboardPrimitives` module/import so the production build can compile.
2. Replace render-path `Date.now()` ID generation in `LeafletMap.tsx`; clear the four `CampaignWizard.tsx` lint warnings.
3. Fix mojibake currency and punctuation in the publisher dashboard.
4. Replace the inert lead-preview submit button with a clearly non-interactive preview element or behavior.
5. Implement the campaign detail route and topbar global search; change the sidebar to the requested light style with a clear dark active pill.
6. Replace the generic stub for advertised console destinations (including `/domains`) with relevant pages or remove their nav entries.
7. Complete support with attachments and user-side conversation/history; standardize the sidebar label to “Support”.
8. Wire a proper pricing page and correct the pricing navigation target.
9. Add the Revenue Ads product/domain entry from the main site.
10. Run the existing 360px/page-scroll QA after build is fixed; confirm scroll behavior on long console pages.
