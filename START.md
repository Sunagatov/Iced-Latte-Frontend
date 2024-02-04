# Getting Started

## Requirements

- `npm 10.2.4`
- `node 20.11.0 LTS`

## Basic Steps

1. `npm ci` - install dependencies into the `node_modules/` directory using `package-lock.json`
2. `npx husky install` - setup precommit eslint typescript checks
3. `echo 'NEXT_PUBLIC_API_HOST_REMOTE=https://<be-server>/api/v1' > .env` - create `.env`
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

### Production Build

Similar to commands from `Dockerfile`, that is used for deployment:

```bash
rm -rf node_modules && npm ci --omit=dev
npm run build
npm run start
```

### Docker

Start the application container with the latest build:

```bash
docker-compose -f docker-compose.local.yml up -d --build
```

View logs:

```bash
docker-compose -f docker-compose.local.yml logs iced-latte-frontend -f
```

Stop running container:

```bash
docker-compose -f docker-compose.local.yml down
```

### Links

Backend API reference: https://iced-latte.uk/backend/api/docs/swagger-ui/index.html
