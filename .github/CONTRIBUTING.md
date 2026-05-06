# 🤝 Contributing to Iced Latte Frontend

Thanks for your interest in contributing. Iced Latte Frontend is built in the open so engineers can practice on a real Next.js/React codebase with product flows, API integration, state management, UI work, tests, and pull requests.

> **Intellectual property notice:** By submitting any contribution, you irrevocably assign all rights to the author (Zufar Sunagatov). Contributors have no ownership, copyright, or other IP claim over the Iced Latte project or any related repository. These terms have been in effect since the project's creation in 2022. See [`LICENSE`](../LICENSE) Sections 7-8 for full details.

---

## 📜 License & Contribution Terms

Before contributing, read the [Iced Latte Personal Evaluation License 2026](../LICENSE).

Important points:

- Contributions are accepted only under the project's license terms.
- By opening a PR, issue patch, code suggestion, documentation change, design, test, or other contribution, you assign the contribution rights to the author.
- Contributors do not receive ownership, copyright, trademark, commercial, publication, hosting, sublicensing, or redistribution rights.
- Personal local evaluation is allowed.
- Public, educational, remote-hosted, commercial, or redistributed use requires explicit written permission from the author.
- Do not contribute code, text, images, assets, or designs you do not have the right to submit.

If you do not agree with these terms, do not submit a contribution.

---

## 🧭 Start Here

| I want to... | What to do |
|---|---|
| 🟢 Make my first contribution | Pick a [`good first issue`](https://github.com/Sunagatov/Iced-Latte-Frontend/issues?q=is%3Aopen+label%3A%22good+first+issue%22) and comment "I'm on it" |
| 🐛 Report a bug | [Open an issue](https://github.com/Sunagatov/Iced-Latte-Frontend/issues/new) with clear observed vs expected behavior |
| 💡 Suggest a feature | Start a [Discussion](https://github.com/Sunagatov/Iced-Latte-Frontend/discussions) before implementation |
| 🔧 Make a larger change | Comment on the issue first so constraints can be clarified |
| 🔐 Report a vulnerability | Follow the [Security Policy](../SECURITY.md) instead of opening a public issue |

---

## 🏷️ Issue Labels

| Label | Meaning |
|---|---|
| 🟢 `good first issue` | Simple, well-scoped, and good for first-time contributors |
| 🔴 `bug` | Something is broken |
| 🔵 `high priority` | Important work that should be handled first |
| 🟡 `enhancement` | Improvement to an existing feature or UI flow |
| 🟠 `new feature` | New functionality; discuss before starting |
| ⚪ `idea` | Needs design discussion; do not implement yet |

---

## 🚀 Local Setup

Use the full [Getting Started Guide](../docs/getting-started.md). It covers:

- frontend-local setup
- backend + frontend setup
- Docker modes
- backend connection
- environment variables
- tests
- troubleshooting

For frontend work, the common local flow is:

```bash
git clone https://github.com/Sunagatov/Iced-Latte.git
git clone https://github.com/Sunagatov/Iced-Latte-Frontend.git

cd Iced-Latte
docker compose --env-file .env.example --profile backend up -d --build

cd ../Iced-Latte-Frontend
cp .env.example .env.local
npm ci
npm run dev
```

---

## ✅ Before Opening a PR

Run the frontend checks:

```bash
npm run lint
npm run tsc -- --noEmit
npm test
```

If your change touches user flows, routing, authentication, cart/favorites/session behavior, checkout, orders, or shared API handling, also consider E2E coverage:

```bash
npm run test:e2e
```

Before submitting:

- 🎯 Keep the PR focused on one concern
- ✅ Make sure lint, type-check, and tests pass locally
- 🔗 Link the related issue in the PR description
- 📝 Explain what changed and how you tested it
- 📸 Add screenshots or short screen recordings for UI changes
- 🚫 Do not include unrelated refactors, formatting churn, or generated noise

---

## 🌿 Branches & PR Titles

Use short, descriptive branch names:

- `fix/cart-badge-count`
- `feature/order-history-page`
- `docs/getting-started-windows`
- `test/checkout-flow`

Good PR titles explain the change directly:

- `Fix cart badge count after logout`
- `Add order history empty state`
- `Clarify Windows setup in Getting Started`
- `Add Playwright coverage for checkout flow`

---

## 📦 PR Size

Small PRs are easier to review and merge.

Prefer:

- one bug fix
- one feature slice
- one documentation improvement
- one test improvement

Avoid:

- mixing refactors with behavior changes
- formatting unrelated files
- changing backend, frontend, and QA repositories in one PR unless the issue requires it
- adding abstractions that are not needed for the current change

---

## ✅ Definition of Done

A contribution is ready for review when:

- the app builds
- `npm run lint` passes
- `npm run tsc -- --noEmit` passes
- `npm test` passes
- relevant docs are updated
- UI changes are shown with screenshots or a short recording
- API contract assumptions are explained if the change depends on backend behavior
- behavior is explained in the PR description

---

## 🧩 Code Expectations

- Follow the existing feature-based structure.
- Keep feature-specific code inside the owning `src/features/*` area.
- Put cross-feature UI, config, API clients, types, and utilities under `src/shared`.
- Prefer small, readable components over clever abstractions.
- Keep state ownership clear; avoid global state unless the behavior is truly cross-feature.
- Add or update tests when behavior changes.
- Keep public routes and API behavior backward-compatible unless the issue explicitly says otherwise.

Architecture reference:

- [Feature Packaging Rule](../docs/architecture/feature-packaging.md)

---

## 🐛 Bug Reports

Good bug reports include:

- what you did
- what you expected
- what actually happened
- browser, device, and viewport if UI-related
- logs, screenshots, request/response examples, or console errors if available
- your setup mode from [Getting Started](../docs/getting-started.md)

Before opening a bug:

- Search existing issues first
- Try the latest `development` branch if practical
- For small obvious fixes, opening a PR directly is fine

---

## 💡 Feature Requests

Start with a Discussion for new behavior, especially if it changes:

- routing
- authentication/session behavior
- cart, favorites, checkout, or orders
- frontend/backend API assumptions
- visual design patterns
- shared state management

For larger changes, wait for agreement before implementation. Many tickets have hidden constraints.

---

## 🔄 Pull Request Review

Reviewers will usually check:

- correctness
- UI behavior
- accessibility basics
- test coverage
- API compatibility
- state management impact
- whether the PR stays focused

Expect review comments. That is normal project work, not a rejection.

---

## 💬 Questions

If you are stuck:

- ask in the issue thread if your question is about a specific ticket
- start a [Discussion](https://github.com/Sunagatov/Iced-Latte-Frontend/discussions) for design or feature questions
- use the [Telegram community](https://t.me/zufarexplained) for general help

---

## 🍴 Forks

Forks are welcome. If you build something generally useful, consider sending it back via PR so the community benefits and your fork stays easier to sync.
