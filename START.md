# Getting Started

## Requirements

- `npm 10.2.4`
- `node 20.11.0 LTS`

## Basic Steps

1. `npm ci` - install dependencies into the `node_modules/` directory using `package-lock.json`
2. `npx husky install` - setup precommit eslint typescript checks
3. `echo 'NEXT_PUBLIC_API_HOST_REMOTE=https://iced-latte.uk/backend/api/v1' > .env` - create `.env`
4. `npm run build` - build artifacts
5. `npm run dev` - run project on `localhost:3000` (if on the main page u do not see list of products due to CORS error, run dev server with `yarn next dev --hostname 127.0.0.1`)

## Run Tests

```bash
npm run test
```

## Fix Linter Issues

```bash
npm run lint -- --fix
```

## Misc

Backend API reference: https://iced-latte.uk/backend/api/docs/swagger-ui/index.html
