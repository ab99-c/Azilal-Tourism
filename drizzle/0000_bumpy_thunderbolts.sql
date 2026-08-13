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
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`image` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('car','hotel') NOT NULL,
	`itemId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`amenities` json,
	`image` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
