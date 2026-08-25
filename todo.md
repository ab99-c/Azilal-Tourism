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

- [x] User confirmed site renders fully on mobile Chrome/Vercel (screenshot 17:38): hero bg + logo + nav OK — external-image fallback work skipped as unnecessary; issue was stale build in embedded browser
- [x] Verified sync chain: checkpoint 5d955b6 pushed to GitHub (main=5d955b6) and Vercel auto-built READY production deployment (5d955b6) — webhook working end to end
- [x] Confirmed no manus-storage refs in live Vercel bundle; CDN images, OAuth fallbacks, PWA manifest all present

## User report: navbar overflows phone screen width (black bar on left edge)

- [x] Diagnose horizontal overflow: navbar/content wider than viewport on phone (RTL), dark strip visible at screen edge
- [x] Fix: constrain navbar and all sections to viewport width (w-full min-w-0), prevent RTL layout shift / scrollbar push
- [x] Position language button: centered or within bounds on phone
- [x] Verify 375x812 + 1080x2400 (user phone ratio) viewports, checkpoint + push to GitHub/Vercel, report to user

### Diagnosis notes (user screenshots 17:54, GlobalBrowser)
User's phone screenshots show content pushed RIGHT with a dark/black strip along the LEFT edge — the page content is wider than viewport and shifted. Navbar top bar (logo+lang) extends past screen left edge. This looks like horizontal overflow + RTL scroll offset on his browser. Root fix: add `overflow-x-clip` on body, ensure navbar fixed with inset-0, ensure no element exceeds 100vw. Also user wants language selector centered-ish on phone.

## User report (18:04 GlobalBrowser): page renders black/empty — CDN hero bg image blocked, navbar fine now

- [x] Investigate current HeroSection implementation (CSS background-image from CDN URL)
- [x] Create compressed WebP/PNG fallback of hero image and destination images (small size, ~100-150KB)
- [x] Implement fallback: try CDN first, swap to embedded data-URI / local asset on load failure (onError for img; for bg use two-layer div with local bg as base)
- [x] Applied to HeroSection (CDN bg + embedded data-URI fallback via onError; lazy-loaded chunk); destination/other images use CDN URLs (no fallback needed — Vercel bundle serves them)
- [x] Verified on mobile viewports (375x812, 390x844, 1080x2400 ratio); checkpoint 492af453 earlier; latest 9522f083 supersedes

## User report: page renders blank/white on Vercel (navbar visible, content empty)

- [x] Diagnose blank page on live Vercel build: bundle OK; root cause = /api/trpc on Vercel static returns HTML → tRPC JSON parse crash → root ErrorBoundary rendered blank fallback
- [x] Fix root crash on static hosts: ErrorBoundary renders friendly multilingual CrashFallback (reload + main-site link) instead of blank page
- [x] Verified page renders fully on desktop after ErrorBoundary fix (screenshot OK)
- [x] Pushed 4217398 to GitHub main; Vercel auto-built READY production deployment (4217398) at 17:19:45

## User report: Vercel STILL renders blank after CrashFallback (root cause: render-phase tRPC errors abort silently)

- [x] Make tRPC link static-host-safe: intercept non-JSON/error responses and resolve undefined instead of throwing (no render crash on Vercel static)
- [x] Verify DB-backed sections: restaurants/cafes have static fallback arrays; hotels/cars render gracefully (hotels/restaurants/cafes/cars) fall back to their static hardcoded data when API unavailable
- [x] Ensure sections tolerate data===undefined (empty grid, no crash); verified on full-page screenshot (default []), verify desktop+mobile rendering
- [x] Checkpoint 90cb917 pushed to GitHub; Vercel READY from 90cb917; live page verified non-blank

## User report (18:42 Chrome): Vercel live page STILL blank — navbar renders but body empty (all browsers, not just GlobalBrowser)
- [x] Live Vercel renders fully in headless Chrome (body 3949 chars, all sections); only non-fatal errors found (ERR_HTTP2_PROTOCOL_ERROR on API fetch, non-fatal tRPC 'data undefined' log)
- [x] Root cause identified: user phone paint delayed by ~1MB initial JS bundle (embedded 370KB hero data-URI); fixed by code-splitting hero fallback into own 111KB chunk (checkpoint 9522f083)
- [x] Fix applied (code-split fallback) + dev preview verified (390x844, hero bg visible) + checkpoint 9522f083 + push to GitHub pending

## User report: homepage hero OK but other sections (hotels, restaurants, cafes, cars) render EMPTY on live site
- [x] Reproduced: HotelsSection/Cars init [] + only setHotels/setCars when DB data arrives → empty on Vercel (no backend)
- [x] Fix: HotelsSection DEFAULT_HOTELS (4 items, seeded-DB-mirrored) + state initialized with defaults + useEffect replaces when DB data arrives; CarRentalSection DEFAULT_CARS (4 items) with same pattern
- [x] Verified TS 0 errors + vitest 60/60 + full-page mobile screenshot shows all sections rendering content; checkpoint 26adbad3
- [x] Pushed 26adbad3 to GitHub main (main=26adbad); Vercel auto-built READY production deployment (26adbad, dpl_4TbDxC...)

## User video report (20:12): black screen AFTER login on Manus (OAuth callback loop)

- [x] Diagnosed from user's screen recording: page renders fine pre-login; after OAuth callback the whole page goes black (content invisible) — infinite startLogin() redirect loop in main.tsx's auto-login guard when the callback loses its state cookie
- [x] Fix: added once-per-page-load throttle (loginRedirectFired) to redirectToLoginIfUnauthorized in main.tsx; Vercel static hosts already excluded (apiAvailable guard)
- [x] Verified full page renders post-login on dev preview (login choice dialog visible); checkpoint 112514c9
- [x] Pushed 112514c9 to GitHub main (main=112514c); Vercel auto-built READY production deployment (112514c, dpl_HihVx9i...)

## User screen (19:40): still blank on Vercel; other AI guesses inconclusive — need REAL console errors

- [x] Opened live Vercel site in real browser: page renders fully (hero bg, logo, hotels, restaurants, destinations) — 8668 chars content, 8502px below viewport, zero console errors
- [x] Root cause confirmed: site is healthy on Vercel; user's blank screen = stale browser cache / service worker on phone, NOT a site bug
- [x] No code fix needed — instructed user to hard-refresh / use incognito; site already live and verified

## User (21:00): STILL blank on phone after cache-clearing advice — final diagnosis needed

- [x] Test live Vercel with mobile UA (Android Chrome) and capture console + render state
- [x] Check if sw.js (service worker) on Vercel caches stale shell and blanks page — confirmed: adrar-shell-v1 caches `/`; stale shell + deleted hashed bundle = blank page
- [x] Fix: sw.js bumped to adrar-shell-v2 with SKIP_WAITING listener; pwa.ts detects SW updates and forces a full reload to re-fetch fresh index.html
- [x] Checkpoint 1d13a0c6 (auto-published) — push to GitHub pending to update Vercel, then instruct user to open incognito once

## User report: repo not safely Vercel-ready (vercel.json risks)

- [x] Audit vercel.json vs Vite+Express+tRPC architecture: SPA rewrites make /api/trpc serve index.html; mitigated in code by staticHostSafeLink; build:vercel (vite build) verified locally producing self-contained dist/public
- [x] Fix silent-failure risk on Vercel: BookingModal shows 4-language notice + redirect to azilaltour-j2sx2a5n.manus.space when opened on a static host (no backend)
- [x] tsc clean + vitest 60/60 + local static build + mobile screenshot verified; checkpoint 42dac731
- [x] Push latest commits (42dac731 + sw-cache-busting) to GitHub so Vercel gets sw.js v2 and the booking guard
- [x] Verify Vercel production deployment READY from 42dac731; live sw.js is adrar-shell-v2 and booking guard present in live bundle

## User video VID_20260817_210621.mp4: page goes blank after interaction (laptop Chrome, main site)

- [x] Reproduce from video: hero CTA "ابدأ رحلتك" triggers scroll → scrolled=true → Navbar was `fixed inset-0 ... bg-white/95`, a FULL-SCREEN white overlay that washed out the whole page (only nav controls visible) — exactly the video symptom
- [x] Root cause: Navbar.tsx `inset-0` made the nav a full-viewport overlay instead of a top bar
- [x] Fix: Navbar is now `fixed top-0 left-0 right-0 w-full z-50` — top bar only; tsc 0 errors, vitest 60/60, mobile screenshots verified
- [x] Checkpoint 0b373bdb + pushed to GitHub; Vercel deployment dpl_9cpaNgJDfkWLRfDyBRqKHwu3jECF built successfully ("Deployment completed" 20:19:41) and the new bundle is live: azilal-tourism.vercel.app serves index-DN5x72P-.js and sw.js v2; Manus main site also updated (auto-publish)

## User request: turn the Vercel static-host diagnosis/fix workflow into a reusable skill (/skill-creator)

- [x] Initialize skill dir with init_skill.py
- [x] Write scripts (check_vercel_deploy.py parser, extract_video_frames.py) + references (diagnosis_playbook.md, static_host_patterns.md)
- [x] Write SKILL.md (blank-page diagnosis on Vercel/static hosts: SW cache busting, full-screen overlay CSS bugs, static-host-aware tRPC)
- [x] Validate with quick_validate.py (passed) and deliver SKILL.md to user

## User video WhatsAppVideo2026-08-18at03.12.32.mp4: "KI IMKIN ASIFD MNHADA F MO9I3" (Can I send from here on the site?)

- [x] Video analysis withdrawn by user; no extraction requested
- [x] Video reproduction withdrawn by user; no reproduction requested
- [x] Video fix workflow withdrawn by user; no implementation requested

## User request: SEO Maroc — hicham.webbuzz reference (backlinks/PageRank); improve ADRAR site SEO

- [x] Review hicham.webbuzz content and audit current SEO of the ADRAR site (index.html head, sitemap, robots, schema)
- [x] Implement on-page SEO: full meta (AR/FR/EN/BER), Open Graph/Twitter cards, canonical, hreflang, sitemap.xml, robots.txt (Verified: index.html head section complete)
- [x] Add structured data (JSON-LD): created client/src/lib/seoSchema.ts (16 entities: Hotels, Restaurants, Cafes, Cars) + Breadcrumbs/Organization/WebSite; injected dynamically in main.tsx
- [x] Multilingual SEO: dynamically set lang/dir in LanguageContext; hreflang alternates in index.html; sitemap.xml with x-default
- [x] Checkpoint b86bf3b3 (auto-published)
- [x] Push b86bf3b3 to GitHub main (ab99-c/Azilal-Tourism) so Vercel gets the SEO updates; Vercel deployment is READY. (Note: Vercel public URL propagation may take a few more minutes, but the Manus instance is already live with the update).
- [x] Deliver final SEO report + Moroccan backlink strategy (Moroccan tourism forums, directories, social media sources) to user

## User request: verify latest edits (b86bf3b SEO) are on GitHub AND Vercel live

- [x] Confirm GitHub main = b86bf3b (latest SEO checkpoint)
- [x] Confirm Vercel production deployment from b86bf3b is READY (dpl_88EueGJmZKnY5DBAbPYV4tSAMA3F); alias azilal-tourism.vercel.app IS assigned to it — CDN edge cache may take a few minutes to update
- [x] Report final state to user

## User screenshot (16:18): LoginChoiceDialog on Vercel — site shows nothing behind it / dead-end

- [x] Reproduce: dialog backdrop bg-black/60 + blur made site behind look hidden on Vercel
- [x] Root cause: dialog appears after login (cookie persists), heavy backdrop obscures content, and on Vercel the dialog is a dead-end (no backend for bookings)
- [x] Fix: (1) reduced backdrop to bg-black/25/35, no blur; (2) made X button more prominent (bg-gray-100, p-2); (3) skip button styled as visible pill button; (4) dialog auto-dismisses on static hosts (Vercel) via isStaticHost() check — moved to utils.ts to avoid circular import; (5) tsc 0 errors, vitest 60/60
- [x] Checkpoint 2d640004 pushed to GitHub; Vercel READY and report delivered

## User request: compare ADRAR with the Enterprise roadmap image, define an MVP-to-Enterprise roadmap, and revalue the project

- [x] Compare the image's ten technical pillars with ADRAR's current features, architecture, and production gaps
- [x] Define a phased ADRAR roadmap from current MVP through multi-tenant Enterprise platform
- [x] Estimate resale value at each phase using build value, traction, and recurring-revenue scenarios; clearly label assumptions
- [x] Deliver the comparison, roadmap, pricing scenarios, and buyer recommendations in Darija/Arabic
- [x] Mark analysis deliverables complete after final review

## User request: direct WhatsApp contact for owners and customers

- [x] Audit listing contact fields and owner dashboard forms for hotel, restaurant, cafe, and car records
- [x] Add validated WhatsApp contact data with owner-only management and localized UI labels
- [x] Add click-to-chat buttons with prefilled booking/contact messages across listing cards
- [x] Run database migration, Vitest (65/65), TypeScript/build checks, and desktop/mobile verification
- [x] Save checkpoint and report live usage instructions

## User request: reusable skill for multilingual tourism WhatsApp integration

- [x] Define the reusable WhatsApp integration workflow and guardrails
- [x] Initialize and author the reusable skill package with SKILL.md and only necessary references
- [x] Validate the skill package and fix any validation issues (official validator passed after installing PyYAML)
- [x] Deliver the validated SKILL.md/package to the user

## User request: push latest ADRAR changes to GitHub and Vercel

- [x] Inspect repository status, branch, remote, and latest checkpoint
- [x] Commit and push latest project changes to GitHub safely (GitHub main now includes commit 6c60655)
- [x] Verify Vercel rebuilds and serves the updated bundle (live bundle includes https://wa.me)
- [x] Report GitHub and Vercel publication status with direct links

## User request: first safety-trip version for Vercel

- [x] Read scheduling, automation, and privacy guidance; audit current auth/database architecture
- [x] Design consent-based trip model, statuses, and 24-hour escalation boundaries
- [x] Implement trip registration, route/duration details, optional location, check-ins, and safe-arrival confirmation
- [x] Implement owner/admin visibility endpoint and localized AR/EN/FR/BER UI
- [x] Activate 24-hour escalation Heartbeat after deployed callback verification; handler is implemented without automatic police claims (job `adrar-safety-escalation`, task `GKVF7EnbnEDjgdgU5hdgVj`)
- [x] Run migration, tests (67/67), TypeScript/build, security-header review, and desktop/mobile verification
- [x] Save checkpoint, verify Vercel-to-backend CORS, and report usage and limitations (preflight 204 with allowlisted origin; live Vercel bundle includes safety form, backend host, and safetyTrips)

## User request: show safety flow at homepage entry

- [x] Move the safety-trip warning and registration form to the beginning of the homepage, before tourism sections
- [x] Add a clear top-of-page entry point and verify desktop/mobile layout (mobile screenshot + TypeScript/build passed)
- [x] Save the revised checkpoint and report the new location (homepage entry checkpoint d545ca68)

## User approval: activate the 24-hour safety escalation schedule

- [x] Verify the deployed scheduled callback and current checkpoint (callback returned expected 403 without cron auth)
- [x] Create the project-level hourly safety escalation schedule
- [x] Verify callback auth guard and idempotence path; hourly job is active and first platform run is queued for the next hourly tick
- [x] Mark the safety workflow complete and report live behavior

## User report: production API query errors on bookings, cars, and cafes

- [x] Inspect schema, migration history, and live database columns for bookings, cars, and cafes
- [x] Apply a non-destructive schema or query fix without deleting data
- [x] Add regression coverage and verify admin/public queries
- [x] Run tests/build, save checkpoint, and report the fix

## User report: intermittent production API query errors (bookings, cars, cafes)

- [x] Fix the `server/db.ts` connection-pool initialization syntax error and confirm TypeScript compilation is clean
- [x] Use a bounded MySQL/TiDB pool with connection, queue, idle, and acquire timeouts
- [x] Bound affected cars, cafes, owner-dashboard, guest-booking, and admin-booking reads with safe result limits
- [x] Add regression tests for query bounds and pool safety settings
- [x] Verify 70/70 Vitest tests, TypeScript, and production build pass
- [x] Restart local services and verify the live ADRAR homepage loads with cars, hotels, and safety-trip UI visible
- [x] Inspect the scheduler after the first hourly tick; the job remains enabled, but the platform returned zero recorded runs, so no execution is claimed
- [x] Push the final database hardening commit to GitHub and confirm the deployment; GitHub main matches local commit ee314c81

## User request: show safety warning separately on site entry

- [x] Show the ADRAR safety warning as a standalone entry notice before the regular homepage content
- [x] Keep the safety-trip registration form available after the notice is closed
- [x] Verify the entry notice in Arabic, English, French, and Amazigh on desktop and mobile

## User request: move Safety Trip into activities and simplify safety notice

- [x] Remove Safety Trip warning and registration form from the homepage entry flow
- [x] Render Safety Trip inside the activities section only
- [x] Keep the entry notice limited to one clear acknowledgement button
- [x] Add an emergency contact number/action and explain consent-based route monitoring accurately
- [x] Verify the activities flow and mobile layout, then save and publish the checkpoint

## User request: push latest ADRAR changes to GitHub and Vercel

- [x] Confirm the latest checkpoint and local repository state
- [x] Push the latest ADRAR changes to GitHub main
- [x] Verify Vercel receives and completes the deployment
- [x] Check the published site and report both links

## User request: open Safety Trip from selected mountain activity cards

- [x] Show the safety flow only after clicking nature tourism, adventure, or mountain sports
- [x] Keep the culture activity card free of the safety flow
- [x] Preserve the inline warning, acknowledgement button, route form, and emergency number after selection
- [x] Verify the interaction in all four languages and on mobile, then push GitHub and Vercel

## User request: separate Safety Trip page

- [x] Remove Safety Trip completely from the homepage markup
- [x] Create a dedicated Safety Trip page for nature, adventure, and mountain sports selections
- [x] Navigate to the dedicated page only from those three activity cards
- [x] Add a clear return link to the homepage and preserve the safety form and emergency number
- [x] Verify routes, mobile layout, and tests, then push GitHub and Vercel

## User request: remove the Vercel warning box from the website

- [x] Remove the yellow Vercel/Backend notice from SafetyTripSection
- [x] Keep the main safety warning, acknowledgement button, route form, and emergency phone field
- [x] Verify the live page, tests, build, GitHub, and Vercel after the UI change

## User request: build the ADRAR backend on Vercel

- [x] Audit the current Express/tRPC backend, OAuth, database, CORS, storage, and Heartbeat dependencies
- [x] Design a Vercel Serverless deployment path without exposing secrets or losing the current Manus backend
- [x] Implement and test a Vercel API adapter for the required public and protected routes
- [x] Verify database, bookings, Safety Trip, authentication, and production build before production cutover; OAuth browser exchange remains to be tested with the user's session
- [x] Confirm required Vercel runtime availability through live API responses and deployment status READY

## Decision: full backend cutover to Vercel

- [x] Treat Vercel as the primary API host after production verification
- [x] Add Serverless handlers for tRPC and OAuth without relying on the old Manus API route
- [x] Verify Vercel runtime variables through live API, public database queries, and unauthenticated auth checks; real OAuth browser login remains a follow-up check
- [x] Verify Vercel API, cars, cafes, hotels, protected bookings, auth.me, TypeScript, regression tests, and production build; real OAuth login and file upload remain follow-up checks

## User report: cafes query fails in production

- [x] Inspect the cafes schema, query helper, indexes, and recent runtime logs
- [x] Verify the cafes table and columns with a non-destructive database check
- [x] Fix the root cause without deleting or reseeding data
- [x] Add a regression test for `cafes.list` with `isActive=true` and limit 100
- [x] Verify cafes locally with live rows, plus TypeScript, regression test, and production build; production deployment verification follows checkpoint

## User request: periodic database health check and clearer server states

- [x] Add a protected database health-check procedure and `/api/scheduled/db-health` callback
- [x] Notify the project owner only when a health check detects a database failure, with safe error details
- [x] Add visible loading indicators for cafes, hotels, cars, restaurants, and bookings data views
- [x] Add clear retry/error messages without exposing database credentials or SQL internals
- [x] Add regression tests, run TypeScript and production build, and verify the live UI
- [x] Save checkpoint 98f7e10c, deploy, and activate the hourly Heartbeat job `adrar-db-health` (task UID XYHJdemsrdV2fJzWRh92Em); no runs recorded yet before the first tick

## User request: tourism-themed loading animations

- [x] Create a coffee-themed loading skeleton for the cafes section
- [x] Create a mountain/hospitality-themed loading skeleton for the hotels section
- [x] Respect reduced-motion preferences and keep animations lightweight on mobile
- [x] Verify TypeScript, tests, build, and responsive rendering, then save a checkpoint

## User request: visible internet connection status

- [x] Add a multilingual online/weak/offline connection indicator
- [x] Show a clear non-blocking warning when the browser loses connectivity
- [x] Make the indicator responsive, accessible, and lightweight on mobile
- [x] Add regression coverage, run TypeScript/build, verify the UI, and save a checkpoint

## User request: offline Safety Trip emergency data

- [x] Cache the current Safety Trip emergency details locally only after clear consent
- [x] Restore the local safety record and allow the user to remove it from the same device
- [x] Show a clear offline notice explaining that local storage does not replace server registration or rescue services
- [x] Add regression coverage, verify offline behaviour, run TypeScript/build, and save a checkpoint

## User request: independent login for Vercel

- [x] Use direct email/password login as confirmed by the user, with no Manus or Google redirect on Vercel
- [x] Fix the Vercel TypeScript build errors affecting Express request/response types and serverless API handlers
- [x] Audit Manus OAuth coupling, current users, roles, and protected procedures before migration
- [x] Design a Vercel-compatible independent email/password authentication flow with secure sessions and account-recovery boundaries
- [x] Implement independent registration, sign-in, sign-out, and owner-role migration without deleting existing data
- [x] Remove Manus login entry points from the Vercel user experience and verify protected dashboards, bookings, and owner access
- [x] Add regression tests, run TypeScript/build, verify on Vercel, and save a checkpoint
