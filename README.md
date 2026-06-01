# brandhub-web-dashboard

Web admin dashboard for BrandHub — content management, approval workflows, scheduling, and analytics.

## Overview

React 18 + TypeScript SPA built with Vite. Used by agency staff (ADMIN, AGENCY_OWNER, ACCOUNT_MANAGER, CONTENT_CREATOR) to manage clients, create/approve/schedule social posts, and view campaign performance.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node 20 |
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| UI Components | shadcn/ui (Radix UI primitives) |
| State | Zustand (auth + UI state) |
| Server State | TanStack Query v5 |
| Routing | React Router DOM v6 |
| HTTP | Axios (auto JWT refresh interceptor) |

## Key Features

- JWT auth persisted via Zustand + localStorage
- Auto token refresh on 401 — redirects to `/login` on failure
- Role-based UI rendering
- Post calendar view, content approval queue, social account management
- Path alias `@` → `src/`

## Running Locally

```bash
cp .env.example .env
npm install
npm run dev
```

Dev server: `http://localhost:3000`  
All `/api` requests proxied to `http://localhost:8080` (api-gateway).

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | API Gateway base URL |
| `VITE_APP_NAME` | `BrandHub` | App display name |

## Build

```bash
npm run build   # outputs to dist/
```

Production Docker image uses nginx to serve static files and reverse-proxy `/api` to api-gateway.
