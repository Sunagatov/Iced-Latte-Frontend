# 🚀 Getting Started with Iced Latte Frontend

Pick the setup that fits you:

| Option | What runs where | Best for |
|--------|----------------|----------|
| **A** | Frontend locally, Backend + Infrastructure in Docker | Active frontend development (recommended) |
| **B** | Frontend + Backend + Infrastructure in Docker | Quick smoke test, no Node.js needed |
| **C** | Frontend + Backend locally, Infrastructure in Docker | Full-stack development on both repos |
| **D** | Frontend in Docker, Backend locally | Backend debugging in IntelliJ, frontend isolated |

---

## 📋 Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20+ | https://nodejs.org/ (Options A, C only) |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop/ |

Verify your setup:
```bash
node -v           # v20... or higher
docker --version  # Docker version...
```

---

## Before you start

### Clone both repositories as siblings

```bash
git clone https://github.com/Sunagatov/Iced-Latte.git
git clone https://github.com/Sunagatov/Iced-Latte-Frontend.git
```

✅ You should see two folders side by side: `Iced-Latte/` and `Iced-Latte-Frontend/`.

> The backend repository contains the unified `docker-compose.yml` that orchestrates all services — including the frontend container when needed.

### Configure the frontend environment

```bash
cd Iced-Latte-Frontend
cp .env.example .env.local
```

✅ The default `.env.local` points to `http://localhost:8083/api/v1` — no changes needed.

> ⚠️ `.env.example` disables all optional integrations (Stripe, Google OAuth, AI, email) so you can run locally without production credentials.

---

## Option A — Frontend locally, Backend + Infrastructure in Docker

> Best for: active frontend development with hot reload. The backend runs in Docker so you don't need Java installed.

### Step 1 — Start the backend + infrastructure

```bash
cd Iced-Latte
docker compose --env-file .env.example --profile backend up -d --build
```

This starts:
- `iced-latte-postgresdb` — PostgreSQL on port `5432`
- `iced-latte-redis` — Redis on port `6379`
- `iced-latte-minio` — S3-compatible object storage on port `9000` (console at http://localhost:9001)
- `iced-latte-backend` — Spring Boot API on port `8083`

Verify all containers are running:
```bash
docker ps
```

✅ You should see 4 containers with status `Up`.

### Step 2 — Install dependencies and start the dev server

```bash
cd ../Iced-Latte-Frontend
npm ci
npm run dev
```

✅ When you see `Local: http://localhost:3000`, the app is ready.

### Step 3 — Verify

- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:8083
- 📚 Swagger UI: http://localhost:8083/api/docs/swagger-ui/index.html

Log in with: `olivia@example.com` / `p@ss1logic11`

---

## Option B — Everything in Docker

> Best for: quick smoke test. No Node.js or Java needed — everything runs in Docker.

### Step 1 — Start everything

```bash
cd Iced-Latte
docker compose --env-file .env.example --profile backend --profile frontend up -d --build
```

> ⏳ The first build takes several minutes (Maven + npm + Next.js build). Subsequent builds are faster.

This builds and starts:
- `iced-latte-postgresdb`
- `iced-latte-redis`
- `iced-latte-minio`
- `iced-latte-backend`
- `iced-latte-frontend`

### Step 2 — Verify

- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:8083
- 📚 Swagger UI: http://localhost:8083/api/docs/swagger-ui/index.html
- 🪣 MinIO console: http://localhost:9001

---

## Option C — Frontend + Backend locally, Infrastructure in Docker

> Best for: full-stack development on both repos with hot reload on both sides.

### Step 1 — Start infrastructure

```bash
cd Iced-Latte
docker compose --env-file .env.example up -d postgres redis minio minio-init
```

### Step 2 — Run the backend locally

```bash
set -a && source .env.example && set +a && mvn spring-boot:run
```

> 🪟 **Windows:** use IntelliJ with `.env.example` loaded in the run configuration.

✅ When you see `Tomcat started on port 8083`, the backend is ready.

### Step 3 — Run the frontend locally

```bash
cd ../Iced-Latte-Frontend
npm ci
npm run dev
```

### Step 4 — Verify

- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:8083
- 📚 Swagger UI: http://localhost:8083/api/docs/swagger-ui/index.html

---

## Option D — Frontend in Docker, Backend locally

> Best for: debugging the backend in IntelliJ while the frontend runs in a container.

### Step 1 — Start infrastructure and run the backend locally

```bash
cd Iced-Latte
docker compose --env-file .env.example up -d postgres redis minio minio-init
set -a && source .env.example && set +a && mvn spring-boot:run
```

### Step 2 — Build the frontend container against the local backend

```bash
FRONTEND_DOCKER_API_URL=http://host.docker.internal:8083/api/v1 \
docker compose --env-file .env.example --profile frontend up -d --build
```

The frontend container uses `host.docker.internal` to reach the backend running on your machine.

### Step 3 — Verify

- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:8083
- 📚 Swagger UI: http://localhost:8083/api/docs/swagger-ui/index.html

---

## 🧪 Running the tests

### Unit tests

```bash
npm test
```

✅ All tests should pass with no failures.

### E2E tests (requires the app running on http://localhost:3000)

```bash
npm run test:e2e
```

### View E2E report

```bash
npm run test:e2e:report
```

---

## 🔍 Lint & type check

```bash
npm run lint
npm run tsc -- --noEmit
```

✅ No errors means your code is clean and type-safe.

---

## ⚙️ Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8083/api/v1` |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend URL (for OAuth redirects) | `http://localhost:3000` |
| `NEXT_IMAGE_REMOTE_SOURCES` | Allowed remote image hosts | `http://localhost:9000` |
| `NEXT_PUBLIC_STRIPE_ENABLED` | Enable Stripe checkout UI | `false` |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | Enable Google OAuth sign-in | `false` |
| `NEXT_PUBLIC_AI_ENABLED` | Enable AI review summaries | `false` |
| `NEXT_PUBLIC_EMAIL_CONFIRMATION_ENABLED` | Enable email confirmation flow | `false` |

> All `NEXT_PUBLIC_*_ENABLED` flags default to `false`. Enable them only when the corresponding backend service is configured.

---

## 🔧 Troubleshooting

**❌ No products on the home page**
→ The backend is not running. Check `docker ps` and make sure `iced-latte-backend` is up on port `8083`.

**❌ `NEXT_PUBLIC_API_URL` not set**
→ Make sure `.env.local` exists. Run `cp .env.example .env.local`.

**❌ Port 3000 already in use**
→ Stop the conflicting process or override: `FRONTEND_HOST_PORT=3001 docker compose --env-file .env.example --profile frontend up -d --build`.

**❌ Port 8083 already in use**
→ Stop the conflicting process or override: `BACKEND_HOST_PORT=8084 docker compose --env-file .env.example --profile backend up -d --build`.

**❌ Frontend container cannot reach local backend**
→ Rebuild with `FRONTEND_DOCKER_API_URL=http://host.docker.internal:8083/api/v1 docker compose --env-file .env.example --profile frontend up -d --build`.

**❌ E2E tests fail**
→ Make sure the dev server is running on `http://localhost:3000` before running `npm run test:e2e`.

**❌ `npm ci` fails**
→ Make sure you are using Node.js 20 or higher. Run `node -v` to check.

**❌ Login returns 401**
→ Use password `p@ss1logic11` and an email from the seed data (e.g. `olivia@example.com`).

---

## 🛠️ Useful Docker commands

```bash
# Live logs
docker compose --profile backend --profile frontend logs -f frontend
docker compose --profile backend --profile frontend logs -f backend

# Stop (keeps data)
docker compose --env-file .env.example --profile backend --profile frontend down

# Stop and wipe all data (fresh start)
docker compose --env-file .env.example --profile backend --profile frontend down -v

# Rebuild after code changes
docker compose --env-file .env.example --profile backend --profile frontend up -d --build
```

---

## 📞 Contact

- 💬 **Telegram community:** [Project community](https://t.me/zufarexplained)
- 👤 **Personal Telegram:** [@lucky_1uck](https://web.telegram.org/k/#@lucky_1uck)
- 📧 **Email:** [zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Sunagatov/Iced-Latte-Frontend/issues)
