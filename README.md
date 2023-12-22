# Iced-Latte (Frontend)

[![ci Status](https://github.com/Sunagatov/Iced-Latte-Frontend/actions/workflows/dev-branch-pr-deployment-pipeline.yml/badge.svg)](https://github.com/Sunagatov/Iced-Latte-Frontend/actions)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/danilqa/node-file-router/blob/main/LICENSE)
[![Known Vulnerabilities](https://snyk.io/test/github/Sunagatov/Iced-Latte-Frontend/badge.svg)](https://snyk.io/test/github/Sunagatov/Iced-Latte-Frontend)
[![Docker Pulls](https://img.shields.io/docker/pulls/zufarexplainedit/iced-latte-frontend.svg)](https://hub.docker.com/r/zufarexplainedit/iced-latte-frontend/)
[![GitHub issues](https://img.shields.io/github/issues/Sunagatov/Iced-Latte-Frontend)](https://github.com/Sunagatov/Iced-Latte-Frontend/issues)
[![GitHub stars](https://img.shields.io/github/stars/Sunagatov/Iced-Latte-Frontend)](https://github.com/Sunagatov/Iced-Latte-Frontend/stargazers)

**Iced-Latte (Frontend)** is a frontend that simulates the operations of an coffee online shop.
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
  - [FAQ](#faq)
  - [Community and Support](#community-and-support)

## Tech Stack

- **Core:** Next.js + Typescript.
- **State manager:** Zustand.
- **Css framework:** TailwindCSS.
- **Testing:** Jest, React-Testing-Library.

## Quick Start

Follow the setup instructions in [START.MD](START.md) to get the project up and running.

## Features

- User Authentication and Authorization
- Product Catalog Management
- Order Processing and Tracking
- Stripe Payment Integration
- Real-time Data Monitoring

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

## Contributing

Interested in contributing? Read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

Have any questions or suggestions? Feel free to [open an issue](https://github.com/Sunagatov/Iced-Latte-Frontend/issues) or contact us directly.

## FAQ

Address some common questions users might have about your project.

1. **Question:** How do I set up the project?
   **Answer:** Follow the instructions in [START.MD](START.md).

2. **Question:** Where can I find API documentation?
   **Answer:** The API documentation is available at `http://localhost:8083/api/docs/swagger-ui`.

<!-- Add more FAQs as needed -->

## Community and Support

Join our community https://t.me/zufarexplained! Link to forums, chat, or community pages if available.
