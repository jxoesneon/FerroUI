---
title: Contributing
---

# Contributing to FerroUI

Thank you for your interest in contributing to FerroUI. This document provides guidelines for contributing to the project.

## Code of Conduct

This project adheres to a [Code of Conduct](/meta/code-of-conduct). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:

- Check [Known Issues](/support/Known_Issues_Troubleshooting).
- Search [existing issues](https://github.com/jxoesneon/FerroUI/issues).

When creating a bug report, include:

- A clear title and description.
- Steps to reproduce.
- Expected vs. actual behavior.
- Environment details (OS, Node version, package manager).
- Screenshots or logs if applicable.

### Suggesting Enhancements

- Use a clear, descriptive title.
- Provide a detailed description.
- Explain why this enhancement would be useful.

### Pull Requests

1. Fork the repository.
2. Create a branch (`git checkout -b feature/amazing-feature`).
3. Make your changes.
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/) messages.
5. Push to your fork.
6. Open a Pull Request with a clear description of the change.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/jxoesneon/FerroUI.git
cd FerroUI

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Coding Standards

### TypeScript

- Use strict mode.
- Explicit return types on public APIs.
- No `any` types — prefer `unknown` + narrowing.

### Testing

- Unit tests for all new code.
- Integration tests for pipelines and cross-package flows.
- Coverage thresholds enforced per package via Vitest.

### Documentation

- JSDoc on public APIs.
- Update [docs](https://github.com/jxoesneon/FerroUI/tree/main/docs) if behavior changes.
- Add a Changeset entry for user-visible changes (`pnpm changeset`).

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add new component
fix: resolve validation bug
docs: update API reference
refactor: simplify engine logic
test: add integration tests
chore: update dependencies
```

## Review Process

- All PRs require at least one review.
- CI checks must pass.
- No merge conflicts.

## Questions?

- [GitHub Discussions](https://github.com/jxoesneon/FerroUI/discussions)
- [Issue tracker](https://github.com/jxoesneon/FerroUI/issues)

Thank you for contributing!

