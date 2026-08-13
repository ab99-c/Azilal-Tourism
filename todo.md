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

- [ ] Audit all text strings (LanguageContext, components) for ADRAR/ادرار used as place/region name
- [ ] Replace place references with Azilal/أزيلال in all 4 languages
- [ ] Keep ADRAR only as brand (logo, hero title, footer brand line)
- [ ] Verify visually, checkpoint, push to GitHub
