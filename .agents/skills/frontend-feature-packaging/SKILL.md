---
name: frontend-feature-packaging
description: Use when deciding where frontend code should live in Iced Latte Frontend, especially `src/app` vs `src/features` vs `src/shared`, feature ownership, cross-feature dependencies, or whether code should be promoted into shared.
---

# Frontend Feature Packaging

This repo is feature-first. Placement mistakes create long-term clutter.

## Read Order

1. `AGENTS.md`
2. `docs/architecture/feature-packaging.md`
3. The smallest relevant route, feature package, or shared module

## Core Rules

- Keep route files in `src/app` thin.
- If code belongs to one user-facing feature, keep it in that feature package.
- Do not move feature-specific code into `src/shared` just because it looks reusable.
- Promote code to `shared` only when it is genuinely cross-feature, stable, and has no natural owner.

## Smell Checks

- Is `src/app` gaining business or UI logic that should live in a feature?
- Is a feature reaching into another feature's internals?
- Is `shared` becoming a dumping ground for one-off helpers or feature state?

## Verification

- Update the tests owned by the feature or user flow you touched.
- If the packaging change affects a user journey, run the narrowest relevant frontend test or Playwright spec.
