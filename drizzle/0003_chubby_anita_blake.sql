ALTER TABLE `bookings` ADD `itemId` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `ownerId` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `ownerId` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `hotels` ADD `ownerId` int DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_cars_ownerId` ON `cars` (`ownerId`);--> statement-breakpoint
CREATE INDEX `idx_hotels_ownerId` ON `hotels` (`ownerId`);