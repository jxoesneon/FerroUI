#!/bin/bash
set -e

# FerroUI Bootstrap Script

echo "â🚀 Bootstrapping FerroUI..."

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "â❌ pnpm is not installed. Please install it first: https://pnpm.io/installation"
    exit 1
fi

echo "â✅ pnpm found: $(pnpm -v)"

# Install dependencies
echo "â📦 Installing dependencies..."
pnpm install

# Build the project
echo "â🏗️ Building FerroUI packages..."
pnpm run build

echo "â🎉 FerroUI is ready! Check CLAUDE.md for available commands."
