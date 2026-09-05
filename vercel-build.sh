#!/bin/bash
set -euo pipefail

echo "Building client with Vite..."
npx vite build

# Keep the production database schema in sync before the API bundle is deployed.
# TiDB Serverless is reached through the TLS-enabled Drizzle config.
if [ -n "${DATABASE_URL:-}" ]; then
  echo "Synchronizing Drizzle schema..."
  npx drizzle-kit push --force
else
  echo "DATABASE_URL is not configured; skipping database schema sync."
fi

echo "Bundling Vercel API handler..."
npx esbuild server/vercel-api.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=api/index.js

echo "Client and API build complete."
