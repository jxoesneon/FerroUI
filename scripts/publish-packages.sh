#!/bin/bash
set -e

# Use pnpm config set to ensure the token is correctly registered in the environment
pnpm config set //registry.npmjs.org/:_authToken "${NPM_TOKEN}"
pnpm config set registry https://registry.npmjs.org/
pnpm config set always-auth true

# Run the actual changeset publish command with provenance
pnpm changeset publish --provenance
