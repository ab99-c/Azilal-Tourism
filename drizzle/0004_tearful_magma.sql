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
	`image` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`ownerId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cafes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`image` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`ownerId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `guestUserId` int;--> statement-breakpoint
CREATE INDEX `idx_cafes_isActive` ON `cafes` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_cafes_ownerId` ON `cafes` (`ownerId`);--> statement-breakpoint
CREATE INDEX `idx_restaurants_isActive` ON `restaurants` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_restaurants_ownerId` ON `restaurants` (`ownerId`);--> statement-breakpoint
CREATE INDEX `idx_bookings_guest_user` ON `bookings` (`guestUserId`);