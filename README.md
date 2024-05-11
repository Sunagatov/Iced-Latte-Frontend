# Iced-Latte (Frontend)

[![ci Status](https://github.com/Sunagatov/Iced-Latte-Frontend/actions/workflows/dev-branch-pr-deployment-pipeline.yml/badge.svg)](https://github.com/Sunagatov/Iced-Latte-Frontend/actions)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/danilqa/node-file-router/blob/main/LICENSE)
[![Known Vulnerabilities](https://snyk.io/test/github/Sunagatov/Iced-Latte-Frontend/badge.svg)](https://snyk.io/test/github/Sunagatov/Iced-Latte-Frontend)
[![Docker Pulls](https://img.shields.io/docker/pulls/zufarexplainedit/Iced-Latte-Frontend.svg)](https://hub.docker.com/r/zufarexplainedit/Iced-Latte-Frontend/)
[![GitHub issues](https://img.shields.io/github/issues/Sunagatov/Iced-Latte-Frontend)](https://github.com/Sunagatov/Iced-Latte-Frontend/issues)
[![GitHub stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte-Frontend)](https://github.com/Sunagatov/Iced-Latte-Frontend/stargazers)

**Iced-Latte-Frontend (Frontend)** is a frontend that simulates the operations of an coffee online shop.
Built using Next.js, it's crafted for educational purposes, offering insights into modern application development with Next.js.

## Table of Contents

- [Iced-Latte (Frontend)](#iced-latte-frontend)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Quick Start](#quick-start)
  - [Features](#features)
  - [API Documentation](#api-documentation)
  - [Project structure](#project-structure)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)
  - [Contact](#contact)
  - [Community and Support](#community-and-support)

## Tech Stack

- **Core:** Next.js + Typescript.
- **State manager:** Zustand.
- **Css framework:** TailwindCSS.
- **Testing:** Jest, React-Testing-Library.

## Quick Start

Follow the setup instructions in [START.MD](START.md) to get the project up and running.

## API Documentation

The API is fully documented with Swagger. Access the documentation at `http://localhost:8083/api/docs/swagger-ui` once the server is running.

## Project structure

<pre>
  <b>- public/</b>  <i>(static files)</i>
  <b>- src/</b>  <i>(sources directory)</i>
    <b>- app/</b>
      <b>- _components/</b>  (components used by current page)
      <b>- someRouteFolder/</b>  <i>(some rote page)</i>
        <b>- _components/</b>  <i>(someRoute page components)</i>
        <i>page.tsx</i>  <i>(someRoute page)</i>
      <i>globals.css</i>  <i>(global styles)</i>
      <i>layout.tsx</i>  <i>(root layout)</i>
      <i>page.tsx</i>  <i>(main page)</i>
    <b>- components</b>  <i>(shared components across application)</i>
      <b>- ui</b>  <i>(shared ui components (buttons, etc.))</i>
    <b>- constants</b>  <i>(temporary hardcoded values)</i>
    <b>- data</b>  <i>(temporary mocked data)</i>
    <b>- hooks</b>  <i>(custom hooks)</i>
    <b>- models</b>  <i>(typescript types)</i>
    <b>- services</b>
    <b>- utils</b>  <i>(utility functions)</i>
    <i>tailwind.config.ts</i>  <i>(tailwind custom classes)</i>
</pre>

## 🚢 Deployment

No k8s, no AWS, we ship dockers directly via ssh and it's beautiful!

The entire production configuration is described in the [docker-compose.local.yml](docker-compose.local.yml) file.

Then, [Github Actions](.github/workflows/dev-branch-pr-deployment-pipeline.yml) have to take all the dirty work. They build, test and deploy changes to production on every merge to master (only official maintainers can do it).

Explore the whole [.github](.github) folder for more insights.

We're open for proposals on how to improve our deployments without overcomplicating it with modern devops bullshit.

## 🛤 Forking and tweaking

Forks are welcome.

Three huge requests for everyone:

- Please share new features you implement with us, so other folks can also benefit from them, and your own codebase minimally diverges from the original one (so you can sync updates and security fixes) .
- Do not use our issues and other official channels as a support desk. Use [chats](https://t.me/lucky_1uck).


## 🙋‍♂️ How to report a bug?

- 🆕 Open [a new issue](https://github.com/Sunagatov/Iced-Latte-Frontend/issues/new).
- 🔦 Please, **use a search**, to check, if there is already existed issue!
- Explain your idea or proposal in all the details:
  - Make sure you clearly describe "observed" and "expected" behaviour. It will dramatically save time for our contributors and maintainers.
  - **For minor fixes** please just open a PR.

## 💎 Now to propose a new feature?

- Go to our [Discussions](https://github.com/Iced-Latte-Frontend/discussions)
- Check to see if someone else has already come up with the idea before
- Create a new discussion
- 🖼 If it's **UI/UX** related: attach a screenshot or wireframe

## 😍 Contributions

Contributions are welcome.

The main point of interaction is the [Issues page](https://github.com/Sunagatov/Iced-Latte-Frontend/issues).

Here's our contribution guidelines — [CONTRIBUTING.md](CONTRIBUTING.md).

> The official development language at the moment is English, because 100% of our users speak it. We don't want to introduce unnecessary barriers for them. But we are used to writing commits and comments in Russian and we won't mind communicating with you in it.

### 😎 I want to write some code

- Open our [Issues page](https://github.com/Sunagatov/Iced-Latte-Frontend/issues) to see the most important tickets at top.
- Pick one issue you like and **leave a comment** inside that you're getting it.

**For big changes** open an issues first or (if it's already opened) leave a comment with brief explanation what and why you're going to change. Many tickets hang open not because they cannot be done, but because they cause many logical contradictions that you may not know. It's better to clarify them in comments before sending a PR.

### 🚦Pay attention to issue labels!

#### 🟩 Ready to implement

- **good first issue** — good tickets **for first-timers**. Usually these are simple and not critical things that allow you to quickly feel the code and start contributing to it.
- **bug** — if **something is not working**, it needs to be fixed, obviously.
- **high priority** — the **first priority** tickets.
- **enhancement** — accepted improvements for an existing module. Like adding a sort parameter to the feed. If improvement requires UI, **be sure to provide a sketch before you start.**

#### 🟨 Discussion is needed

- **new feature** —  completely new features. Usually they're too hard for newbies, leave them **for experienced contributors.**
- **idea** — **discussion is needed**. Those tickets look adequate, but waiting for real proposals how they will be done. Don't implement them right away.

#### 🟥 Questionable

- [¯\\_(ツ)\_/¯](https://github.com/Sunagatov/Iced-Latte-Frontend/labels/%C2%AF%5C_%28%E3%83%84%29_%2F%C2%AF) - special label for **questionable issues**. (should be closed in 60 days of inactivity)
- **[no label]** — ticket is new, unclear or still not reviewed. Feel free to comment it but **wait for our maintainers' decision** before starting to implement it.

## 👍 Our top contributors

Take some time to press F and give some respects to our [best contributors](https://github.com/Sunagatov/Iced-Latte-Frontend/graphs/contributors), who spent their own time to make the club better.

#### 😎 Iced Latte project creator / Product owner / Tech Lead

- [@Sunagatov](https://github.com/Sunagatov)

#### 😇 Project manager
- [@oonovikova](https://github.com/oonovikova)

#### 🕵️‍♀️ QA engineers
- [@TetianaPerinha](https://github.com/TetianaPerinha)
- [@ilsinyakov](https://github.com/ilsinyakov)
- [@Diana-Smolnikova](https://github.com/Diana-Smolnikova)

#### ⚙️ Backend developers
- [@annstriganova](https://github.com/annstriganova)
- [@M437A](https://github.com/M437A)
- [@Sunagatov](https://github.com/Sunagatov)
- [@vitaliibredun](https://github.com/vitaliibredun)
- [@plakhov](https://github.com/plakhov)
- [@shpali4](https://github.com/shpali4)
- [@yevr19](https://github.com/yevr19)
- [@andrew13pol](https://github.com/andrew13pol)
- [@nnick44](https://github.com/nnick44)

#### 🖥️ Frontend developers
- [@iakivpekarskyi](https://github.com/iakivpekarskyi)
- [@anksuunamun-govorov](https://github.com/anksuunamun)
- [@DmitriyUshkvarok](https://github.com/DmitriyUshkvarok)
- [@Wdyffs](https://github.com/Wdyffs)
- [@Gerasko-Vadim](https://github.com/Gerasko-Vadim)
- [@FMajesty](https://github.com/Lightness322)
- [@freecree](https://github.com/freecree)

#### 🎨 UX/UI designers
- [@vilena1me](https://github.com/vilena1me)
- [@monsoonsiren](https://github.com/monsoonsiren)
- [@ilyasgaifullin](https://github.com/ilyasgaifullin)

#### 📊 Business and system analysts
- [@nemeziss](https://github.com/nemeziss)
- [@anastasiiaerokhina](https://github.com/anastasiiaerokhina)
- [@Umk_aa](https://github.com/Umk_aa)
- [@dianarudometova](https://github.com/dianarudometova)

Let's press F to pay respects to these awesome contributors!

## 👩‍💼 License

[MIT](LICENSE)

In other words, you can use the code for private and commercial purposes with an author attribution (by including the original license file or mentioning the Club 🎩).

## 📞 Contact (Community and Support)

Join our IT community [Zufar Explained IT](https://t.me/zufarexplained) on Telegram.

Feel free to contact us via email: [zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com).

❤️
