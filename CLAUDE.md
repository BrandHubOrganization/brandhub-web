# BrandHub Web Dashboard — Coding Rules

## Project Overview

BrandHub is a content brand management platform: plan, create, schedule, and
publish multi-channel content (Instagram, TikTok, Facebook, LinkedIn).
This package (`brandhub-web-dashboard`) is the React SPA frontend that consumes
the `brandhub-business-service` REST API (base URL `http://localhost:8080`).

Target users: agency owners, brand clients, content creators, account managers,
admins.

## Tech Stack

- **React 19** + **TypeScript** (~6.0, strict)
- **Vite 8** build tool
- **Tailwind CSS 4** (`@import "tailwindcss"`, CSS-first config in
  `globals.css`) with `@tailwindcss/vite`
- **shadcn/ui** primitives built on **Radix** (`@/components/ui/*`), plus
  `sonner` for toasts
- **React Router 7** (`react-router-dom`)
- **i18next + react-i18next** (Vietnamese default, English fallback)
- **Zustand 5** (`zustand/middleware` persist) for auth/global state
- **TanStack Query 5** (`@tanstack/react-query`) for server data
- **axios** for HTTP (base `@/services/api.ts`)
- **zod + react-hook-form** for forms/validation
- **GSAP 3** + **motion** for animation (landing cinematics)
- **lucide-react** for icons (NEVER emoji)
- **class-variance-authority + clsx + tailwind-merge** via `cn()`

## Paths & Aliases

- `@/*` → `./src/*` (tsconfig.app.json). Import with `@/`, never relative `../`.
- **Be careful:** `tsconfig.json` has **no** `compilerOptions` — it only lists
  project references (`tsconfig.app.json`, `tsconfig.node.json`). All
  compiler options live in `tsconfig.app.json`.

## Commands

Run inside `brandhub-web-dashboard/`.

- Dev server: `npm run dev`
- Type-check only: `npx tsc --noEmit` (or `npx tsc -b`)
- Build: `npm run build` (runs `tsc -b && vite build`)
- Lint: `npm run lint` (eslint)
- Format: prettier + prettier-plugin-tailwindcss — run prettier on changed files.

## Directory Conventions

```
src/
  App.tsx               # BrowserRouter + all Routes (see Routing)
  main.tsx              # root: ThemeProvider + <App/>
  globals.css           # Tailwind v4 + shadcn theme vars + keyframes
  i18n/index.ts         # i18next setup; locales in i18n/locales/{vi,en}.json
  store/authStore.ts    # Zustand auth store (user + accessToken, persisted)
  services/             # api.ts (axios instance) + per-domain services
  pages/                # Route components; auth/* for auth pages
  components/
    ui/                 # shadcn/ui primitives (re-exported)
    layout/             # Layout, Navbar, Sidebar, AuthGuard
    auth/               # Login/Register/etc. subcomponents
    landing/            # Marketing/landing sections + cinematic/ animations
  lib/utils.ts          # cn() helper
  types/                # shared TS domain types
  theme/colors.ts       # brand color tokens
```

## Routing (App.tsx)

- **Public**: `/`, `/login`, `/register`, `/verify-otp`, `/forgot-password`,
  `/reset-password`.
- **Protected** (wrapped in `<AuthGuard/>` + `<Layout/>`): `/workspace`,
  `/portal`, `/admin`, `/editor`, `/calendar`, `/analytics`,
  `/components/examples`.
- `AuthGuard` gates protected routes; `Layout` provides sidebar/nav shell.
- Route components live in `src/pages/`.

## State Management

- **Global auth** lives in `@/store/authStore.ts` (Zustand + persist). It holds
  `user`, `accessToken`, and `setAuth`/`clearAuth`. Read via
  `useAuthStore((s) => s.user)`.
- **Server data**: prefer TanStack Query; do NOT duplicate server state into
  localStorage.
- Component-local state: `useState`/`useReducer`. Context only for genuinely
  shared cross-component state.

## API Layer

- `@/services/api.ts` exports a single `api` axios instance:
  - `baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"`
  - `withCredentials: true`
  - Request interceptor injects `Authorization: Bearer <accessToken>` from the
    store.
  - Response interceptor auto-refreshes on `401` via `/api/v1/auth/refresh`,
    then retries once; on refresh failure it clears auth and redirects `/login`.
- **Do not** create ad-hoc `axios` instances or hardcode base URLs — use `api`.
- Endpoints use the `/api/v1/{domain}/{action}` convention (e.g.
  `/api/v1/auth/login`, `/api/v1/auth/forgot-password`).
- Service modules (`@/services/authService.ts`): group endpoints per domain;
  export typed `Request`/`Response` interfaces; responses are wrapped in
  `ApiResponse<T>` (`{ success, data, error?, meta?, requestId?, version? }`).

## Auth Flow

- OTP-based: register → verify-otp → resend-otp; forgot-password sends a reset
  link/email; reset-password consumes a token.
- Tokens are stored via the auth store (persisted). On logout, call
  `clearAuth()` and redirect `/login`.

## Roles

`UserRole`: `ADMIN`, `AGENCY_OWNER`, `ACCOUNT_MANAGER`, `CONTENT_CREATOR`,
`BRAND_CLIENT`. Nav/sidebar visibility is filtered by role — e.g. `BRAND_CLIENT`
cannot see `/workspace` or `/editor`; only `ADMIN` sees `/admin`.

## Types

- Shared domain types live under `src/types/*`. Import them, don't redefine.
- Use the JSON API response envelope type `ApiResponse<T>` (in
  `authService.ts`) rather than bare `any`.
- Respect `verbatimModuleSyntax`: import types with `import type { ... }` when
  they are type-only.

## Styling

- Tailwind CSS 4 — utility classes inline; do not hand-write CSS unless the
  utility cannot express it (e.g. multistop gradients, arbitrary dynamic
  values).
- Theme/brand tokens are CSS variables in `globals.css` (`:root` and `.dark`):
  `--brand-orange` (#f05a28), `--surface-soft`, `--ink`, `--hairline`, etc.
  Access via `var(--brand-orange, #f05a28)` fallbacks.
- Prefer the semantic Tailwind classes provided by the theme mapping
  (`bg-primary`, `text-brand-orange-fg`, etc.) when they exist; fall back to
  inline `style={{ color: "var(--brand-orange)" }}` for values not exposed as
  utilities.
- Brand orange is `#f05a28` (`hsl(15 88% 55%)`). The sidebar/nav use the
  `--sidebar*` tokens (`#09090b` dark bg).
- Mobile-first. Use responsive prefixes (`md:`, `lg:`).

## Icons

**Never use emoji characters as UI icons.** Always use `lucide-react`.

```tsx
// WRONG
<span>👍 Thích</span>
<div>📊 Tổng quan</div>

// RIGHT
import { ThumbsUp, LayoutGrid } from "lucide-react";
<span><ThumbsUp className="size-4" /> Thích</span>
<div><LayoutGrid className="size-4" /> Tổng quan</div>
```

**Why:** emoji render differently across OS/browser font stacks (color,
weight, missing glyphs on some systems), can't inherit `currentColor` or
be sized/stroked consistently with the rest of the icon set, and break
dark-mode contrast. `lucide-react` icons are already a dependency and
used throughout the codebase — stay consistent.

**Exception — emoji as literal content, not icon:** sample/mock text a
user would plausibly type (post captions, comment bodies, chat messages,
demo textarea content) may contain emoji, because that's what real user
content looks like. Don't strip emoji out of `feedContent.ts` sample
captions or `EditorPage.tsx` demo text — those are data, not UI chrome.

**Rule of thumb:** if the emoji is standing in for a button, label,
status indicator, nav item, or any other UI *element* — use an icon
component. If it's inside a string that represents what a real person
typed as content — leave it as text.

**Common lucide-react mappings used in this project:**

| Concept | Icon |
|---|---|
| Like / Thumbs up | `ThumbsUp` |
| Love / Heart | `Heart` |
| Laugh / Haha | `Laugh` |
| Sad | `Frown` |
| Angry | `Angry` |
| Celebrate / Wow | `PartyPopper` |
| Support | `Handshake` |
| Insightful | `Lightbulb` |
| Article / News | `Newspaper` |
| Rocket / Launch | `Rocket` |
| Check / Done | `Check` |
| Dashboard/overview | `LayoutGrid` |
| Content/document | `FileText` |
| Calendar | `CalendarDays` |
| Upload/publish | `Upload` |
| Analytics chart | `LineChart` |
| Sidebar nav | `LayoutDashboard`, `FolderOpen`, `FileEdit`, `Users`, `BarChart3`, `ShieldAlert` |

Check `node_modules/lucide-react` or [lucide.dev](https://lucide.dev)
for the full icon set before reaching for an emoji as a fallback.

## i18n

- Default `vi`, fallback `vi`. Locale files: `src/i18n/locales/vi.json`,
  `src/i18n/locales/en.json`.
- Keep the two files key-parallel — a key added to one must be added to the
  other.
- For user-facing strings passed to translation helpers, use `t('key')`; do not
  hardcode Vietnamese text in components where an i18n key already exists.

## Landing / Cinematic Pages

- `src/pages/DashboardPage.tsx` is the unauthenticated marketing landing page.
  It composes sections from `src/components/landing/*` (Hero, Features,
  Pricing, FAQ, CTA, Footer, Stats, etc.).
- `src/components/landing/cinematic/*` holds the animated MacBook
  dashboard-reel (CinematicHero and its reusable pieces). Animation-heavy code
  uses GSAP/ScrollTrigger and CSS keyframes defined in `globals.css`.
- Keep cinematic pseudo-data in `feedContent.ts`; UI animations in
  components; do not mix content and choreography.

## Conventions

- TypeScript strict: `noUnusedLocals`/`noUnusedParameters` are on. No dead code,
  no unused imports — clean them or `tsc` fails.
- Use `cn()` from `@/lib/utils` to merge/sanitize class names on presentational
  components.
- Prefer small, single-purpose components over large monolithic files.
- Default to writing **no comments**; add one only when the WHY is non-obvious.
  Do not restate what the code obviously does.

## Feature Workflow

Mọi tính năng phát triển phải tuân theo quy trình **spec → plan → task → test**
trước khi viết code, và quay lại từ `spec.md` nếu có sai sót.

Xem nguồn sự thật duy nhất: `../brandhub-infrastructure/docs/rule/feature-workflow.md`
