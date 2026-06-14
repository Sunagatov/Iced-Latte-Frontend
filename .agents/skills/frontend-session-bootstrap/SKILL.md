---
name: frontend-session-bootstrap
description: Use when debugging or changing frontend session bootstrap, auth store transitions, refresh retry behavior, or `401` recovery flow in Iced Latte Frontend.
---

# Frontend Session Bootstrap

Session bootstrap is the source of truth for frontend auth state.

## Read Order

1. `AGENTS.md`
2. `docs/AUTH.md`
3. The smallest relevant files under:
   - `src/features/session`
   - `src/features/auth/store.ts`
   - `src/app/providers/AuthInterceptor.tsx`
   - `src/features/user/api.ts`

## Core Rules

- Keep `bootstrapClientSession()` plus user lookup as the source of truth for auth status.
- Preserve the `loading -> anonymous/authenticated` state machine unless the task explicitly changes it.
- Keep refresh handling aligned with the documented `401 -> refresh -> retry or clear session` flow.
- Do not manually read refresh tokens in frontend code.

## Verification

- Prefer the smallest auth/session test first.
- Use Playwright only when the state issue crosses into route protection or user-flow behavior.
