#!/bin/bash
set -e

# Ensure .npmrc is correctly configured with the token in both root and HOME
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "$HOME/.npmrc"

# Export it to be absolutely sure
export NPM_CONFIG_USERCONFIG="$HOME/.npmrc"

# Run the actual changeset publish command with provenance
pnpm changeset publish --provenance
