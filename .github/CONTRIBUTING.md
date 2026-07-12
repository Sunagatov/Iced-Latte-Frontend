# Contributing to Iced Latte Frontend

Iced Latte Frontend is built in the open so engineers can practice on a real
Next.js and React codebase with product flows, API integration, state
management, UI work, tests, and pull requests.

## License & Contribution Terms

Iced Latte Frontend is licensed under the Iced Latte Personal Evaluation License
2026. See [LICENSE](../LICENSE) for details.

This is not an open source license. Personal local evaluation is allowed.
Public, educational, remote-hosted, commercial, redistributed, sublicensed, or
derivative use requires prior written permission signed by the author and legally
verified as required by the author.

By opening a PR, issue patch, code suggestion, documentation change, design,
test, or other contribution, you assign the contribution rights to the author.
Contributors do not receive ownership, copyright, trademark, commercial,
publication, hosting, sublicensing, or redistribution rights.

The Iced Latte name, logo, domain, visual identity, and other brand assets are
project brand assets. No permission is granted to use those assets without the
author's signed written permission.

## Ground Rules

- Keep changes focused on one concern.
- Preserve the existing Next.js, React, TypeScript, and feature-package
  architecture.
- Keep route files in `src/app` thin and compose feature-owned components there.
- Put feature-specific code under the owning `src/features/<feature>` package.
- Use `src/shared` only for genuinely shared UI, API, auth, config, types, or
  utilities.
- Do not hand-edit generated API clients under `src/shared/api/generated`.
- Do not include unrelated refactors, formatting churn, or generated noise.

## Local Setup

Use the full [Getting Started Guide](../docs/getting-started.md) for local
frontend setup, backend connection, Docker modes, environment variables, tests,
and troubleshooting.

Typical local setup:

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

## Before Opening a PR

Run the frontend checks:

```bash
npm run lint
npm run tsc -- --noEmit
npm test
```

If your change touches user flows, routing, authentication, cart, favorites,
session behavior, checkout, orders, or shared API handling, consider E2E
coverage:

```bash
npm run test:e2e
```

Before opening the pull request:

- Link any related issue in the PR description.
- Explain what changed and how you tested it.
- Add screenshots or short screen recordings for UI changes.
- Keep backend, frontend, and operational changes in separate pull requests
  unless the maintainers ask otherwise.

## Branches and PR Titles

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

## Issues

For bugs, include:

- What you expected.
- What actually happened.
- Browser, device, and viewport if UI-related.
- Logs, screenshots, request and response examples, or console errors if
  available.
- Your setup mode from the
  [Getting Started Guide](../docs/getting-started.md).

Before opening a bug, search existing issues first and try the latest
`development` branch if practical. For small obvious fixes, opening a pull
request directly is fine.

For larger feature requests, start with a discussion, especially if the change
affects routing, authentication, session behavior, cart, favorites, checkout,
orders, frontend/backend API assumptions, visual design patterns, or shared
state management.

## Review

Reviewers will check correctness, UI behavior, accessibility basics, test
coverage, API compatibility, state management impact, and whether the pull
request stays focused.

Expect review comments. They are normal project work, not a rejection.
