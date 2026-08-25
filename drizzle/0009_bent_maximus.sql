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
--> statement-breakpoint
CREATE INDEX `idx_availability_item_range` ON `availability_blocks` (`type`,`itemId`,`startsAt`,`endsAt`);--> statement-breakpoint
CREATE INDEX `idx_availability_owner` ON `availability_blocks` (`ownerId`);