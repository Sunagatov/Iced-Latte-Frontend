# 🎭 E2E Test Plan — Iced Latte Frontend

This document tracks Playwright coverage for critical user flows in Iced Latte Frontend.

> **Status note:** E2E files are actively evolving. Treat this as the intended coverage map and update it whenever tests are renamed, moved, added, or deleted.

---

## 🎯 Goals

E2E tests should prove that the app works from a user's point of view:

- core pages load
- navigation works
- auth-sensitive routes behave correctly
- cart and favorites flows sync correctly
- checkout and orders behave safely
- important errors and empty states are visible

E2E tests should not duplicate every unit test. Use them for user journeys and integration behavior.

---

## ▶️ How To Run

Start the app first:

```bash
npm run dev
```

Run E2E tests:

```bash
npm run test:e2e
```

Run against a specific base URL:

```bash
BASE_URL=http://localhost:3000 npm run test:e2e
```

View report:

```bash
npm run test:e2e:report
```

---

## ✅ Coverage Map

| Area | Example files | Priority | Notes |
|---|---|---|---|
| Smoke / home | `smoke.e2e.ts`, `home` tests | 🔴 High | app loads and basic shell renders |
| Navigation | navigation tests | 🔴 High | header links, route transitions |
| Auth guest flows | `auth.guest.ts` | 🔴 High | sign-in, sign-up, protected redirects |
| Catalog | `catalog.e2e.ts` | 🔴 High | product list, sort/filter/search |
| Product detail | `product.e2e.ts` | 🔴 High | product details, reviews entry points |
| Cart | `cart.e2e.ts` | 🔴 High | add/remove/update cart items |
| Favorites | `favourites.e2e.ts` | 🟡 Medium | toggle, list page, empty state |
| Checkout | `checkout.e2e.ts` | 🔴 High | protected route, form, submit behavior |
| Orders | `profile-orders.e2e.ts` | 🟡 Medium | order history and order states |
| Profile | `profile-orders.e2e.ts`, profile tests | 🟡 Medium | profile display/edit behavior |

---

## 🔴 Critical Flows

These should stay covered before releases.

### Auth

- guest can open sign-in page
- protected page redirects guest to `/signin?next=...`
- authenticated user is not sent to guest-only pages
- logout clears local user/cart/favorites state

### Catalog and product detail

- home/catalog loads products
- search/filter/sort changes visible products
- product card links to detail page
- product detail page renders product data

### Cart

- user can add product to cart
- user can increase/decrease quantity
- user can remove item
- cart badge and cart page stay in sync

### Checkout

- guest is redirected to sign-in
- empty cart state is handled
- required fields block submission
- successful submit reaches the expected next page
- API error is shown without losing user input

### Favorites

- favorite toggle updates UI
- favorites page shows saved products
- removing favorite updates list and empty state

---

## 🟡 Important Edge Cases

Add or keep coverage when touching these areas:

- expired session during API call
- backend unavailable
- empty product list
- empty orders list
- invalid reset-password token
- email confirmation failure
- checkout API failure
- slow network / loading states

---

## 🧪 Test Data Rules

- Prefer stable seed users from the backend local/dev profile.
- Use `olivia@example.com / p@ss1logic11` when a normal logged-in user is needed.
- Keep tests independent; one test should not require state created by a previous test.
- Clean up browser state between tests.
- Prefer page objects/helpers for repeated flows.

---

## 🧱 Test Structure

Recommended shape:

```text
e2e/
├── helpers/          # shared test helpers
├── pages/            # page objects
├── auth.guest.ts
├── cart.e2e.ts
├── catalog.e2e.ts
├── checkout.e2e.ts
├── favourites.e2e.ts
├── product.e2e.ts
└── profile-orders.e2e.ts
```

Keep helpers boring and explicit. Avoid hiding important assertions inside overly clever abstractions.

---

## ✅ Definition of Done for E2E Changes

Before merging E2E changes:

- tests pass locally
- selectors are stable and user-oriented where possible
- waits are based on UI/network conditions, not arbitrary sleeps
- failures produce useful traces/screenshots
- test names describe user behavior
- docs are updated if files or scenarios are renamed

---

## 📌 Maintenance Notes

When E2E files are renamed or split:

- update this plan
- update README or contributing docs if commands change
- remove stale references to old `.spec.ts` names
- keep CI and local commands aligned
