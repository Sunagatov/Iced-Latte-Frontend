---
name: frontend-shared-ui-boundaries
description: Use when deciding whether frontend UI belongs in `src/shared/ui` or inside a feature package, especially for reusable-looking components, UI primitives, or components that risk polluting shared ownership.
---

# Frontend Shared UI Boundaries

`src/shared/ui` is for genuine primitives, not feature leakage.

## Read Order

1. `AGENTS.md`
2. `docs/architecture/feature-packaging.md`
3. The smallest relevant feature component and any `src/shared/ui` candidate

## Core Rules

- Keep feature-owned UI inside the owning feature package by default.
- Use `src/shared/ui` only for stable, cross-feature UI primitives with no natural feature owner.
- Do not move a component to shared just because it appears twice.
- If a component carries feature-specific state, validation, wording, or API coupling, it likely belongs to the feature.

## Smell Checks

- Would this component move with one feature?
- Does it depend on one feature’s types, hooks, or state?
- Is the “reuse” only within one feature slice?

## Verification

- Update the tests owned by the feature or primitive you touched.
