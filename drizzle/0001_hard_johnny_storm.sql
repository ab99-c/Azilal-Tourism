ALTER TABLE `favorites` ADD CONSTRAINT `idx_favorites_unique` UNIQUE(`userId`,`itemType`,`itemId`);--> statement-breakpoint
CREATE INDEX `idx_bookings_type` ON `bookings` (`type`);--> statement-breakpoint
CREATE INDEX `idx_bookings_status` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `idx_cars_isActive` ON `cars` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_hotels_isActive` ON `hotels` (`isActive`);