# AI Agent Routing

Use this file only after reading the root `AGENTS.md`.

## Common Routes

| Task | Start With |
|---|---|
| Local setup, env, Docker, backend connection | `docs/getting-started.md` |
| Feature placement, shared vs feature ownership | `docs/architecture/feature-packaging.md` |
| Sign-in, sign-up, cookies, refresh, OAuth | `docs/AUTH.md` |
| E2E behavior or Playwright coverage | `docs/testing/e2e-test-plan.md` |
| Generated API client changes | `orval.config.ts`, `src/shared/api/generated`, sibling backend OpenAPI source |
| Production deploy, server runtime, secrets, observability | Vault `AGENTS.md`, not this repo |

## Context Rule

Start from the smallest route, feature, component, hook, utility, or test that can
answer the task. Escalate to broader docs only when the local context is not
enough.
