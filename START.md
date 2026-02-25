# Getting Started with Iced Latte Frontend

This guide walks you through running the Iced Latte frontend on your local machine.
There are two ways to run it — pick the one that fits you:

- **Option A — IDE + Docker (recommended for development):** Run the frontend from your IDE, with the backend + PostgreSQL in Docker. Best for writing and debugging frontend code.
- **Option B — Full Docker:** Run everything (frontend + backend + PostgreSQL) in Docker containers. Best for a quick smoke test without an IDE.

---

## Prerequisites

Make sure you have all of the following installed before you start:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20+ | https://nodejs.org/ |
| npm | 10+ | bundled with Node.js |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop/ |

To verify your installations:
```bash
node -v       # should print: v20...
npm -v        # should print: 10...
docker --version  # should print: Docker version...
```

---

## Option A — Run in IDE (recommended for development)

### Step 1 — Clone the repository

```bash
git clone https://github.com/Sunagatov/Iced-Latte-Frontend.git
cd Iced-Latte-Frontend
```

### Step 2 — Start the backend + PostgreSQL with Docker

The frontend needs the backend API and a database. Start them from the backend project:

```bash
# Clone the backend (if you haven't already)
git clone https://github.com/Sunagatov/Iced-Latte.git
cd Iced-Latte

# Start backend + PostgreSQL + Redis
docker-compose -f docker-compose.local.yml up -d iced-latte-postgresdb iced-latte-redis iced-latte-backend
```

To verify they are running:
```bash
docker ps
```
You should see `iced-latte-backend` on port `8083` and `iced-latte-postgresdb` on port `5432`.

### Step 3 — Set up environment

```bash
cp .env.example .env.local
```

Default `.env.local` points to `http://localhost:8083/api/v1` — no changes needed.

### Step 4 — Install dependencies

```bash
npm ci
```

### Step 5 — Start the dev server

```bash
npm run dev
```

🌐 App runs at `http://localhost:3000`

### Step 6 — Verify it works

Open `http://localhost:3000` in your browser. You should see the Iced Latte storefront with a list of coffee products.

**Test login:** `olivia@example.com` / `p@ss1logic11`

---

## Option B — Run everything in Docker

Use this if you just want to run the full stack without setting up a dev server.

### Step 1 — Clone the repository

```bash
git clone https://github.com/Sunagatov/Iced-Latte-Frontend.git
cd Iced-Latte-Frontend
```

### Step 2 — Set up environment

```bash
cp .env.example .env.local
```

### Step 3 — Start everything

```bash
docker-compose -f docker-compose.local.yml up -d --build
```

This starts all four containers:
- `iced-latte-frontend` — Next.js app on port `3000`
- `iced-latte-backend` — Spring Boot API on port `8083`
- `iced-latte-postgresdb` — PostgreSQL on port `5432`
- `iced-latte-redis` — Redis on port `6379`

🌐 App runs at `http://localhost:3000`

### Useful Docker commands

```bash
# View live logs
docker-compose -f docker-compose.local.yml logs iced-latte-frontend -f

# Stop containers (keeps data)
docker-compose -f docker-compose.local.yml down

# Stop and delete all data (fresh start)
docker-compose -f docker-compose.local.yml down -v

# Rebuild after code changes
docker-compose -f docker-compose.local.yml up -d --build
```

---

## Run Tests

```bash
# Unit & integration
npm run test

# E2E (requires dev server running on localhost:3000)
npm run test:e2e

# View E2E report
npm run test:e2e:report
```

---

## Lint & Types

```bash
npm run lint -- --fix
npm run tsc
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8083/api/v1` |
| `PROTOCOL` | `http` or `https` | `http` |
| `HOST` | Hostname | `localhost` |
| `PORT` | Dev server port | `3001` |

---

## Troubleshooting

**No products on the home page**
→ The backend is not running. Check `docker ps` and make sure `iced-latte-backend` is up on port `8083`.

**`NEXT_PUBLIC_API_URL` not set**
→ Make sure `.env.local` exists. Run `cp .env.example .env.local`.

**Port 3000 already in use**
→ Change `PORT` in `.env.local` or stop the process using port 3000.

**E2E tests fail**
→ Make sure the dev server is running on `http://localhost:3000` before running `npm run test:e2e`.

---

## Links

- 🌐 Live app: https://iced-latte.uk
- 📡 Backend API (Swagger): https://iced-latte.uk/backend/api/docs/swagger-ui/index.html
- 🔧 Backend repository: https://github.com/Sunagatov/Iced-Latte
