# Auth Architecture

This document explains how authentication works in Iced Latte Frontend.

---

## Model

The app uses **cookie-session auth**. The backend owns the session and sets an `HttpOnly` cookie on login. The frontend never stores raw tokens in JavaScript-accessible storage.

```
Browser → Next.js proxy (/api/proxy) → Backend API
                ↑
         forwards cookie header
```

---

## Auth State

Auth state lives in `src/features/auth/store.ts` as a simple state machine:

```ts
status: 'loading' | 'anonymous' | 'authenticated'
userData: UserData | null
```

- `loading` — session bootstrap in progress (app startup)
- `anonymous` — no active session
- `authenticated` — valid session confirmed by backend

There are **no tokens in client state**. `isLoggedIn` is a computed getter (`status === 'authenticated'`) kept for backward compatibility.

---

## Session Bootstrap

On app startup, `AppInitProvider` calls `GET /auth/session` to ask the backend whether the current cookie is valid:

```
App mounts → apiGetSession() → { authenticated, user }
                                      ↓
                             setAuthenticated(user)  or  setAnonymous()
```

This is the **single source of truth** for auth status on the client.

---

## Login Flow

1. User submits credentials → `POST /auth/authenticate`
2. Backend sets `HttpOnly` session cookie in the response
3. Frontend calls `apiGetSession()` to populate auth state
4. Redirect to `?next=` param or `/profile`

**Files:** `LoginForm.tsx`, `features/auth/api.ts`

---

## Email Verification Flow

1. User submits 9-digit code → `POST /auth/confirm` via `verifyEmailCode(code)`
2. Backend sets session cookie
3. Frontend calls `apiGetSession()` to populate auth state
4. Redirect to `?next=` or `/profile`

**Files:** `ConfirmPasswordComponent.tsx`, `features/auth/api.ts`

---

## Token Refresh Flow

Handled automatically by `AuthInterceptor`:

1. Any API call returns `401`
2. Interceptor calls `POST /auth/refresh` — backend reads refresh token from `HttpOnly` cookie
3. On success: call `apiGetSession()` to re-sync auth state, retry original request
4. On failure: call `logout()`

**File:** `shared/providers/AuthInterceptor.tsx`

---

## Google OAuth Flow

1. User clicks "Sign in with Google" → redirected to backend OAuth endpoint
2. Backend handles OAuth, sets `HttpOnly` session cookie, redirects to `/auth/google/callback`
3. Callback page checks for `?error=` param; on success redirects to `/`
4. `AppInitProvider` session bootstrap picks up the new session

**File:** `app/auth/google/callback/page.tsx`

---

## Logout Flow

1. `POST /auth/logout` — backend clears the session cookie
2. Frontend resets all local stores (auth, cart, favourites)
3. Redirect to `/signin`

**File:** `features/auth/hooks/useLogout.ts`

---

## Route Protection

| Route type | How protected |
|---|---|
| `/profile` (and other protected pages) | Server-side: reads cookie, redirects to `/signin?next=/profile` if missing/expired |
| `/signin`, `/signup` (guest-only) | `RestrictRoute` server component: redirects to `/` if session cookie present |

Protected pages redirect with `?next=<path>` so the user lands back after login.

---

## Proxy

`src/app/api/proxy/[...path]/route.ts` forwards all browser requests to the backend. It forwards the `cookie` header so the backend can authenticate the request. No `Authorization` header is injected by the frontend.

---

## Key Files

| File | Responsibility |
|---|---|
| `features/auth/store.ts` | Auth status state machine |
| `features/auth/api.ts` | Auth API calls incl. `apiGetSession` |
| `shared/providers/AppInitProvider.tsx` | Session bootstrap on app startup |
| `shared/providers/AuthInterceptor.tsx` | Auto-refresh on 401 |
| `shared/providers/RestrictRoute.tsx` | Guest-only route guard |
| `shared/utils/cookieUtils.ts` | Server-side cookie helpers |
| `app/api/proxy/[...path]/route.ts` | API proxy (forwards cookie) |
| `app/profile/page.tsx` | Example of a server-protected page |
