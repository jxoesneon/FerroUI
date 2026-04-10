# Alloy Project

Welcome to the Alloy Project repository. This repository is organized as a monorepo, following enterprise-level standards for documentation, source code, and operations as defined in our [System Architecture Document](./docs/architecture/System_Architecture_Document.md).

## Repository Structure

### Documentation (`docs/`)
Comprehensive project documentation, technical specs, and strategic plans:
- `ai/`: AI strategy, prompt versioning, and LLM benchmarking.
- `architecture/`: System design, [ADRs](./docs/architecture/ADRs), and [RFCs](./docs/architecture/RFCs).
- `dev-experience/`: Quickstart guides and developer onboarding.
- `engineering/`: Frontend and backend technical specifications.
- `ops/`: Operations, reliability, deployment guides, and runbooks.
- `product/`: Product requirements ([PRDs](./docs/product/PRDs)), personas, and roadmap.
- `security/`: Security threat models, compliance, and privacy.
- `support/`: FAQ, known issues, and escalation paths.
- `whitepapers/`: High-level strategic whitepapers and research.

### Monorepo Packages (`packages/`)
Core libraries and shared logic:
- `engine/`: The central Alloy orchestration engine.
- `registry/`: Component registry and atomic UI primitives.
- `schema/`: Zod-based AlloyLayout schemas.
- `tools/`: Tool registration and execution helpers.
- `telemetry/`: OpenTelemetry instrumentation.
- `i18n/`: Internationalization and locale bundles.

### Applications (`apps/`)
Deployment-specific entry points:
- `web/`: Standard React-based web renderer.
- `desktop/`: Tauri-based desktop shell.
- `edge/`: Cloudflare Workers edge deployment.

### Other Directories
- `alloy/`: Prompt engineering artifacts (`prompts/`) and evaluation suites (`evals/`).
- `infra/`: Infrastructure-as-Code (Terraform/Kubernetes) and environment configuration.
- `tests/`: Integration and E2E test suites.
- `scripts/`: Development and CI/CD automation scripts.
- `.github/`: GitHub Actions workflows and platform configurations.

## Getting Started

Refer to the [Quickstart Guide](./docs/dev-experience/Quickstart_Developer_Onboarding.md) to set up your local development environment.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Code of Conduct

Our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) outlines expected community behavior.

## License

This project is licensed under the [MIT License](./LICENSE).
