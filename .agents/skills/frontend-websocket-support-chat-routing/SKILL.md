---
name: frontend-websocket-support-chat-routing
description: Use when changing authenticated support chat, STOMP or websocket endpoint routing, support chat feature flags, cookie-backed websocket auth, or support chat launcher visibility in Iced Latte Frontend.
---

# Frontend Websocket Support Chat Routing

Support chat is an authenticated feature with repo-specific runtime and cookie rules.

## Read Order

1. `AGENTS.md`
2. `docs/getting-started.md`
3. `docs/AUTH.md`
4. The smallest relevant files under:
   - `src/shared/api/generated/supportChat.ts`
   - support-chat feature code
   - `src/app/api/` if route/proxy behavior is involved

## Core Rules

- Keep support chat auth aligned with frontend `HttpOnly` cookie transport.
- If `NEXT_PUBLIC_SUPPORT_CHAT_WS_URL` is unset, the widget should use the same-origin `/api/v1/ws` route.
- Any websocket endpoint override must still receive the frontend auth cookie.
- Preserve launcher visibility and allowlist behavior unless the task explicitly changes those product rules.

## Verification

- Run the narrowest support-chat-related test first.
- Broaden to browser-level verification only when launcher visibility or authenticated user flow behavior changes.
