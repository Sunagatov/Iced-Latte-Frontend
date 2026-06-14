---
name: frontend-auth-session-routing
description: Use when changing sign-in, sign-up, logout, session bootstrap, refresh, OAuth callback flow, protected routes, guest-only routes, cookie handling, or any frontend auth behavior in Iced Latte Frontend.
---

# Frontend Auth Session Routing

This repo uses cookie-backed auth with `HttpOnly` tokens stored through Next.js server surfaces.

## Read Order

1. `AGENTS.md`
2. `docs/AUTH.md`
3. The smallest relevant file under:
   - `src/features/auth`
   - `src/features/session`
   - `src/shared/auth`
   - `src/app/providers/AuthInterceptor.tsx`
   - `src/app/api/`

## Hard Rules

- Raw access and refresh tokens must not be stored in JavaScript-readable client state.
- Treat React auth state as a UI view of the backend-confirmed session, not as source of truth.
- Preserve callback, cookie, refresh, and `?next=` route behavior unless the task explicitly changes the contract.
- For Google OAuth work, keep the browser callback limited to the one-time handoff code flow described in `docs/AUTH.md`.

## Verification

1. Run the smallest relevant unit or route test first.
2. For user-flow changes, run the narrowest relevant Playwright spec.
3. Broaden to `npm run test:e2e:local` only when the auth change affects multiple journeys.
