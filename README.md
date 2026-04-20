# FerroUI

[![GitHub License](https://img.shields.io/github/license/jxoesneon/FerroUI)](https://github.com/jxoesneon/FerroUI/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/jxoesneon/FerroUI)](https://github.com/jxoesneon/FerroUI/issues)
[![GitHub Stars](https://img.shields.io/github/stars/jxoesneon/FerroUI)](https://github.com/jxoesneon/FerroUI/stargazers)

**FerroUI: AI-powered, server-driven UI meta-framework**

FerroUI is an enterprise-grade meta-framework designed for building AI-native, server-driven user interfaces. It enables developers to build dynamic, layout-driven applications where the UI is orchestrated by an AI engine on the server and rendered seamlessly on the client.

## 🚀 Features

- **AI-Native Orchestration**: Built-in support for LLM-driven layout generation.
- **Server-Driven UI (SDUI)**: Decouple your UI logic from the client; manage layouts and components from the server.
- **Multi-Platform Support**: Render exactly the same UI on Web, Desktop (via Tauri), and Edge (via Cloudflare Workers).
- **Enterprise Standards**: Monorepo architecture, strict TypeScript, Zod validation, and OpenTelemetry instrumentation.
- **High Performance**: Optimized rendering engine with support for SSE-based streaming.

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript, Zod
- **Build System**: pnpm Workspaces, Turborepo, Vite 8
- **Styling**: Tailwind CSS 4, Framer Motion
- **Runtime**: Node.js >= 25, Express 5
- **Platforms**: Tauri (Desktop), Hono (Edge)

## 📦 Installation

To get started with FerroUI, clone the repository and run the bootstrap script:

```bash
git clone https://github.com/jxoesneon/FerroUI.git
cd FerroUI
chmod +x setup.sh
./setup.sh
```

## 📖 Available Commands

- `pnpm dev`: Start the development environment.
- `pnpm build`: Build all packages and applications.
- `pnpm test`: Run the test suite.
- `pnpm run lint`: Lint the codebase.
- `pnpm run typecheck`: Run TypeScript type checking.

## 📁 Project Structure

- `apps/`: Platform-specific clients (Web, Desktop, Edge).
- `packages/engine/`: The core orchestration engine and LLM providers.
- `packages/renderer/`: Layout rendering logic for React.
- `packages/schema/`: Shared validation schemas and data models.
- `packages/registry/`: Component registry and UI primitives.

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🌐 Links

- **GitHub Repository**: [jxoesneon/FerroUI](https://github.com/jxoesneon/FerroUI)
- **Discord**: [Join our community](https://discord.gg/ferrouiui)
