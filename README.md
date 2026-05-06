<div style="text-align: center;">
  <br>
  <img src="public/assets/images/iced-latte-avatar.jpg" alt="Iced Latte Frontend" width="716">
  <h1>Iced Latte Frontend</h1>
  <p><strong>A modern React/Next.js coffee marketplace frontend — built in the open, for engineers who want real experience.</strong></p>
  <p>
    <a href="https://iced-latte.uk/">🌐 Live Demo</a> ·
    <a href="https://github.com/Sunagatov/Iced-Latte-Frontend/issues?q=is%3Aopen+label%3A%22good+first+issue%22">🟢 Good First Issues</a> ·
    <a href="https://t.me/zufarexplained">💬 Community</a>
  </p>

  [![CI Status](https://github.com/Sunagatov/Iced-Latte-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Sunagatov/Iced-Latte-Frontend/actions)
  [![License: Evaluation Only](https://img.shields.io/badge/license-evaluation--only-lightgrey.svg)](LICENSE)

  [![GitHub Stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte-Frontend)](https://github.com/Sunagatov/Iced-Latte-Frontend/stargazers)
  [![GitHub Forks](https://img.shields.io/github/forks/Sunagatov/Iced-Latte-Frontend?style=social)](https://github.com/Sunagatov/Iced-Latte-Frontend/network/members)
  [![Contributors](https://img.shields.io/github/contributors/Sunagatov/Iced-Latte-Frontend)](https://github.com/Sunagatov/Iced-Latte-Frontend/graphs/contributors)
  [![Docker Pulls](https://img.shields.io/docker/pulls/zufarexplainedit/iced-latte-frontend.svg)](https://hub.docker.com/r/zufarexplainedit/iced-latte-frontend/)
</div>

---

**📊 Key stats across all three repositories:**

- 🔧 [Backend](https://github.com/Sunagatov/Iced-Latte) — ![Stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte?style=flat) · ![Forks](https://img.shields.io/github/forks/Sunagatov/Iced-Latte?style=flat)
- 🎨 [Frontend](https://github.com/Sunagatov/Iced-Latte-Frontend) — ![Stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte-Frontend?style=flat) · ![Forks](https://img.shields.io/github/forks/Sunagatov/Iced-Latte-Frontend?style=flat)
- 🧪 [QA](https://github.com/Sunagatov/Iced-Latte-QA) — ![Stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte-QA?style=flat) · ![Forks](https://img.shields.io/github/forks/Sunagatov/Iced-Latte-QA?style=flat)

> ⭐ If this project helps you learn or inspires you, please give it a star — it means a lot to the community!

---

## 🚀 Quick Start

**📋 Prerequisites:** Node.js 20+, Docker Desktop

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

> 💡 See [Getting Started](docs/getting-started.md) for Docker setup, all four run modes, and troubleshooting.

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

<div style="text-align: center;">
  <img src="public/assets/images/iced-latte-avatar.jpg" alt="Iced Latte Frontend" width="716">
  <p><em>Live application interface: <a href="https://iced-latte.uk/">iced-latte.uk</a></em></p>
</div>

---

## 🤔 What is this?

Iced Latte is a non-profit sandbox project started in 2022 as a private pet project. It was later opened to the community to give junior engineers, students, and mentees practical experience in a real tech project with processes similar to those in actual tech teams. The first participants were students, Telegram channel subscribers, and mentees from ADPList and Women In Tech. The project has since grown and earned recognition from the wider developer community.

> ⭐ If this project helps you learn or inspires you, please give it a star — it means a lot to the community!

---

## 🏆 Recognition

Iced Latte has earned recognition from the broader tech community.

**🔥 GitHub Trending 🔥 — May 22, 2024**

  - The backend repository reached GitHub's Trending page — listed among resources *"the GitHub community is most excited about today"* — gaining **85 stars in a single day** with 27 active contributors. ([link to the archive](https://archive.ph/DRsD8))

**🥉 KaiCode 2024 Finalist 🥉**

  - Iced Latte made it to the finals of [KaiCode](https://www.kaicode.org/2024.html#jury) — an annual developer festival launched by Huawei, which positions itself as an incubator of collaborative technologies and rewards promising projects. Iced Latte was selected among **412 applications** and placed in the third group of 26 finalist repositories considered for the prize. Jury members are not allowed to assess their own projects, so the selection was fully independent.

**🛠️ JetBrains Open Source License 🛠️**

  - Iced Latte was recognized by [JetBrains](https://www.jetbrains.com/community/opensource/) — a leading software company specializing in intelligent development tools. JetBrains granted Iced Latte **8 free All Products Pack licenses** (February 2024, License Reference No. D379769990).

**👨‍💻 Recommended by a GitHub Star 👨‍💻**

  - Iced Latte was [recommended in this LinkedIn post](https://www.linkedin.com/feed/update/urn:li:activity:7195685359710617602/) by a well-known creator and [GitHub Star](https://stars.github.com/), who called it a great example of a Java project. Many Iced Latte contributors shared their positive experience in the comments.

---

## 🛠️ Tech Stack

- 💻 **Core:** Next.js 16, TypeScript 5, React 19
- 🗃️ **State:** Zustand
- 🎨 **Styling:** TailwindCSS 4
- 📡 **Data Fetching:** Axios, SWR
- 📝 **Forms:** React Hook Form, Yup
- 🧪 **Testing:** Jest, React Testing Library, Playwright
- 🚢 **Deployment:** Docker, GitHub Actions

---

## 📚 Guides

- 📄 [Getting Started](docs/getting-started.md) — all run modes, Docker setup, environment variables, troubleshooting
- 📄 [LICENSE](LICENSE) — personal local evaluation only; public/educational/commercial use requires permission

---

## 📁 Project Structure

```
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

---

## 🤝 Contributing

🎉 Contributions are welcome. Here's how to get involved:

- 🐛 **Found a bug:** [Open an issue](https://github.com/Sunagatov/Iced-Latte-Frontend/issues/new) with the `bug` label
- 💡 **Want a feature:** start a [Discussion](https://github.com/Sunagatov/Iced-Latte-Frontend/discussions) first
- 👨‍💻 **Ready to code:** pick a [`good first issue`](https://github.com/Sunagatov/Iced-Latte-Frontend/issues?q=is%3Aopen+label%3A%22good+first+issue%22), then comment "I'm on it"
- 🔧 **Big change:** comment on the issue before writing code — many tickets have hidden constraints

---

### 🏷️ Issue labels

- 🟢 `good first issue` — simple, well-scoped, and great for first-timers
- 🔴 `bug` — something is broken
- 🔵 `high priority` — do this first
- 🟡 `enhancement` — accepted improvement to an existing module
- 🟠 `new feature` — new functionality; discuss before starting
- ⚪ `idea` — needs design discussion; don't implement yet

---

### 🐛 Bug reports

- 🔍 Search existing issues before opening a new one
- 📝 Clearly describe **observed** vs **expected** behavior
- 🚀 For minor fixes, just open a PR directly

---

### 🔄 Pull requests

- 🎯 Keep PRs focused — one concern per PR
- ✅ Make sure `npm run lint`, `npm run tsc -- --noEmit`, and `npm test` pass locally before pushing
- 🔗 Reference the issue number in your PR description

---

### 🍴 Forking

🤝 Forks are welcome. Please share useful features back via PR so the community benefits and your fork stays easy to sync.

---

## 📄 License

📜 [Iced Latte Personal Evaluation License 2026](LICENSE) — personal local evaluation only. Public, educational, remote-hosted, and commercial use require explicit written permission from the author ([zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)).

---

## 📞 Contact

- 💬 **Telegram community:** [Project community](https://t.me/zufarexplained)
- 👤 **Personal Telegram:** [@lucky_1uck](https://web.telegram.org/k/#@lucky_1uck)
- 📱 **WhatsApp:** [Message me](https://wa.me/447405503609)
- 📧 **Email:** [zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Sunagatov/Iced-Latte-Frontend/issues)

❤️
