---
name: frontend-route-handler-proxy
description: Use when changing Next.js route handlers, API proxy behavior, cookie forwarding, backend pass-through requests, OAuth token handoff, or server-side auth cookie persistence in Iced Latte Frontend.
---

# Frontend Route Handler Proxy

Route handlers in this repo are part of the auth and backend boundary, not generic helpers.

## Read Order

1. `AGENTS.md`
2. `docs/AUTH.md`
3. The smallest relevant file under `src/app/api/`
4. Any directly consuming feature file

## Core Rules

- Preserve proxy forwarding behavior unless the contract explicitly changes.
- Keep `HttpOnly` cookies as the session transport.
- Do not expose raw access or refresh tokens to JavaScript-readable client state.
- Persist only known token-pair responses as auth cookies.
- Avoid forwarding browser-supplied proxy identity headers such as `X-Forwarded-For` unless the contract intentionally changes.

## Main Surfaces

- `src/app/api/proxy/[...path]/route.ts`
- `src/app/api/auth/google/route.ts`
- token/cookie helpers under `src/shared/auth`

## Verification

- Run the narrowest affected test first.
- For auth or callback behavior changes, run the narrowest relevant Playwright flow.
