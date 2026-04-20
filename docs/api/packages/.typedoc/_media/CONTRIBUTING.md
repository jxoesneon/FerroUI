# Contributing to FerroUI

Thank you for your interest in contributing to FerroUI! This document provides guidelines for contributing to the project.

---

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
- Check the [Known Issues](../support/Known_Issues_Troubleshooting.md)
- Search existing issues

When creating a bug report, include:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

### Suggesting Enhancements

- Use a clear, descriptive title
- Provide detailed description
- Explain why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages
5. Push to your fork
6. Open a Pull Request

---

## Development Setup

```bash
# Clone the repository
git clone https://github.com/ferrouiui/ferroui.git
cd ferroui

# Install dependencies
pnpm install

# Start development
pnpm dev
```

---

## Coding Standards

### TypeScript

- Use strict mode
- Explicit return types for public APIs
- No `any` types

### Testing

- Unit tests for all new code
- Minimum 80% coverage
- Integration tests for critical paths

### Documentation

- JSDoc for public APIs
- Update README if needed
- Add to changelog

---

## Commit Messages

Follow conventional commits:

```
feat: add new component﻿
fix: resolve validation bug
docs: update API reference
refactor: simplify engine logic
test: add integration tests
chore: update dependencies
```

---

## Review Process

- All PRs require at least one review
- CI checks must pass
- No merge conflicts

---

## Questions?

- Discord: https://discord.gg/ferrouiui
- Discussions: https://github.com/ferrouiui/ferroui/discussions

---

Thank you for contributing!
