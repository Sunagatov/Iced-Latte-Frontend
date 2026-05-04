# Iced Latte Frontend

**A modern React/Next.js coffee marketplace frontend — built in the open, for engineers who want real experience.**

[🌐 Live Demo](https://iced-latte.uk/) ·
[🟢 Good First Issues](https://github.com/Sunagatov/Iced-Latte-Frontend/issues?q=is%3Aopen+label%3A%22good+first+issue%22) ·
[💬 Community](https://t.me/zufarexplained)

[![CI Status](https://github.com/Sunagatov/Iced-Latte-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Sunagatov/Iced-Latte-Frontend/actions)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/license-CC%20BY--NC%204.0-lightgrey.svg)](https://github.com/Sunagatov/Iced-Latte-Frontend/blob/main/LICENSE)

[![GitHub Stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte-Frontend)](https://github.com/Sunagatov/Iced-Latte-Frontend/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Sunagatov/Iced-Latte-Frontend?style=social)](https://github.com/Sunagatov/Iced-Latte-Frontend/network/members)
[![Contributors](https://img.shields.io/github/contributors/Sunagatov/Iced-Latte-Frontend)](https://github.com/Sunagatov/Iced-Latte-Frontend/graphs/contributors)
[![Docker Pulls](https://img.shields.io/docker/pulls/zufarexplainedit/iced-latte-frontend.svg)](https://hub.docker.com/r/zufarexplainedit/iced-latte-frontend/)

---

## 📊 Key stats across all three repositories

| Repository                                                      | ⭐ Stars                                                                               | 🍴 Forks                                                                               |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [🔧 Backend](https://github.com/Sunagatov/Iced-Latte)           | ![Stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte?style=flat)          | ![Forks](https://img.shields.io/github/forks/Sunagatov/Iced-Latte?style=flat)          |
| [🎨 Frontend](https://github.com/Sunagatov/Iced-Latte-Frontend) | ![Stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte-Frontend?style=flat) | ![Forks](https://img.shields.io/github/forks/Sunagatov/Iced-Latte-Frontend?style=flat) |
| [🧪 QA](https://github.com/Sunagatov/Iced-Latte-QA)             | ![Stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte-QA?style=flat)       | ![Forks](https://img.shields.io/github/forks/Sunagatov/Iced-Latte-QA?style=flat)       |

> ⭐ If this project helps you learn or inspires you, please give it a star — it means a lot to the community!

---

## 🚀 Quick Start

**📋 Prerequisites:** Node.js 20+ and npm, Docker Desktop for backend-backed local runs

```bash
# 1. 📥 Clone
git clone https://github.com/Sunagatov/Iced-Latte-Frontend.git && cd Iced-Latte-Frontend

# 2. 📝 Copy the example env file
cp .env.example .env.local

# 3. 📦 Install dependencies
npm ci

# 4. ▶️ Run
npm run dev
```

🌐 App runs at `http://localhost:3000`

> ⚠️ The backend must be running for products and login to work. See [Getting Started](docs/getting-started.md) Option A to start it with one Docker command.

> 💡 See [Getting Started](docs/getting-started.md) for Docker setup, E2E tests, and troubleshooting.

**🧪 Run the tests:**

```bash
npm test
```

**🔍 Lint and type-check:**

```bash
npm run lint
npm run tsc -- --noEmit
```

---

## 📸 Preview

![Iced Latte Frontend](public/assets/images/iced-latte-avatar.jpg)

_Live application interface: [iced-latte.uk](https://iced-latte.uk/)_

---

## 🤔 What is this?

Iced Latte is a non-profit sandbox project started in 2022 as a private pet project, then opened to the community to give junior engineers, students, and mentees practical experience in a real tech project with processes similar to those in actual tech teams. The first participants were students, Telegram channel subscribers, and mentees from ADPList and Women In Tech. The project has since grown and earned recognition from both the open-source community and the wider tech community.

> ⭐ If this project helps you learn or inspires you, please give it a star — it means a lot to the community!

---

## 🏆 Recognition

Iced Latte has earned recognition from the broader tech community.

### 🔥 GitHub Trending — May 22, 2024

- The backend repository reached GitHub's Trending page — listed among resources _"the GitHub community is most excited about today"_ — gaining **85 stars in a single day** with 27 active contributors. ([link to the archive](https://archive.ph/DRsD8))

### 🥉 KaiCode 2024 Finalist

- Iced Latte made it to the finals of [KaiCode](https://www.kaicode.org/2024.html#jury) — an annual open-source festival launched by Huawei, which positions itself as an incubator of open-source technologies and rewards the most promising projects. Iced Latte was selected among **412 applications** and placed in the third group of 26 finalist repositories considered for the prize. Jury members are not allowed to assess their own projects, so the selection was fully independent.

### 🛠️ JetBrains Open Source License

- Iced Latte was recognized by [JetBrains](https://www.jetbrains.com/community/opensource/) — a leading software company specializing in intelligent development tools. As an active participant in the open-source community, JetBrains supports recognized global open-source projects by providing complimentary licenses for non-commercial development. JetBrains granted Iced Latte **8 free All Products Pack licenses** (February 2024, License Reference No. D379769990).

### 👨‍💻 Recommended by Eddie Jaoude

- Iced Latte was [recommended by Eddie Jaoude](https://www.linkedin.com/feed/update/urn:li:activity:7195685359710617602/) — one of the most influential open-source experts, a [GitHub Star](https://stars.github.com/) with 174K followers on X and 17.6K on LinkedIn — who called it a great example of a Java open-source project. Many Iced Latte contributors shared their positive experience in the comments.

---

## 🛠️ Tech Stack

| 📂 Category      | 🔧 Technology                           |
| ---------------- | --------------------------------------- |
| 💻 Core          | Next.js 16 + TypeScript 5 + React 19    |
| 🗃️ State Manager | Zustand                                 |
| 🎨 CSS Framework | TailwindCSS 4                           |
| 📡 Data Fetching | Axios + SWR                             |
| 📝 Forms         | React Hook Form + Yup                   |
| 🧪 Testing       | Jest, React Testing Library, Playwright |
| 🚢 Deployment    | Docker, GitHub Actions, Vercel          |

---

## 📁 Project Structure

```text
src/
├── app/                   # Next App Router entries, route handlers, shell layout, providers
│   ├── api/               # Next route handlers and proxy endpoints
│   ├── layout/            # Header, footer, and app-shell UI
│   └── providers/         # App bootstrap and global runtime wiring
├── features/              # Product/domain slices
│   ├── addresses/         # Delivery address management
│   ├── auth/              # Sign-in, sign-up, password reset, auth guards
│   ├── cart/              # Shopping cart flows and state
│   ├── checkout/          # Checkout flow
│   ├── favorites/         # Favourites
│   ├── home/              # Home page route and hero section
│   ├── orders/            # Orders and order success
│   ├── products/          # Catalog and product details
│   ├── reviews/           # Reviews and ratings
│   ├── session/           # Session orchestration across auth/cart/favourites
│   └── user/              # Profile and user account flows
├── shared/                # Cross-feature building blocks
│   ├── api/               # Axios client
│   ├── auth/              # Cookies, token helpers, session tracing
│   ├── types/             # Shared TypeScript types
│   ├── ui/                # Reusable UI primitives
│   └── utils/             # Non-auth generic utilities
└── types/                 # Global declaration files
```

### Structure rules

- Keep `app/` thin. It should own Next routing, shell layout, and provider wiring, not feature business logic.
- Keep route implementations under the owning feature whenever the route has meaningful UI or orchestration logic.
- Use `shared/ui` only for domain-agnostic primitives. Header, footer, hero sections, and auth guards are not generic UI.
- Keep single-file components flat: `components/ProductCard.tsx`, not `components/ProductCard/ProductCard.tsx`.
- Create a component directory only when the component owns colocated tests, helpers, or subcomponents that justify the extra nesting.
- Keep auth cookies, token helpers, and request tracing under `shared/auth`.
- Do not let `shared/` import from `app/` or from feature modules.

---

## 🚢 Deployment

🚫 No Kubernetes, no cloud-managed services. This repo builds and publishes a Docker image; the broader runtime wiring lives in the backend/Vault deployment setup.

The full production setup is in the [backend docker-compose.yml](https://github.com/Sunagatov/Iced-Latte/blob/development/docker-compose.yml). On every push to `master`, [GitHub Actions](.github/workflows/cd.yml) builds and pushes the frontend Docker image. CI runs on every push to `development` and on pull requests targeting `development`.

🔍 Explore the [GitHub workflows](./.github/workflows) folder for the full CI/CD pipeline.

---

## 🤝 Contributing

🎉 Contributions are welcome. Here's how to get involved:

| 🎯 Situation      | 🚀 Action                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🐛 Found a bug    | [Open an issue](https://github.com/Sunagatov/Iced-Latte-Frontend/issues/new) with the `bug` label                                                    |
| 💡 Want a feature | Start a [Discussion](https://github.com/Sunagatov/Iced-Latte-Frontend/discussions) first                                                             |
| 👨‍💻 Ready to code  | Pick a [`good first issue`](https://github.com/Sunagatov/Iced-Latte-Frontend/issues?q=is%3Aopen+label%3A%22good+first+issue%22), comment "I'm on it" |
| 🔧 Big change     | Comment on the issue before writing code — many tickets have hidden constraints                                                                      |

### 🏷️ Issue labels

| 🏷️ Label              | 📝 Meaning                                    |
| --------------------- | --------------------------------------------- |
| 🟢 `good first issue` | Simple, well-scoped — great for first-timers  |
| 🔴 `bug`              | Something is broken                           |
| 🔵 `high priority`    | Do this first                                 |
| 🟡 `enhancement`      | Accepted improvement to an existing module    |
| 🟠 `new feature`      | New functionality — discuss before starting   |
| ⚪ `idea`             | Needs design discussion — don't implement yet |

### 🐛 Bug reports

- 🔍 Search existing issues before opening a new one
- 📝 Clearly describe **observed** vs **expected** behaviour
- 🚀 For minor fixes, just open a PR directly

### 🔄 Pull requests

- 🎯 Keep PRs focused — one concern per PR
- ✅ Make sure `npm run lint`, `npm run tsc -- --noEmit`, and `npm test` pass locally before pushing
- 🔗 Reference the issue number in your PR description

### 🍴 Forking

🤝 Forks are welcome. Please share useful features back via PR so the community benefits and your fork stays easy to sync.

---

## 📄 License

📜 [CC BY-NC 4.0](LICENSE) — free for educational and personal use with author attribution. Commercial use requires explicit written permission from the author ([zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)).

---

## 📞 Contact

- 💬 **Telegram community:** [Zufar Explained IT](https://t.me/zufarexplained)
- 👤 **Personal Telegram:** [@lucky_1uck](https://web.telegram.org/k/#@lucky_1uck)
- 📱 **WhatsApp:** [Message me](https://wa.me/447405503609)
- 📧 **Email:** [zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Sunagatov/Iced-Latte-Frontend/issues)
