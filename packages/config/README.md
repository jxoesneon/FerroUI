# @ferroui/config

Shared configuration (ESLint, TypeScript, Prettier) for FerroUI UI.

## Installation

```bash
pnpm add -D @ferroui/config
```

## Usage

Extend this configuration in your local config files.

## API Reference

- `eslint`: Base ESLint configuration.
- `typescript`: Base tsconfig for apps and packages.
- `prettier`: Shared Prettier rules.

## Configuration

N/A

## Examples

```json
// .eslintrc.json
{
  "extends": "@ferroui/config/eslint"
}
```
