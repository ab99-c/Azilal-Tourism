UPDATE `contact_messages` SET `status` = 'new' WHERE `status` IN ('unread', 'read');--> statement-breakpoint
ALTER TABLE `contact_messages` MODIFY COLUMN `status` enum('new','replied') NOT NULL DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `reply` text;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `repliedAt` timestamp;