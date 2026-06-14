---
name: frontend-orval-api-client
description: Use when changing generated API clients, proxy request shapes, frontend API integration, or `orval.config.ts` behavior in Iced Latte Frontend.
---

# Frontend Orval API Client

Generated API clients are owned by this repo, but should not be hand-edited.

## Read Order

1. `AGENTS.md`
2. `docs/ai/README.md`
3. `orval.config.ts`
4. The smallest relevant files under:
   - `src/shared/api/generated`
   - `src/shared/api`
   - the consuming feature package

## Rules

- Do not hand-edit generated files under `src/shared/api/generated`.
- Regenerate through the existing Orval command instead of patching generated output manually.
- Preserve API request/response contracts unless the task explicitly includes a contract change.
- If a problem originates in the backend OpenAPI contract, route the contract change to the backend repo instead of “fixing” generated frontend code by hand.

## Verification

```bash
npm run api:check
```

Then run the narrowest consumer-side checks affected by the generated change.
