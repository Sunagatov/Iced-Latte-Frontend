# 🧩 Feature Packaging Rule

Iced Latte Frontend is organized as a feature-first Next.js application. Routes live in `src/app`, product/business UI lives in `src/features`, and cross-feature building blocks live in `src/shared`.

The goal is simple: when a contributor opens a feature folder, most of the UI, hooks, state, and helpers for that user flow should be there.

---

## ✅ Core Rule

If code belongs to one user-facing feature, keep it inside that feature package.

Good examples:

| Code | Package | Why |
|---|---|---|
| `CartSummary` | `features/cart/components` | cart-owned UI |
| `useCheckoutForm` | `features/checkout` | checkout-specific form behavior |
| `favoritesStore` | `features/favorites/state` | favorites-owned client state |
| `ProductCard` | `features/products/components` | product catalog UI |
| `OrdersPageContent` | `features/orders/components` | orders-owned page content |
| `apiClient` | `shared/api` | generic API client used across features |

Do not move feature-specific code into `shared` just because it looks reusable.

---

## 📦 Feature Packages

Current frontend feature packages:

| Package | Owns |
|---|---|
| `addresses` | delivery address UI and address management |
| `auth` | sign-in, sign-up, password reset, auth hooks |
| `cart` | cart UI, cart state, cart routes |
| `checkout` | checkout flow and checkout form |
| `favorites` | favorites UI, routes, state |
| `home` | home page sections |
| `orders` | order history and order-related UI |
| `payment` | payment-facing frontend logic |
| `products` | catalog, product cards, product details |
| `reviews` | reviews and ratings UI |
| `session` | cross-flow session orchestration |
| `user` | profile and account UI |

---

## 🏗️ Package Shape

Most feature packages use a shape like this:

```text
feature/
├── components/    # feature-specific UI
├── hooks/         # feature-specific hooks
├── state/         # feature-specific client state
├── routes/        # feature route-level helpers
├── utils/         # feature-only utilities
└── api.ts         # feature API functions when useful
```

Not every feature needs every folder. Add folders when they make the feature easier to understand, not just to match a template.

---

## 🧭 `app`, `features`, `shared`, and `types`

| Area | Purpose |
|---|---|
| `src/app` | Next App Router routes, route handlers, layouts, providers, route entry points |
| `src/features` | user-facing feature slices and product flows |
| `src/shared` | cross-feature UI, API clients, config, auth helpers, generic utilities |
| `src/types` | global declaration files |

Route files in `src/app` should stay thin. They should compose feature components instead of owning large business/UI logic.

---

## 🔧 What Belongs In `shared`

`shared` is only for genuinely shared, cross-feature code that is not owned by one feature.

Allowed examples:

- API client setup
- route constants
- feature flags
- generic UI primitives
- shared TypeScript types
- cookie/token helpers
- generic formatting utilities
- cross-feature auth/session helpers

`shared` must not become a dumping ground for:

- feature-specific components
- page-specific UI
- feature-specific state
- feature-specific validation
- feature-specific API functions
- feature-specific constants
- one-off helpers used by only one feature

---

## ✅ `shared` Promotion Rule

Start code inside the feature that needs it.

Move code to `shared` only when all of these are true:

- at least two independent features use it
- it has no natural feature owner
- its API is stable enough to share
- moving it reduces duplication without hiding feature behavior

If you are unsure, keep it in the feature package first. It is easier to promote stable shared code later than to untangle feature logic from `shared`.

---

## 🧠 Placement Examples

| New code | Correct place | Why |
|---|---|---|
| `CartBadge` | `features/cart/components` | cart-owned UI |
| `CheckoutSuccessView` | `features/checkout/components` | checkout-owned success UI |
| `ProductImageFallback` | `features/products/components` or `shared/ui` | use `products` if product-specific; use `shared/ui` only if reused generically |
| `formatPrice` | `shared/utils` | generic formatting used across features |
| `useLogout` | `features/auth/hooks` | auth-owned behavior |
| `AuthTokenCookie` helper | `shared/auth` | cross-feature auth infrastructure |
| `FavoriteButton` | `features/favorites/components` | favorites-owned interaction |
| `ApiError` type | `shared/types` | generic API error shape |

---

## 🔌 Cross-Feature Dependencies

Avoid direct dependencies on another feature's internal implementation.

Avoid:

```text
checkout -> cart/state internals
orders -> products/components internals
favorites -> products/utils internals
auth -> user/components internals
```

Prefer:

```text
checkout -> cart public hook or small exported helper
orders -> shared/types for common DTOs
favorites -> products API/data contract when needed
auth -> shared/auth helpers
```

If a feature needs to expose behavior to another feature, keep the exposed surface small and intentional.

---

## 🚫 Bad Package Direction

Do not organize frontend code only by technical layer globally:

```text
components/
hooks/
stores/
utils/
api/
```

That structure makes user flows hard to understand because one feature is scattered across the whole codebase.

Prefer feature-first organization:

```text
features/cart/
├── components/
├── routes/
├── state/
└── utils/
```

---

## 🧪 Testing Rule

Tests should follow the same ownership idea.

Feature behavior should be tested with the feature or user flow it belongs to:

```text
__tests__/cart/
__tests__/checkout/
e2e/cart.e2e.ts
e2e/checkout.e2e.ts
```

Shared infrastructure behavior can have shared tests:

```text
__tests__/shared/
```

---

## ✅ Contributor Checklist

Before adding or moving code:

- Does this belong to one feature?
- Is this route file getting too much logic?
- Am I putting feature behavior into `shared`?
- Is this component genuinely reusable, or only reused once?
- Am I depending on another feature's internals?
- Can I expose a smaller helper or shared type instead?
- Did I update tests for the feature or user flow that owns the behavior?

When in doubt, keep code closer to the user-facing feature that owns it.

---

## 🎯 Practical Target

A contributor should be able to open a feature package and find nearly everything needed for that slice:

- UI components
- hooks
- state
- feature API calls
- feature-only utilities
- route-level helpers
- tests for that behavior

That is the default direction for all new code and for incremental refactors of existing code.
