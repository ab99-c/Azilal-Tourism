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
	CONSTRAINT `safety_trips_publicToken_unique` UNIQUE(`publicToken`),
	CONSTRAINT `idx_safety_trips_public_token` UNIQUE(`publicToken`)
);
--> statement-breakpoint
CREATE INDEX `idx_safety_trips_status` ON `safety_trips` (`status`);--> statement-breakpoint
CREATE INDEX `idx_safety_trips_expected_arrival` ON `safety_trips` (`expectedArrivalAt`);