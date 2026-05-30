# Agent Entry Point

This file is the canonical entry point for AI agents working in this repository.
It is for Claude, Codex, Amazon Q, Kiro, Copilot, ChatGPT, and similar tools.

## Mission

Act as a targeted frontend engineering assistant. Preserve the existing Next.js,
React, TypeScript, feature-package architecture, API contracts, and test style.
Do not turn a focused change into a broad cleanup.

## Source Of Truth Boundary

- This repository owns frontend source, UI behavior, frontend tests, local
  frontend docs, generated API client code, and Next.js route handlers.
- The sibling `Iced-Latte` repository owns backend APIs, OpenAPI contracts,
  backend local Docker Compose, database migrations, and backend tests.
- `Vault` owns production runtime, deployment, secrets, observability, backups,
  infrastructure, and server state when available.
- Do not copy Vault secret, deployment, server, or production-runtime procedures
  into this repository. If the task is about production runtime, switch to Vault
  and read its `AGENTS.md`.

## Vault Context

The sibling `Vault` checkout is the private operations and knowledge-base repo
shared across these pet projects. Use it only when a task needs
production/runtime facts: deployment flow, Docker Compose on the host, systemd or
host setup, SOPS-managed secrets, backups/restores, observability, reverse proxy,
infra inventory, or cross-project operational decisions. Start with Vault's
`AGENTS.md` and follow its routing docs instead of asking where production,
secrets, monitoring, or server-state information lives.

## Minimal Read Order

Read only what is needed for the task:

1. `AGENTS.md`
2. `README.md`
3. `docs/getting-started.md` for local setup questions
4. `docs/architecture/feature-packaging.md` for placement and boundaries
5. `docs/AUTH.md` for auth, cookies, sessions, OAuth, or token behavior
6. `docs/testing/e2e-test-plan.md` for Playwright coverage
7. `docs/ai/README.md` for agent-specific routing notes
8. The smallest relevant source, test, route, or generated API files

Avoid scanning the whole repository unless the task truly requires it.

## Durable Facts

- Stack: Next.js 16, React 19, TypeScript 5, Node.js 20+.
- Styling: TailwindCSS 4, React Icons, responsive layouts.
- Routing: Next App Router under `src/app`.
- API integration: Axios, Axios Cache Interceptor, SWR, Orval-generated clients.
- State: Zustand plus feature-owned hooks and session orchestration.
- Forms: React Hook Form and Yup.
- Tests: Jest 30, React Testing Library, Playwright, ESLint 9, Prettier.
- Main local URL: `http://localhost:3000`.
- Default local backend API URL: `http://localhost:8083/api/v1`.

## Architecture Rules

- Keep route files in `src/app` thin; compose feature components there.
- Put one-feature code under the owning `src/features/<feature>` package.
- Use `src/shared` only for genuinely shared, stable, cross-feature utilities,
  UI primitives, API infrastructure, auth helpers, config, or types.
- Do not move feature-specific components, hooks, validation, state, or constants
  into `shared` just because they look reusable.
- Generated API clients live under `src/shared/api/generated`; regenerate them
  through the existing Orval command instead of hand-editing generated files.
- Keep auth token handling aligned with `docs/AUTH.md`: raw access and refresh
  tokens must not be stored in JavaScript-readable client state.
- Preserve public routes, callback behavior, cookie/session behavior, and API
  request shapes unless the task explicitly changes those contracts.

## Hotspots

- App routes and shell: `src/app`
- Feature packages: `src/features`
- API client and generated clients: `src/shared/api`
- Auth/session helpers: `src/features/auth`, `src/features/session`,
  `src/shared/auth`, `src/app/providers/AuthInterceptor.tsx`
- Shared UI primitives: `src/shared/ui`
- Runtime/config constants: `src/shared/config`
- E2E tests and page objects: `e2e`
- Orval config: `orval.config.ts`

## Verification

For documentation-only changes, run at least `git diff --check`.

For frontend source changes, prefer the narrowest useful checks first:

```bash
npm run lint
npm run tsc -- --noEmit
npm test
```

For generated API changes:

```bash
npm run api:check
```

For user-flow changes, run the relevant Playwright test or:

```bash
npm run test:e2e:local
```
