CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`senderName` varchar(120),
	`senderEmail` varchar(320),
	`message` text NOT NULL,
	`status` enum('unread','read','replied') NOT NULL DEFAULT 'unread',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_contact_messages_status` ON `contact_messages` (`status`);--> statement-breakpoint
CREATE INDEX `idx_contact_messages_created_at` ON `contact_messages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_contact_messages_user` ON `contact_messages` (`userId`);