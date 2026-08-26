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
--> statement-breakpoint
CREATE INDEX `idx_email_auth_tokens_user_kind` ON `email_auth_tokens` (`userId`,`kind`);--> statement-breakpoint
CREATE INDEX `idx_email_auth_tokens_expiry` ON `email_auth_tokens` (`expiresAt`);