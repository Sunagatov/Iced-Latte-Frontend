# E2E Test Plan — Iced Latte Frontend

**Baseline:** 78 tests across 12 files (all passing)

---

## Coverage map

| Area | File | Tests | Status |
|---|---|---|---|
| Home page loads | `home.spec.ts` | 1 | ✅ done |
| Navigation / routing | `navigation.spec.ts` | 11 | ✅ done |
| Auth (sign in / sign up) | `auth.spec.ts` | 4 | ✅ done |
| Product catalog / sort | `catalog.spec.ts` | 5 | ✅ done |
| Filter sidebar | `filters.spec.ts` | 14 | ✅ done |
| Search bar | `search.spec.ts` | 7 | ✅ done |
| Product detail page | `product-detail.spec.ts` | 5 | ✅ done |
| Cart page (basic) | `cart.spec.ts` | 5 | ✅ done |
| Favourites page (basic) | `favourites.spec.ts` | 3 | ✅ done |
| Cart + fav sync on login | `sync.spec.ts` | 6 | ✅ done |
| Plus/minus/trash/heart buttons | `buttons.spec.ts` | 13 | ✅ done |
| Logged-in user flows | `user-flows.spec.ts` | 4 | ✅ done |

---

## Gaps — new tests to add

### 1. `checkout.spec.ts` — Checkout flow
**Why:** Checkout is a critical conversion path with zero e2e coverage.

| # | Test | Priority | Status |
|---|---|---|---|
| 1 | Guest redirected to `/signin` when visiting `/checkout` | 🔴 High | ⬜ todo |
| 2 | Logged-in user with empty cart sees empty-cart message / redirect | 🔴 High | ⬜ todo |
| 3 | Checkout form renders with cart summary | 🔴 High | ⬜ todo |
| 4 | Required fields validation — submit blocked when fields empty | 🔴 High | ⬜ todo |
| 5 | Successful order submission → redirects to `/orders` | 🔴 High | ⬜ todo |
| 6 | API error on submit → shows error message, stays on page | 🟡 Medium | ⬜ todo |
| 7 | Cart is cleared after successful order | 🟡 Medium | ⬜ todo |

---

### 2. `orders.spec.ts` — Order history
**Why:** Orders page has status filters, expandable cards, and empty/error states — none tested.

| # | Test | Priority | Status |
|---|---|---|---|
| 1 | Orders page shows list of orders | 🔴 High | ⬜ todo |
| 2 | Empty state shown when no orders | 🔴 High | ⬜ todo |
| 3 | Clicking order card expands item details | 🟡 Medium | ⬜ todo |
| 4 | Status filter tabs filter orders correctly | 🟡 Medium | ⬜ todo |
| 5 | API error shows retry button | 🟡 Medium | ⬜ todo |
| 6 | Clicking product name in expanded order navigates to product page | 🟢 Low | ⬜ todo |

---

### 3. `profile.spec.ts` — User profile editing
**Why:** Profile form has validation, save flow, and image upload — none tested.

| # | Test | Priority | Status |
|---|---|---|---|
| 1 | Profile page shows pre-filled user data | 🔴 High | ⬜ todo |
| 2 | Editing first/last name and saving calls API | 🔴 High | ⬜ todo |
| 3 | Validation error shown for invalid phone number | 🟡 Medium | ⬜ todo |
| 4 | Save button disabled when form has errors | 🟡 Medium | ⬜ todo |
| 5 | API error on save shows error message | 🟡 Medium | ⬜ todo |

---

### 4. `reviews.spec.ts` — Product reviews
**Why:** Review form, star rating, and submit flow are untested.

| # | Test | Priority | Status |
|---|---|---|---|
| 1 | "Write a review" button redirects guest to `/signin` | 🔴 High | ⬜ todo |
| 2 | Logged-in user sees review form after clicking "Write a review" | 🔴 High | ⬜ todo |
| 3 | Submit button disabled until rating + text both filled | 🔴 High | ⬜ todo |
| 4 | Successful review submit adds review to list | 🟡 Medium | ⬜ todo |
| 5 | Cancel button hides form and resets fields | 🟡 Medium | ⬜ todo |
| 6 | Character counter updates as user types | 🟢 Low | ⬜ todo |

---

### 5. `auth-edge.spec.ts` — Auth edge cases
**Why:** Password reset, email confirmation, and Google OAuth flows are untested.

| # | Test | Priority | Status |
|---|---|---|---|
| 1 | Forgot password form submits email and shows confirmation | 🔴 High | ⬜ todo |
| 2 | Reset password form validates new password and confirms | 🔴 High | ⬜ todo |
| 3 | Sign-in form shows validation error for empty fields | 🟡 Medium | ⬜ todo |
| 4 | Sign-up form shows validation error for weak password | 🟡 Medium | ⬜ todo |
| 5 | Confirm registration page renders correctly | 🟢 Low | ⬜ todo |

---

### 6. `favourites-page.spec.ts` — Favourites page interactions
**Why:** Current `favourites.spec.ts` only tests the heart toggle on the catalog. The `/favourites` page itself (remove, empty state, navigate to product) is untested.

| # | Test | Priority | Status |
|---|---|---|---|
| 1 | Favourites page shows saved products | 🔴 High | ⬜ todo |
| 2 | Removing a favourite from the favourites page updates the list | 🔴 High | ⬜ todo |
| 3 | Empty state shown when all favourites removed | 🟡 Medium | ⬜ todo |
| 4 | Clicking a favourite product navigates to product detail | 🟢 Low | ⬜ todo |

---

## Progress summary

| File | Tests planned | Done | Remaining |
|---|---|---|---|
| `checkout.spec.ts` | 7 | 0 | 7 |
| `orders.spec.ts` | 6 | 0 | 6 |
| `profile.spec.ts` | 5 | 0 | 5 |
| `reviews.spec.ts` | 6 | 0 | 6 |
| `auth-edge.spec.ts` | 5 | 0 | 5 |
| `favourites-page.spec.ts` | 4 | 0 | 4 |
| **Total new** | **33** | **0** | **33** |

**Overall:** 78 existing + 33 planned = **111 target tests**
