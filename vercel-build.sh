#!/bin/bash
set -euo pipefail

# Vercel installs dependencies before running this script.
echo "Building client with Vite..."
npx vite build

echo "Bundling Vercel API handler..."
npx esbuild server/vercel-api.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=api/index.mjs

echo "Client and API build complete."
