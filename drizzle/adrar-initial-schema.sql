Reading schema files:
/home/ubuntu/arkan-tourism/drizzle/schema.ts

CREATE TABLE `availability_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('hotel','car') NOT NULL,
	`itemId` int NOT NULL,
	`ownerId` int NOT NULL,
	`startsAt` date NOT NULL,
	`endsAt` date NOT NULL,
	`reason` varchar(240),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `availability_blocks_id` PRIMARY KEY(`id`)
);

CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('hotel','car') NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`guestName` varchar(255) NOT NULL,
	`guestEmail` varchar(320) NOT NULL,
	`guestPhone` varchar(50),
	`checkIn` date NOT NULL,
	`checkOut` date NOT NULL,
	`pickUpTime` time,
	`dropOffTime` time,
	`guests` int DEFAULT 1,
	`notes` text,
	`totalPrice` varchar(100),
	`paymentMethod` enum('pay_on_arrival') NOT NULL DEFAULT 'pay_on_arrival',
	`paymentStatus` enum('unpaid','paid') NOT NULL DEFAULT 'unpaid',
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`itemId` int NOT NULL DEFAULT 0,
	`ownerId` int NOT NULL DEFAULT 1,
	`guestUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `cafes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameFr` varchar(255) NOT NULL,
	`nameBer` varchar(255) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`descriptionFr` text,
	`descriptionBer` text,
	`locationAr` varchar(255),
	`locationEn` varchar(255),
	`locationFr` varchar(255),
	`locationBer` varchar(255),
	`rating` varchar(10) NOT NULL DEFAULT '4.5',
	`hours` varchar(50) NOT NULL DEFAULT '8:00 - 24:00',
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`image` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`ownerId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cafes_id` PRIMARY KEY(`id`)
);

CREATE TABLE `cars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameFr` varchar(255) NOT NULL,
	`nameBer` varchar(255) NOT NULL,
	`typeAr` varchar(255) NOT NULL,
	`typeEn` varchar(255) NOT NULL,
	`typeFr` varchar(255) NOT NULL,
	`typeBer` varchar(255) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`descriptionFr` text,
	`descriptionBer` text,
	`seats` varchar(50) NOT NULL DEFAULT '5 مقاعد',
	`fuel` varchar(50) NOT NULL DEFAULT 'ديزل',
	`price` varchar(100) NOT NULL,
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`image` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`ownerId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cars_id` PRIMARY KEY(`id`)
);

CREATE TABLE `email_auth_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('email_verification','password_reset') NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_auth_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_email_auth_tokens_hash` UNIQUE(`tokenHash`)
);

CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('car','hotel') NOT NULL,
	`itemId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_favorites_unique` UNIQUE(`userId`,`itemType`,`itemId`)
);

CREATE TABLE `hotels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameFr` varchar(255) NOT NULL,
	`nameBer` varchar(255) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`descriptionFr` text,
	`descriptionBer` text,
	`locationAr` varchar(255),
	`locationEn` varchar(255),
	`locationFr` varchar(255),
	`locationBer` varchar(255),
	`rating` varchar(10) NOT NULL DEFAULT '4.5',
	`priceAr` varchar(100) NOT NULL,
	`priceEn` varchar(100) NOT NULL,
	`priceFr` varchar(100) NOT NULL,
	`priceBer` varchar(100) NOT NULL,
	`whatsapp` varchar(50),
	`amenities` json,
	`image` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`ownerId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`)
);

CREATE TABLE `restaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameFr` varchar(255) NOT NULL,
	`nameBer` varchar(255) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`descriptionFr` text,
	`descriptionBer` text,
	`locationAr` varchar(255),
	`locationEn` varchar(255),
	`locationFr` varchar(255),
	`locationBer` varchar(255),
	`cuisineAr` varchar(255),
	`cuisineEn` varchar(255),
	`cuisineFr` varchar(255),
	`cuisineBer` varchar(255),
	`rating` varchar(10) NOT NULL DEFAULT '4.5',
	`hours` varchar(50) NOT NULL DEFAULT '9:00 - 23:00',
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`image` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`ownerId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`)
);

CREATE TABLE `safety_trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicToken` varchar(96) NOT NULL,
	`travelerName` varchar(255) NOT NULL,
	`travelerEmail` varchar(320) NOT NULL,
	`emergencyName` varchar(255),
	`emergencyPhone` varchar(50),
	`route` varchar(500) NOT NULL,
	`departureAt` timestamp NOT NULL,
	`expectedArrivalAt` timestamp NOT NULL,
	`consentAt` timestamp NOT NULL,
	`locationConsent` boolean NOT NULL DEFAULT false,
	`lastCheckInAt` timestamp,
	`lastLocationLat` varchar(32),
	`lastLocationLng` varchar(32),
	`lastLocationSharedAt` timestamp,
	`status` enum('active','safe','overdue','closed') NOT NULL DEFAULT 'active',
	`overdueNotifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `safety_trips_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_safety_trips_public_token` UNIQUE(`publicToken`)
);

CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`emailVerifiedAt` timestamp,
	`loginMethod` varchar(64),
	`passwordHash` varchar(255),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`providerType` enum('tourist','hotel_owner','restaurant_owner','activity_provider','guide','transport_provider') NOT NULL DEFAULT 'tourist',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);

CREATE INDEX `idx_availability_item_range` ON `availability_blocks` (`type`,`itemId`,`startsAt`,`endsAt`);
CREATE INDEX `idx_availability_owner` ON `availability_blocks` (`ownerId`);
CREATE INDEX `idx_bookings_type` ON `bookings` (`type`);
CREATE INDEX `idx_bookings_status` ON `bookings` (`status`);
CREATE INDEX `idx_bookings_guest_user` ON `bookings` (`guestUserId`);
CREATE INDEX `idx_cafes_isActive` ON `cafes` (`isActive`);
CREATE INDEX `idx_cafes_ownerId` ON `cafes` (`ownerId`);
CREATE INDEX `idx_cars_isActive` ON `cars` (`isActive`);
CREATE INDEX `idx_cars_ownerId` ON `cars` (`ownerId`);
CREATE INDEX `idx_email_auth_tokens_user_kind` ON `email_auth_tokens` (`userId`,`kind`);
CREATE INDEX `idx_email_auth_tokens_expiry` ON `email_auth_tokens` (`expiresAt`);
CREATE INDEX `idx_hotels_isActive` ON `hotels` (`isActive`);
CREATE INDEX `idx_hotels_ownerId` ON `hotels` (`ownerId`);
CREATE INDEX `idx_restaurants_isActive` ON `restaurants` (`isActive`);
CREATE INDEX `idx_restaurants_ownerId` ON `restaurants` (`ownerId`);
CREATE INDEX `idx_safety_trips_status` ON `safety_trips` (`status`);
CREATE INDEX `idx_safety_trips_expected_arrival` ON `safety_trips` (`expectedArrivalAt`);
