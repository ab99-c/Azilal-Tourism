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
- [ ] Checkpoint + push to GitHub
