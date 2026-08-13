# Full-Stack Migration Notes - ADRAR Tourism

## Status
- Project upgraded to full-stack (db, server, user features)
- Database tables created: cars, hotels, bookings, favorites
- Default data seeded into database
- CarRentalSection updated to use tRPC (trpc.cars.list)
- HotelsSection updated to use tRPC (trpc.hotels.list)
- BookingModal updated to use tRPC mutation (trpc.bookings.create)
- STILL NEEDS: CarOwnerDashboard update to use tRPC mutations

## Key Files
- server/db.ts - query helpers (getAllCars, getAllHotels, etc.)
- server/routers.ts - tRPC routers (cars, hotels, bookings, favorites)
- drizzle/schema.ts - database schema
- client/src/components/CarRentalSection.tsx - uses tRPC ✅
- client/src/components/HotelsSection.tsx - uses tRPC ✅
- client/src/components/BookingModal.tsx - uses tRPC mutation ✅
- client/src/components/CarOwnerDashboard.tsx - STILL uses localStorage carStore ❌

## CarOwnerDashboard TODO
- Replace localStorage imports with trpc hooks
- Replace getCars() with trpc.cars.list.useQuery()
- Replace addCar() with trpc.cars.create.useMutation()
- Replace updateCar() with trpc.cars.update.useMutation()
- Replace deleteCar() with trpc.cars.delete.useMutation()
- Replace resetCars() with seed data or remove

## Database Schema (drizzle/schema.ts)
- cars: id, nameAr/En/Fr/Ber, typeAr/En/Fr/Ber, descriptionAr/En/Fr/Ber, seats, fuel, price, phone, image, isActive, createdAt, updatedAt
- hotels: id, nameAr/En/Fr/Ber, descriptionAr/En/Fr/Ber, locationAr/En/Fr/Ber, rating, priceAr/En/Fr/Ber, amenities(JSON), image, isActive, createdAt, updatedAt
- bookings: id, type, itemName, guestName, guestEmail, guestPhone, checkIn, checkOut, pickUpTime, dropOffTime, guests, notes, totalPrice, status, createdAt
- favorites: id, userId, itemType, itemId, createdAt
