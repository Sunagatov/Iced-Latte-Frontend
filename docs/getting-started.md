# 🚀 Getting Started with Iced Latte Frontend

This guide is for people who want to run the Iced Latte frontend locally without guessing what to install, which repository to open, or which command to copy.

Iced Latte has three moving parts:

| Part | What it is | Default URL |
|---|---|---|
| 🎨 Frontend | This repository. Next.js app, UI flows, frontend state, API integration, tests | http://localhost:3000 |
| 🔧 Backend | Separate Spring Boot repository: [`Iced-Latte`](https://github.com/Sunagatov/Iced-Latte) | http://localhost:8083 |
| 🧱 Infrastructure | PostgreSQL, Redis, MinIO, started by Docker Compose from the backend repo | local Docker containers |

> The backend repository owns the shared `docker-compose.yml` used by both projects.

---

## 🧭 Pick Your Setup

If you are unsure, choose **Option A**.

| Option | What you run | Best for |
|---|---|---|
| **A** | Frontend locally, backend + infrastructure in Docker | Active frontend development, recommended |
| **B** | Everything in Docker | Fast smoke test, no Node.js needed |
| **C** | Frontend + backend locally, infrastructure in Docker | Full-stack development |
| **D** | Frontend in Docker, backend locally | Backend debugging in IntelliJ |

---

## ✅ Install First

| Tool | Required for | Version |
|---|---|---|
| Docker Desktop | Every option | latest |
| Node.js | Frontend locally: Options A and C | 20+ |
| Java JDK | Backend locally: Options C and D | 25 |
| Maven | Backend locally: Options C and D | 3.9+ |
| IntelliJ IDEA | Optional, useful for backend debugging | any edition |

Check your machine:

```bash
docker --version
node -v
java -version
mvn -version
```

> 🪟 Windows note: backend terminal commands that use `set -a && source .env.example` are for macOS, Linux, and Git Bash. On Windows PowerShell / CMD, use IntelliJ and load `.env.example` into the backend run configuration.

---

## 📥 Clone Repositories

Clone both repositories as siblings:

```bash
git clone https://github.com/Sunagatov/Iced-Latte.git
git clone https://github.com/Sunagatov/Iced-Latte-Frontend.git
```

You should end up with:

```text
IdeaProjects/
├── Iced-Latte/
└── Iced-Latte-Frontend/
```

---

## 🔐 Local Environment

Create the frontend local env file:

```bash
cd Iced-Latte-Frontend
cp .env.example .env.local
```

The default `.env.local` points to:

```text
http://localhost:8083/api/v1
```

That is the local backend API URL.

Optional integrations are disabled by default:

- Stripe checkout UI
- Google OAuth sign-in
- AI review summaries
- email confirmation flow

Enable them only when the backend service and credentials are configured.

---

## 🟢 Option A — Frontend Locally, Backend + Infrastructure in Docker

Use this when you are working on frontend code. This is the recommended mode for most frontend contributors.

### Step 1 — Start Backend + Infrastructure

```bash
cd Iced-Latte
docker compose --env-file .env.example --profile backend up -d --build
```

This starts PostgreSQL, Redis, MinIO, and the backend.

Check containers:

```bash
docker ps
```

You should see the backend and infrastructure containers with status `Up`.

### Step 2 — Start Frontend Locally

```bash
cd ../Iced-Latte-Frontend
cp .env.example .env.local
npm ci
npm run dev
```

Frontend is ready when you see:

```text
Local: http://localhost:3000
```

---

## 🐳 Option B — Everything in Docker

Use this when you just want to smoke-test the full app and do not want to install Node.js locally.

```bash
cd Iced-Latte
docker compose --env-file .env.example --profile backend --profile frontend up -d --build
```

This starts:

- PostgreSQL
- Redis
- MinIO
- Backend
- Frontend

First build can take several minutes because Docker builds both the Java backend and Next.js frontend image.

---

## 🧑‍💻 Option C — Frontend + Backend Locally, Infrastructure in Docker

Use this when you are changing both frontend and backend code.

### Step 1 — Start Infrastructure

```bash
cd Iced-Latte
docker compose --env-file .env.example up -d postgres redis minio minio-init
```

### Step 2 — Start Backend Locally

Recommended for beginners: use IntelliJ.

1. Open `Iced-Latte` in IntelliJ
2. Open Run / Debug Configurations
3. Select or create `IcedLatteApplication`
4. Load environment variables from `.env.example`
5. Click the green run button

Terminal alternative for macOS / Linux / Git Bash:

```bash
set -a && source .env.example && set +a && mvn spring-boot:run
```

Backend is ready when you see:

```text
Tomcat started on port 8083
```

### Step 3 — Start Frontend Locally

```bash
cd ../Iced-Latte-Frontend
cp .env.example .env.local
npm ci
npm run dev
```

---

## 🔧 Option D — Frontend in Docker, Backend Locally

Use this when the backend is running on your machine and you want the frontend isolated in Docker.

### Step 1 — Start Infrastructure

```bash
cd Iced-Latte
docker compose --env-file .env.example up -d postgres redis minio minio-init
```

### Step 2 — Start Backend Locally

Use IntelliJ with `.env.example`, or on macOS / Linux / Git Bash:

```bash
set -a && source .env.example && set +a && mvn spring-boot:run
```

### Step 3 — Start Frontend Container

```bash
FRONTEND_DOCKER_API_URL=http://host.docker.internal:8083/api/v1 \
docker compose --env-file .env.example --profile frontend up -d --build
```

The frontend container uses `host.docker.internal` to reach the backend running on your machine.

---

## ✅ Verify Everything

Use this checklist after starting any option:

| Check | Expected result |
|---|---|
| `docker ps` | Required containers show status `Up` |
| http://localhost:3000 | Frontend opens |
| http://localhost:8083 | Backend responds |
| http://localhost:8083/api/docs/swagger-ui/index.html | Swagger UI opens |
| http://localhost:9001 | MinIO console opens if infrastructure is running |

Seed login:

```text
olivia@example.com / p@ss1logic11
```

---

## 🧪 Running Checks

Unit tests:

```bash
npm test
```

Lint and type-check:

```bash
npm run lint
npm run tsc -- --noEmit
```

E2E tests require the frontend running on `http://localhost:3000`:

```bash
npm run test:e2e
```

View E2E report:

```bash
npm run test:e2e:report
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8083/api/v1` |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend URL for redirects | `http://localhost:3000` |
| `NEXT_IMAGE_REMOTE_SOURCES` | Allowed remote image hosts | `http://localhost:9000` |
| `NEXT_PUBLIC_STRIPE_ENABLED` | Enable Stripe checkout UI | `false` |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | Enable Google OAuth sign-in | `false` |
| `NEXT_PUBLIC_AI_ENABLED` | Enable AI review summaries | `false` |
| `NEXT_PUBLIC_EMAIL_CONFIRMATION_ENABLED` | Enable email confirmation flow | `false` |

All feature flags default to `false` so the app can run locally without production credentials.

---

## 🛠️ Useful Docker Commands

Run these from the backend repository: `Iced-Latte/`.

```bash
# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Stop app containers but keep database/files
docker compose --profile backend --profile frontend down

# Stop everything and delete local Docker volumes
docker compose --profile backend --profile frontend down -v

# Rebuild after Docker-related changes
docker compose --env-file .env.example --profile backend --profile frontend up -d --build
```

> ⚠️ `down -v` deletes local database and MinIO data.

---

## 🔧 Troubleshooting

| Problem | What to do |
|---|---|
| No products on the home page | Backend is not running. Check `docker ps` and make sure backend is up on port `8083` |
| `NEXT_PUBLIC_API_URL` is missing | Run `cp .env.example .env.local` in `Iced-Latte-Frontend/` |
| Frontend port `3000` already in use | Stop the process using the port, or run Docker with `FRONTEND_HOST_PORT=3001` |
| Backend port `8083` already in use | Stop the process using the port, or run Docker with `BACKEND_HOST_PORT=8084` |
| Frontend container cannot reach local backend | Rebuild frontend with `FRONTEND_DOCKER_API_URL=http://host.docker.internal:8083/api/v1` |
| E2E tests fail immediately | Make sure the dev server is running on `http://localhost:3000` |
| `npm ci` fails | Make sure Node.js is version 20 or higher |
| Login returns `401` | Use seed login `olivia@example.com / p@ss1logic11` |
| Windows says `export` or `source` not found | Use IntelliJ for backend startup, or run the backend command in Git Bash |

Port override examples:

```bash
BACKEND_HOST_PORT=8084 docker compose --env-file .env.example --profile backend up -d --build
FRONTEND_HOST_PORT=3001 docker compose --env-file .env.example --profile frontend up -d --build
```

---

## 📞 Contact

- 💬 **Telegram community:** [Project community](https://t.me/zufarexplained)
- 👤 **Personal Telegram:** [@lucky_1uck](https://web.telegram.org/k/#@lucky_1uck)
- 📧 **Email:** [zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Sunagatov/Iced-Latte-Frontend/issues)
