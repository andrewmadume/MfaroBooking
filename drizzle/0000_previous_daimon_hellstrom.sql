CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`business` text NOT NULL,
	`branch` text NOT NULL,
	`customer` text NOT NULL,
	`email` text NOT NULL,
	`service` text NOT NULL,
	`staff` text NOT NULL,
	`resource` text NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`status` text NOT NULL,
	`amount` integer NOT NULL,
	`paid` integer DEFAULT 0 NOT NULL,
	`data` text NOT NULL,
	`retry` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`business`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `booking_retry` ON `bookings` (`business`,`retry`);--> statement-breakpoint
CREATE INDEX `booking_overlap` ON `bookings` (`business`,`start`,`end`);--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`industry` text NOT NULL,
	`settings` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `delivery` (
	`id` text PRIMARY KEY NOT NULL,
	`business` text NOT NULL,
	`booking` text NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`due` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`content` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `delivery_once` ON `delivery` (`booking`,`kind`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`business` text NOT NULL,
	`actor` text NOT NULL,
	`kind` text NOT NULL,
	`detail` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`business` text NOT NULL,
	`user` text NOT NULL,
	`role` text NOT NULL,
	`staff` text,
	`branch` text,
	FOREIGN KEY (`business`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `membership` ON `members` (`business`,`user`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`business` text NOT NULL,
	`booking` text NOT NULL,
	`amount` integer NOT NULL,
	`method` text NOT NULL,
	`retry` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_retry` ON `payments` (`business`,`retry`);--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`business` text NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	FOREIGN KEY (`business`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `records_tenant` ON `records` (`business`,`kind`);