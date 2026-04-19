#!/bin/bash
set -e

# Ensure .npmrc is correctly configured with the token in both root and HOME
# We use the explicit registry format which is most compatible
printf "//registry.npmjs.org/:_authToken=%s\n" "${NPM_TOKEN}" > .npmrc
printf "//registry.npmjs.org/:_authToken=%s\n" "${NPM_TOKEN}" > "$HOME/.npmrc"

# Export it to be absolutely sure
export NPM_CONFIG_USERCONFIG="$HOME/.npmrc"

# Run the actual changeset publish command with provenance
pnpm changeset publish --provenance
