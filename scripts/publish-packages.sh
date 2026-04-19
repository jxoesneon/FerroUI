#!/bin/bash
set -e

# Ensure .npmrc is correctly configured with the token
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc

# Run the actual changeset publish command with provenance
pnpm changeset publish --provenance
