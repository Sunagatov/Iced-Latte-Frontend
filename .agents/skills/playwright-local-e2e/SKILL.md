---
name: playwright-local-e2e
description: Use when working on Playwright coverage, local end-to-end flows, smoke tests, guest or contributor user journeys, or when a frontend change needs browser-level verification in Iced Latte Frontend.
---

# Playwright Local E2E

Use this skill for browser-level verification in this repo.

## Start Here

1. Read `AGENTS.md`.
2. Read `docs/testing/e2e-test-plan.md` for intended coverage.
3. Read only the relevant spec or page object under `e2e/`.

## Repo Facts

- Default local frontend URL: `http://localhost:3000`
- Main local command: `npm run test:e2e:local`
- Smoke command: `npm run test:e2e:local-smoke`
- Report command: `npm run test:e2e:report`

## Working Rules

- Prefer the smallest relevant Playwright spec before running the full suite.
- Keep route and feature ownership aligned with `src/app` and `src/features`.
- For auth-sensitive flows, verify behavior against `docs/AUTH.md`.
- When a change affects a documented user flow, update the matching E2E coverage plan entry if needed.

## Verification Order

1. Run the narrowest relevant Playwright spec.
2. Run `npm run test:e2e:local-smoke` when a broad smoke check is enough.
3. Run `npm run test:e2e:local` only when the change affects wider user flows.
