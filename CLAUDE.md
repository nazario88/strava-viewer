# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev      # Vite dev server on :5173 (opens browser automatically)
npm run build    # Production build → dist/
npm run preview  # Serve the built dist/
```

There is no test suite, linter, or formatter configured. Don't invent `npm test` / `npm run lint`.

## Architecture

Vue 3 SPA (`<script setup>` Composition API) + Vite + Tailwind, with a single PHP endpoint as an OAuth broker. No router, no Pinia/Vuex, no composables directory — deliberately flat.

### State lives entirely in `src/App.vue`

`App.vue` (~400 lines) is the only stateful component. It owns auth, the raw `activities` array fetched from Strava, all derived chart data, and the theme. Everything below it is presentational: props down, `emit` up (`@connect-to-strava`, `@disconnect`, `@toggle-theme`, `@retry`).

Render is a four-way `v-if` chain in `App.vue`: `ErrorComponent` → `LoadingComponent` → `AuthorizationPage` → `DashboardComponent`.

When adding a new statistic: compute it in `calculateStatistics()` in `App.vue`, expose it as a `ref`, pass it through `DashboardComponent`'s props, and render it in a child. Children never fetch.

Every distance statistic reads `filteredActivities` (the `selectedSport` filter), never `activities` directly — running and swimming kilometres must not be summed together. The only deliberate exception is `activityDistribution`, computed over all activities because the donut is the overview that feeds the filter chips.

### Demo mode

`?demo=1` (or the button on `AuthorizationPage`) calls `enterDemo()`, which fills `activities` from `src/demoData.js` and skips auth entirely. The generator is seeded (`mulberry32`, fixed `SEED`) so the demo is byte-identical on every visit — screenshots stay valid and two visitors see the same thing. It exists so nobody has to grant the `activity:read_all` scope just to see what the product looks like.

### OAuth flow

1. `AuthorizationPage` → redirect to `stravaAuthUrl` (built in `App.vue` from `VITE_STRAVA_CLIENT_ID`).
2. Strava redirects back with `?code=`; `checkAuthCallback()` on mount POSTs it to `/api/auth.php`, then scrubs the query string with `history.replaceState`.
3. `api/auth.php` holds the client secret server-side and proxies both `authorization_code` and `refresh_token` grants to `https://www.strava.com/oauth/token`. The **client secret must never reach the frontend** — the `VITE_STRAVA_CLIENT_SECRET` line in `.env.local` is vestigial and unused.
4. Tokens go to `localStorage`; `getValidToken()` refreshes automatically 5 minutes before `expires_at`. Every Strava API call goes through it.

Activities are fetched by `fetchAllActivities()` — paginated at 200/page until a short or empty page — so the whole athlete history is in memory client-side, and all stats are pure array reductions over it.

### Charts

Each file under `src/components/charts/` owns its own Chart.js instance directly against a `<canvas>` ref (no vue-chartjs). The shared lifecycle pattern is: `Chart.register(...registerables)` at module scope, `createChart()` that destroys any existing instance before rebuilding, a `watch(props, …, { deep: true })` that recreates, and `destroyChart()` in `onUnmounted`. Copy that pattern for new charts or you'll leak canvases on prop changes.

`src/activityTypes.js` is the single source of truth for sport colours and French labels. `ActivityHeatmap`, `DistributionChart` and `SportFilter` all import from it — never redeclare those maps locally.

`ActivityHeatmap.vue` is not Chart.js — it's a hand-built CSS grid of 6 rolling months (Monday-first, `(getDay() + 6) % 7` offset), colored by sport type from its local `ACTIVITY_COLORS` / `ACTIVITY_LABELS` maps.

### The heatmap coupling (source of a past bug)

`calculateYearlyActivities()` in `App.vue` and `calendarMonths` in `ActivityHeatmap.vue` independently compute the same 6-month rolling window and must produce matching `YYYY-MM-DD` keys. Changing the window length or date formatting in one without the other silently drops days (fixed in `7b79cec`). Note also that `App.vue` derives the day key via `toISOString()` (UTC) while the heatmap builds it from local date parts — a real timezone edge for late-evening activities.

## Conventions and gotchas

- **`redirectUri` is hardcoded** to `https://strava.dailyheroes.io` in `App.vue`. OAuth therefore cannot complete against `npm run dev` as-is.
- **`/api/auth.php` is not proxied in `vite.config.js`.** Local auth requires either a Vite proxy to a PHP host or testing against the deployed backend.
- **`api/config.php` is gitignored.** Copy `api/config.example.php` to it and fill in `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET`.
- **`@/*` is declared in `jsconfig.json` but has no matching `resolve.alias` in `vite.config.js`** — it works in the editor and breaks at build time. Use relative imports, as all existing components do.
- **Dark mode** is Tailwind `darkMode: 'class'`: `toggleTheme()` toggles `.dark` on `document.documentElement` and persists to `localStorage`, falling back to `prefers-color-scheme` on first visit. Every themed element needs an explicit `dark:` variant.
- **localStorage keys**: `strava_access_token`, `strava_refresh_token`, `strava_token_expires_at`, `theme_preference`, `strava_yearly_goal_km`. `disconnect()` in `App.vue` clears the Strava ones — add any new auth key there.
- **Strava brand orange `#FC4C02`** is a Tailwind color (`strava`) plus hand-written `.text-strava` / `.bg-strava` helpers in `src/style.css`. Chart.js configs hardcode the hex.
- **UI strings and code comments are in French.** Match that. Sport types come from Strava's `sport_type` with `type` as fallback (`a.sport_type || a.type`).
- **The shared PNG carries its own branding.** `ShareButton` captures `<main>`, which deliberately excludes the header (it shows the athlete's name), so `addBrandingBand()` draws a footer strip with the site URL onto the canvas afterwards. Without it the exported image would have nothing linking back to the site.
- **Icons are inline Vue SVG components** under `src/components/icons/` — no icon library.

## Strava compliance

Constraints that come from the API Policy, not from the code — check any product change against them:

- **§5.8** forbids charging end users for anything the Strava Platform already provides. The current dashboard is largely duplicative of Strava, so it cannot be put behind a paywall as-is; only genuinely non-duplicative functionality could be.
- **§5.9** allows advertising in the app, but never using Strava data inside an ad, and never implying Strava endorsement.
- **§5.10** forbids disclosing or selling Strava data to third parties, and activity data may only ever be shown to the athlete who owns it.
- Standard-tier API access requires the developer to hold an active Strava subscription (since June 2026).
- The branding guidelines state you must not use the Strava name in your application name. The app is nonetheless called "Strava Analytics" — a known, deliberate exception the owner has chosen to keep. The required "Powered by Strava" attribution is in the footer.

## Deployment

Static build of `dist/` plus the `api/` directory served by a PHP host (Apache; `.htaccess` forces HTTPS and strips `www`). `api/config.php` is uploaded out-of-band since it's gitignored.
