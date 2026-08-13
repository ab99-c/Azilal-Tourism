#!/bin/bash
# Vercel build script - builds the client-side app
echo "Installing dependencies..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

echo "Building client with Vite..."
npx vite build

echo "Build complete. Output in dist/public/"
