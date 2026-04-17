# 🚀 Getting Started with Iced Latte Frontend

Pick the setup that fits you:

| Option | What runs where                                                                                             | Best for                        |
| ------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **A**  | Frontend in IDE + Backend & Infrastructure (PostgreSQL database, Redis cache, MinIO file storage) in Docker | Active development, debugging   |
| **B**  | Frontend + Backend + Infrastructure (PostgreSQL database, Redis cache, MinIO file storage) in Docker        | Quick smoke test, no IDE needed |

---

## 📋 Prerequisites

| Tool           | Version | Download                                        |
| -------------- | ------- | ----------------------------------------------- |
| Node.js        | 20+     | https://nodejs.org/ (Option A only)             |
| Docker Desktop | latest  | https://www.docker.com/products/docker-desktop/ |

Verify your setup:

```bash
node -v           # v20... or higher
docker --version  # Docker version...
```

---

## Option A — Frontend in IDE, Backend + Infrastructure in Docker

> Best for: active frontend development. You run the frontend locally with hot reload, and the backend + database run in Docker.

### Step 1 — Clone both repositories

```bash
git clone https://github.com/Sunagatov/Iced-Latte-Frontend.git
git clone https://github.com/Sunagatov/Iced-Latte.git
```

✅ You should see two new folders: `Iced-Latte-Frontend/` and `Iced-Latte/`.

### Step 2 — Start the backend + infrastructure

```bash
cd Iced-Latte
docker compose --profile backend up -d --build
```

This starts:

- `iced-latte-postgresdb` — PostgreSQL database on port `5432`
- `iced-latte-redis` — Redis cache on port `6379`
- `iced-latte-minio` — MinIO file storage on port `9000`
- `iced-latte-backend` — Spring Boot API on port `8083`

Verify all containers are running:

```bash
docker ps
```

✅ You should see 4 containers with status `Up`: `iced-latte-postgresdb`, `iced-latte-redis`, `iced-latte-minio`, `iced-latte-backend`.

### Step 3 — Configure environment

```bash
cd ../Iced-Latte-Frontend
cp .env.example .env.local
```

✅ The default `.env.local` points to `http://localhost:8083/api/v1` — no changes needed for local development.

### Step 4 — Install dependencies

```bash
npm ci
```

✅ You should see packages installed with no errors. This may take a minute on first run.

### Step 5 — Start the dev server

```bash
npm run dev
```

✅ When you see `Local: http://localhost:3000` in the terminal, the app is ready.

### Step 6 — Verify the app is running

Open http://localhost:3000 in your browser.

✅ You should see the Iced Latte shop with a list of coffee products.

### Step 7 — Log in with a test user

Use the login form at http://localhost:3000/signin:

- Email: `olivia@example.com`
- Password: `p@ss1logic11`

✅ You should be redirected to the home page as a logged-in user.

> All 15 seed users share the password `p@ss1logic11`.

---

## Option B — Everything in Docker (no IDE needed)

> Best for: quick smoke test. Everything — frontend, backend, and infrastructure — runs in Docker. No Node.js installation needed.
>
> This is driven from the **backend** repository, which has the unified `docker-compose.yml`. Follow **Option C** in the [backend START.md](https://github.com/Sunagatov/Iced-Latte/blob/development/START.md):

```bash
git clone https://github.com/Sunagatov/Iced-Latte.git
git clone https://github.com/Sunagatov/Iced-Latte-Frontend.git
cd Iced-Latte
docker compose --profile backend --profile frontend up -d --build
```

✅ When the build finishes, all 5 containers should be running (`docker ps`).

- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:8083
- 🪣 MinIO console: http://localhost:9001 — login `minioadmin` / `minioadmin`

### 🛠️ Useful Docker commands

```bash
# Live logs
docker compose --profile backend --profile frontend logs -f frontend
docker compose --profile backend --profile frontend logs -f backend

# Stop (keeps data)
docker compose --profile backend --profile frontend down

# Stop and wipe all data (fresh start)
docker compose --profile backend --profile frontend down -v

# Rebuild after code changes
docker compose --profile backend --profile frontend up -d --build
```

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

✅ Playwright will open a browser and run through user flows automatically.

### View E2E report

```bash
npm run test:e2e:report
```

✅ A browser window opens with a detailed test report.

---

## 🔍 Lint & type check

```bash
npm run lint
npm run tsc
```

✅ No errors means your code is clean and type-safe.

---

## ⚙️ Environment variables

| Variable              | Description          | Default                        |
| --------------------- | -------------------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8083/api/v1` |
| `PROTOCOL`            | `http` or `https`    | `http`                         |
| `HOST`                | Hostname             | `localhost`                    |
| `PORT`                | Dev server port      | `3000`                         |

---

## 🔧 Troubleshooting

**❌ No products on the home page**
→ The backend is not running. Check `docker ps` and make sure `iced-latte-backend` is up on port `8083`.

**❌ `NEXT_PUBLIC_API_URL` not set**
→ Make sure `.env.local` exists. Run `cp .env.example .env.local`.

**❌ Port 3000 already in use**
→ Change `PORT` in `.env.local` or stop the process using port 3000.

**❌ E2E tests fail**
→ Make sure the dev server is running on `http://localhost:3000` before running `npm run test:e2e`.

**❌ `npm ci` fails**
→ Make sure you are using Node.js 20 or higher. Run `node -v` to check.

---

## 📁 Project structure

```
src/
├── app/                # Next.js App Router pages
│   ├── api/            # API proxy route (avoids CORS)
│   ├── cart/           # Cart page
│   ├── checkout/       # Checkout page
│   ├── favourites/     # Favourites page
│   ├── orders/         # Orders page
│   ├── product/        # Product detail page
│   ├── profile/        # User profile page
│   ├── signin/signup/  # Auth pages
│   └── layout.tsx      # Root layout
├── features/           # Feature-based modules
│   ├── addresses/      # Delivery addresses
│   ├── auth/           # Auth (login, register)
│   ├── cart/           # Shopping cart
│   ├── favorites/      # Favourites
│   ├── products/       # Product catalog
│   ├── reviews/        # Product reviews
│   └── user/           # User profile
└── shared/             # Cross-feature shared code
    ├── api/            # Axios client
    ├── components/     # Shared UI components
    ├── providers/      # App-level providers
    ├── types/          # Shared TypeScript types
    └── utils/          # Utility functions
```

API docs:

- 🖥️ Local: http://localhost:8083/api/docs/swagger-ui/index.html
- 🌐 Production: https://iced-latte.uk/backend/api/docs/swagger-ui/index.html

---

## 📞 Contact

- 💬 **Telegram community:** [Zufar Explained IT](https://t.me/zufarexplained)
- 👤 **Personal Telegram:** [@lucky_1uck](https://web.telegram.org/k/#@lucky_1uck)
- 📧 **Email:** [zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Sunagatov/Iced-Latte-Frontend/issues)
