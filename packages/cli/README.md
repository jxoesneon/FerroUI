# @ferroui/cli

The primary interface for FerroUI development, providing CLI commands for project management.

## Installation

```bash
pnpm add -g @ferroui/cli
```

## Usage

```bash
ferroui create my-project
ferroui dev
ferroui build
```

## API Reference

The CLI provides the following commands:
- `create`: Scaffold a new FerroUI project.
- `dev`: Start the development server with HMR.
- `generate`: Generate components or tools from templates.
- `build`: Build the project for production.
- `deploy`: Deploy the project to a target provider.

## Configuration

Configuration is managed via `ferroui.config.ts` in the project root.

## Examples

```bash
# Create a new project
ferroui create my-app --template default
```
