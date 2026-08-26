# Verification: dedicated products page

The development preview was checked at mobile width 375x812 for `/` and `/products`. The `/products` route renders the multilingual products and associations content in a dedicated page with a header, language controls, green hero section, product card, association card, contact action, and footer. The homepage no longer mounts `LocalProductsSection`; its tourism card remains the entry point and routes to `/products`.

Focused tests passed: 13 tests across four files. TypeScript passed with no errors. `pnpm run build:vercel` completed successfully, producing the Vercel client and API build.
