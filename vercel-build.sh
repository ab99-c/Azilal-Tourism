#!/bin/bash
set -euo pipefail

echo "Building client with Vite..."
npx vite build

echo "Bundling Vercel API handler..."
npx esbuild server/vercel-api.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=api/index.js

echo "Client and API build complete."
