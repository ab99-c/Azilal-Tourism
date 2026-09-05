#!/bin/bash
set -euo pipefail

echo "Building client with Vite..."
npx vite build

# Keep the production database schema in sync before the API bundle is deployed.
# This fixes missing-table errors on fresh/older Vercel database deployments.
if [ -n "${DATABASE_URL:-}" ]; then
  echo "Applying Drizzle migrations..."
  npx drizzle-kit migrate
else
  echo "DATABASE_URL is not configured; skipping database migrations."
fi

echo "Bundling Vercel API handler..."
npx esbuild server/vercel-api.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=api/index.js

echo "Client and API build complete."
