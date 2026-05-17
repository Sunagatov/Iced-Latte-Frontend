# 🔐 Auth Architecture

This document explains how authentication works in Iced Latte Frontend: where session state lives, how cookies flow through the Next.js proxy, how refresh works, and which files to check before changing auth behavior.

---

## 🧭 Model

The app uses **token-backed cookie-session auth**.

The backend issues access/refresh tokens. The frontend stores them in `HttpOnly` cookies through Next.js server actions / route handlers. The frontend does not store raw access or refresh tokens in JavaScript-accessible storage.

```text
Browser
  ↓
Next.js proxy / route handlers
  ↓ forwards cookie header
Backend API
```

Why this matters:

- JavaScript cannot directly read `HttpOnly` cookies.
- Browser requests can still carry cookies automatically.
- The Next.js proxy forwards cookies to the backend.
- Auth state in React is only a UI view of the backend-confirmed session.

---

## 🧠 Auth State

Client auth state lives in:

```text
src/features/auth/store.ts
```

State shape:

```ts
status: 'loading' | 'anonymous' | 'authenticated'
userData: UserData | null
```

| Status | Meaning |
|---|---|
| `loading` | session bootstrap is in progress |
| `anonymous` | no active session |
| `authenticated` | backend confirmed a valid session |

There are **no raw tokens in client state**.

`isLoggedIn` is a computed compatibility helper:

```ts
status === 'authenticated'
```

---

## 🚀 Session Bootstrap

On app startup, the frontend checks whether the current cookie-backed session is valid:

```text
App mounts
  ↓
bootstrapClientSession()
  ↓
GET /users
  ↓
success: setAuthenticated(user)
failure: POST /auth/refresh, then retry user lookup or setAnonymous()
```

This is the single source of truth for client auth status.

Main files:

| File | Responsibility |
|---|---|
| `src/app/providers/AppProviders.tsx` | app bootstrap and provider wiring |
| `src/features/session/useSessionBootstrap.ts` | starts session bootstrap on app mount |
| `src/features/session/session.ts` | bootstrap, refresh, clear, and store sync logic |
| `src/features/user/api.ts` | `getUserData()` user lookup |
| `src/features/auth/store.ts` | auth status state machine |

---

## 🔑 Login Flow

```text
User submits credentials
  ↓
POST /auth/authenticate
  ↓
Backend returns access/refresh tokens
  ↓
Next.js server action stores tokens in HttpOnly cookies
  ↓
Frontend fetches current user data
  ↓
Redirect to ?next=... or /profile
```

Main files:

| File | Responsibility |
|---|---|
| `src/features/auth/components/LoginForm.tsx` | sign-in form |
| `src/features/auth/api.ts` | login and session API calls |

---

## 📧 Email Verification Flow

```text
User submits 9-digit code
  ↓
POST /auth/confirm
  ↓
Backend returns access/refresh tokens
  ↓
Next.js server action stores tokens in HttpOnly cookies
  ↓
Frontend fetches current user data
  ↓
Redirect to ?next=... or /profile
```

Main files:

| File | Responsibility |
|---|---|
| `src/features/auth/components/VerifyEmailCodeForm.tsx` | confirmation form |
| `src/features/auth/api.ts` | `verifyEmailCode(code)` |

---

## 🔄 Token Refresh Flow

Refresh is handled automatically by the auth interceptor.

```text
Any API call returns 401
  ↓
POST /auth/refresh
  ↓
Proxy/backend use the refresh token from the HttpOnly cookie
  ↓
Success: fetch current user + retry original request
Failure: clear local session and redirect to /signin
```

Main file:

```text
src/app/providers/AuthInterceptor.tsx
```

Important rule: frontend code should not manually read refresh tokens.

---

## 🌐 Google OAuth Flow

```text
User clicks "Sign in with Google"
  ↓
Backend OAuth endpoint
  ↓
Google
  ↓
Backend callback
  ↓
/auth/google/callback#token=...&refreshToken=...
  ↓
Frontend posts tokens to /api/auth/google/callback
  ↓
Next.js route sets HttpOnly cookies
  ↓
Frontend fetches current user and redirects
```

Main file:

```text
src/app/auth/google/callback/page.tsx
```

Important rule: OAuth callback tokens are read from:

```text
window.location.hash
```

not:

```text
window.location.search
```

---

## 🚪 Logout Flow

```text
POST /auth/logout
  ↓
Backend invalidates the session when possible
  ↓
Frontend clears HttpOnly cookies and local stores
  ↓
Redirect to /signin
```

Local stores reset on logout include auth, cart, and favorites.

Main file:

```text
src/features/auth/hooks/useLogout.ts
```

---

## 🛡️ Route Protection

| Route type | Protection |
|---|---|
| Protected pages like `/profile` | server-side cookie check; redirect to `/signin?next=/profile` if missing or expired |
| Guest-only pages like `/signin` and `/signup` | `RestrictRoute` redirects authenticated users away |

The `?next=<path>` parameter preserves where the user wanted to go before login.

---

## 🔁 Proxy Behavior

The proxy lives at:

```text
src/app/api/proxy/[...path]/route.ts
```

Responsibilities:

- forward browser requests to the backend
- forward the `cookie` header
- avoid injecting JavaScript-readable `Authorization` tokens
- preserve backend auth/session behavior

---

## ✅ Contributor Rules

When changing auth code:

- Do not store access or refresh tokens in `localStorage`, `sessionStorage`, Zustand, or React state.
- Keep `HttpOnly` cookies as the session transport.
- Keep `bootstrapClientSession()` + `getUserData()` as the source of truth for auth status.
- Keep route redirects using `?next=` when login is required.
- Update tests when login, logout, refresh, or route protection behavior changes.
- Treat OAuth callback behavior as security-sensitive.

---

## 🧪 Suggested Test Coverage

Auth changes should usually cover:

- anonymous user redirects from protected pages
- authenticated user redirects away from guest-only pages
- login success
- login failure
- logout clears local state
- refresh after `401`
- Google callback success/failure if touched
- password reset / email confirmation if touched

---

## 🗂️ Key Files

| File | Responsibility |
|---|---|
| `src/features/auth/store.ts` | auth status state machine |
| `src/features/auth/api.ts` | login, registration, confirmation, and logout API calls |
| `src/features/session/session.ts` | session bootstrap, refresh, clear, and store sync logic |
| `src/features/session/useSessionBootstrap.ts` | starts session bootstrap on app startup |
| `src/app/providers/AppProviders.tsx` | app provider wiring |
| `src/app/providers/AuthInterceptor.tsx` | auto-refresh on `401` |
| `src/features/auth/RestrictRoute.tsx` | guest-only route guard |
| `src/shared/auth/cookies.ts` | server-side cookie helpers |
| `src/app/api/proxy/[...path]/route.ts` | API proxy that forwards cookies |
| `src/app/profile/page.tsx` | example protected page |
| `src/app/auth/google/callback/page.tsx` | Google OAuth callback page |
