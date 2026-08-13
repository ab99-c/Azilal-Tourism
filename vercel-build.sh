#!/bin/bash
# Vercel build script - builds the client-side app
# Uses --no-frozen-lockfile to avoid ERR_PNPM_LOCKFILE_CONFIG_MISMATCH
# when Vercel's pnpm version differs from the one that generated the lockfile.
echo "Installing dependencies..."
pnpm install --no-frozen-lockfile

echo "Building client with Vite..."
npx vite build

echo "Build complete. Output in dist/public/"
