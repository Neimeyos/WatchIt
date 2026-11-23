ALTER TABLE `tasks` RENAME TO `Oeuvre`;--> statement-breakpoint
CREATE TABLE `Createur` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL,
	`pays` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `Oeuvre` ADD `api_id` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `Oeuvre` ADD `titre` text NOT NULL;--> statement-breakpoint
ALTER TABLE `Oeuvre` ADD `description` text NOT NULL;--> statement-breakpoint
ALTER TABLE `Oeuvre` ADD `image_url` text NOT NULL;--> statement-breakpoint
ALTER TABLE `Oeuvre` ADD `note_moyenne` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `Oeuvre` ADD `createur_id` integer REFERENCES Createur(id);--> statement-breakpoint
ALTER TABLE `Oeuvre` DROP COLUMN `title`;--> statement-breakpoint
ALTER TABLE `Oeuvre` DROP COLUMN `is_done`;--> statement-breakpoint
ALTER TABLE `Oeuvre` DROP COLUMN `created_at`;