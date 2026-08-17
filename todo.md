# Project TODO

## SEO Improvements
- [x] Add comprehensive meta tags (title, description, keywords) in client/index.html
- [x] Add Open Graph and Twitter Card tags for social sharing
- [x] Add hreflang tags for multilingual (AR, EN, FR, Amazigh)
- [x] Create sitemap.xml for all sections
- [x] Create robots.txt with sitemap reference
- [x] Add Schema.org JSON-LD structured data (TouristDestination, TravelAgency, FAQPage)
- [x] Add canonical URL meta tag
- [x] Verify SEO changes render correctly and save checkpoint

## 9-Principles Professional Upgrade

- [x] Add security headers middleware (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [x] Gate admin-only CRUD endpoints (cars/hotels create/update/delete, bookings.list) behind adminProcedure
- [x] Add DB indexes: cars.isActive, hotels.isActive, bookings.type/status, favorites unique(userId,itemType,itemId)
- [x] Add in-memory TTL cache for cars.list / hotels.list with invalidation on mutations
- [x] Harden bookings input validation (checkOut >= checkIn, length limits, guests >= 1)
- [x] Verify with vitest + build, save checkpoint, push to GitHub

## Bug Fixes (reported by user)

- [x] Fix navbar: removed duplicate contact link, improved spacing/whitespace-nowrap
- [x] Fix map pins: replaced fake coords with real Azilal-region coordinates, recentered map
- [x] Fix 3 broken destination imgs with concatenated Unsplash URLs

## Branding: ADRAR brand targeting Azilal city

- [x] Update hero badge/tagline to mention Azilal explicitly (ADRAR is the brand, Azilal is the city)
- [x] Update meta title/description to "ADRAR - Tourism in Azilal" framing
- [x] Update footer/about text to position ADRAR as the tourism brand of Azilal
- [x] Verify and checkpoint + push to GitHub

## Place name audit: ADRAR = brand, Azilal = place

- [x] Audit all text strings (LanguageContext, components) for ADRAR/ادرار used as place/region name
- [x] Replace place references with Azilal/أزيلال in all 4 languages (~63 occurrences)
- [x] Keep ADRAR only as brand (navbar logo, hero alt, footer brand, About ADRAR, EN/FR hero titles)
- [x] Verify visually, checkpoint (2013b0a6), push to GitHub (8ec4611)

## Navbar scroll navigation fix

- [x] Fix navbar links: clicking sections should smooth-scroll to the target section
- [x] Add JS scrollToSection utility with fixed-navbar offset (Navbar, Hero CTA/arrow, Footer links)
- [x] Fix broken concatenated image URL in CategoriesSection
- [x] Verify live (desktop + mobile viewport), checkpoint, push to GitHub

## User report: scroll fix not working on live site ("MATSLA7CH")

- [x] Test scrolling on live production (manus.space): real click on "الفنادق" scrolled to hotels section (3655px)
- [x] Add scrollIntoView fallback in scrollToSection when scrollTo does not move the page
- [x] Verify on production (checkpoint 8b381298, auto-published)
- [x] Push 8b381298 to GitHub (ab99-c/Azilal-Tourism main) — Vercel will auto-redeploy

## Stripe (deferred — user ineligible for Sandbox; will add keys later)

- [x] Investigated Stripe setup; user must supply own Stripe keys (not yet provided)

## Pay on Arrival payment system for bookings (user chose this)

- [x] Extend bookings schema: paymentMethod (pay_on_arrival) + paymentStatus columns (totalPrice persisted)
- [x] Server: persist paymentMethod + paymentStatus on booking create; admin markPaid/confirm procedures
- [x] Frontend: BookingModal 4-step flow with payment method step (Pay on Arrival) + total price preview
- [x] Frontend: booking confirmation screen explaining pay-directly-on-arrival
- [x] Owner dashboard: bookings tab with payment status + mark as paid action
- [x] Tests (vitest): booking.payment.test.ts + existing suites — 16/16 passing
- [x] Checkpoint + push to GitHub

## User report: OAuth login fails ("OAuth callback failed", "MKIBGHICH IDKHUL")

- [x] Reproduce: live logs show [OAuth] Callback failed: Table 'users' doesn't exist
- [x] Root cause: users table missing from DB (fullstack upgrade created schema but table never migrated)
- [x] Fix: created users table per drizzle schema; verified row inserted for owner (role=admin)
- [x] Verify: user row intact (role=admin) after migration, site renders OK, vitest 16/16 passing
- [x] Checkpoint + push to GitHub

## User request: dashboard must be per-owner (each owner controls only their own listings/bookings)

- [x] Audit current permissions: who can create cars/hotels, whose bookings the dashboard shows
- [x] Design: ownerId on cars/hotels; bookings carry ownerId + itemId; indexes added
- [x] Server: car/hotel create/update/delete scoped to ownerProcedure with requireOwnership; create sets ownerId
- [x] Server: bookings.create routes to item owner; markPaid/confirm gated by requireBookingAccess (owner OR admin)
- [x] Site admin (you) can still see/manage everything via adminProcedure (dashboard.my* lists)
- [x] Frontend: dashboard switched to trpc.dashboard.myCars/myHotels/myBookings (owner-scoped)
- [x] Migration: SQL assigned existing cars/hotels ownerId=1 (site admin)
- [x] Tests (vitest): server/ownership.test.ts 7 tests + suites updated — 24/24 passing
- [x] Verify renders OK; Checkpoint + push to GitHub

## User report: SELECT on bookings fails (missing columns: itemId, ownerId, paymentMethod, paymentStatus)

- [x] Inspect bookings: itemId was missing (paymentMethod/paymentStatus/ownerId existed); added itemId int + ownerId index
- [x] Backfilled itemId for 7 existing bookings (matched by name; fallback id=1)
- [x] Verified SELECT works, site renders, screenshots OK
- [x] No code change needed (schema-only fix) — nothing to push

## User request: verify owner dashboard shows only each owner's own bookings

- [x] Runtime tRPC tests: owner 5's myBookings → getMyBookings(5) only; owner 7's myCars/myHotels → scoped to 7; admin → unfiltered getAll*; unauthenticated → UNAUTHORIZED
- [x] Booking creation verified to route ownerId from car.ownerId/hotel.ownerId, not the guest's id
- [x] All 30 vitest tests passing (5 files)
- [x] Checkpoint d42b35a0 saved (auto-published) + pushed to GitHub (ab99-c/Azilal-Tourism main)

## User request: guest booking dashboard + keep owner dashboard scoped

- [x] Server: bookings.myBookings — guest-scoped listing by guestUserId === ctx.user.id (protectedProcedure)
- [x] Server: bookings.cancel — guest can cancel only own bookings (guestUserId check → FORBIDDEN); sets status='cancelled'
- [x] Server: bookings.create passes guestUserId from authenticated user when logged in
- [x] Frontend: GuestDashboard section (#guest-dashboard): own bookings list, status badges, pay-on-arrival info, cancel with confirm dialog (AR/EN/FR/BER)
- [x] Frontend: Navbar shows "حجوزاتي / My Bookings" for logged-in users, "تسجيل الدخول / Login" for guests
- [x] BookingModal passes guestUserId and invalidates guest bookings cache after success
- [x] Tests (vitest): 8 guest-scoping + cancel-gating tests; all 38 tests passing across 6 files
- [x] Checkpoint 2e008c5a saved (auto-published to azilaltour-j2sx2a5n.manus.space) + pushed to GitHub (ab99-c/Azilal-Tourism main)

## User request: owner isolation for restaurants, cafes, and other businesses (cars/hotels already done)

- [x] Audit restaurants/cafes schema and data: verify ownerId column exists, add if missing + migration (tables created, migrated, seeded 4 restaurants + 4 cafes with ownerId=1)
- [x] Server: restaurants owner-scoped CRUD (ownerProcedure, requireOwnership) + dashboard.myRestaurants
- [x] Server: cafes owner-scoped CRUD + dashboard.myCafes
- [x] Frontend: owner dashboard section/tab for restaurants and cafes (add/edit/delete own listings)
- [x] Frontend: RestaurantsSection/CafesSection read from trpc DB with static fallback
- [x] Tests (vitest): restaurants-cafes-ownership.test.ts 9 tests — all 47 tests passing across 7 files
- [x] Checkpoint 2d5a0883 saved (auto-published) + pushed to GitHub (ab99-c/Azilal-Tourism main)

## User request: image upload for restaurants & cafes in owner dashboard

- [x] Server: uploadImage procedures for restaurants & cafes (base64 input, S3 storagePut to restaurants/{uid}/ and cafes/{uid}/, save url to image column) with ownership check, ext allowlist (jpg/png/webp), 4MB limit
- [x] Server: create procedures return inserted id so pending image uploads after create; db helpers updated
- [x] Frontend: image upload UI in dashboard form (preview + dashed file input) for restaurants & cafes (cars keep URL input)
- [x] Frontend: direct "رفع صورة" buttons on restaurant/cafe list items (upload after creation via onSuccess callback too)
- [x] Frontend: RestaurantsSection/CafesSection already render item.image — uploaded images display automatically
- [x] Tests (vitest): image-upload.test.ts 7 tests — all 54 tests passing across 8 files
- [x] Fixed flaky pre-existing test (stable ownerId in create-th-then-view test)
- [x] Checkpoint 37aabdaa saved (auto-published) + pushed to GitHub (ab99-c/Azilal-Tourism main)

## User request: remove image button for restaurant/cafe owners

- [x] Server: restaurants.removeImage + cafes.removeImage procedures (ownerProcedure, requireOwnership, image→null, invalidateCache)
- [x] Frontend: "حذف الصورة" button in restaurant/cafe expanded actions, visible only when image exists, with confirm dialog
- [x] Tests (vitest): image-upload.test.ts — 6 removeImage gating tests; all 60 tests passing across 8 files
- [x] Checkpoint 1de5640e saved (auto-published) + pushed to GitHub (ab99-c/Azilal-Tourism main)

## User request: post-login two-choice flow

- [x] Frontend: LoginChoiceDialog with two options: "بغيت نحجز" (scrolls to #hotels sections) vs "عندي فندق/مقهى/سيارة" (scrolls to #owner-dashboard); skip option; remembered once per session (sessionStorage)
- [x] Add language labels for the choice flow (AR/EN/FR/BER)
- [x] Wired into Navbar: dialog auto-opens right after OAuth login completes (auth state change), once per session; owner-dashboard section got id="owner-dashboard"
- [x] Verified: tsc 0 errors, 60/60 vitest passing, dialog renders (screenshot OK); checkpoint 6730ffe0 auto-published; pushed to GitHub (ab99-c/Azilal-Tourism main)

## User request: deploy latest state to Vercel (same as Manus)

- [x] Latest commit 68a69671 pushed to GitHub main; Vercel auto-deployed production build (dpl_CER4wv54pL6hhimKuGabGSNYXTcp, state READY)
- [x] Live Vercel site verified: https://azilal-tourism.vercel.app serves the new build (bundle contains LoginChoiceDialog + choice flow)

## User report: mobile login not working + blank page on Vercel site

- [x] Diagnosed: Vercel static build lacks VITE_OAUTH_PORTAL_URL and VITE_APP_ID at build time → startLogin built an invalid URL and crashed the page; main.tsx already skips auto-redirect-to-login when the API is unavailable (no infinite loop on Vercel)
- [x] Fix: hardcoded fallbacks in client/src/const.ts — portal https://manus.im + OAuth app id J2SX2a5nNx9zeqeJ7oPCCo (verified identical values in the live Manus bundle); startLogin now always navigates or fails closed safely
- [x] Verified: fallbacks present in a Vercel-like static build (empty envs), 60/60 vitest passing, tsc clean, mobile viewport (375x812) renders fully with no blank page
- [x] Redeploy to Vercel via GitHub push, confirm live, report to user

## User request: PWA installable app with ADRAR icon/logo on mobile

- [x] Generate branded PWA app icons (ADRAR logo, Amazigh/Atlas aesthetic) — emerald green with golden Atlas peaks + Amazigh yennayer sun, flattened opaque squares at 512/192/180px
- [x] Manifest updated (maskable icon, emerald background, portrait) + iOS PWA meta tags (apple-mobile-web-app-capable, status-bar-style, app title); manifest and icons verified served correctly
- [x] Verify on mobile viewport (375x812): site renders fully, manifest served with branded icons, install prompt available natively on mobile browsers; checkpoint + push to GitHub

## User report: missing hero bg + broken navbar logo on Vercel (mobile screenshot)

- [x] Diagnose and fix missing hero background on Vercel (likely /manus-storage proxy not served on static Vercel build)
- [x] Diagnose and fix broken navbar logo image on Vercel (alt "Logo" shown)
- [x] Audit all image URLs in code: replace /manus-storage paths with permanent absolute URLs for Vercel compatibility
- [x] Fix hero background for all browsers: switched from <img> to CSS background-image (bg-cover/center) for max compatibility with embedded/in-app mobile browsers (checkpoint 4dca9eb5)

## Vercel git link broken (webhook dead) — user must reconnect repo

- [x] Webhook fixed automatically by GitHub push (user re-linked repo earlier): push of 4dca9eb5 triggered Vercel build
- [x] Verified fresh READY production deployment (dpl_D8A1kkrt...) from commit 4dca9eb5 with all CDN image refs (no manus-storage), LoginChoiceDialog, OAuth fallbacks in live bundle at azilal-tourism.vercel.app

## User report: images/logo invisible on Mi GlobalBrowser (phone)

- [ ] Create inline SVG fallback logo component (embedded in code, no external load needed) used when CDN logo fails
- [ ] Add global image onError fallback utility: swap CDN URL to local/data fallback on load failure
- [ ] Apply fallback to Navbar logo, Hero background, and all sections' images
- [ ] Verify on 375x812 mobile viewport, checkpoint + auto-publish, report to user
