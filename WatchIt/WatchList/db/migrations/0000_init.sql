CREATE TABLE `Createur` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL,
	`type` text NOT NULL,
	`pays` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Franchise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `Genre` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Genre_nom_unique` ON `Genre` (`nom`);--> statement-breakpoint
CREATE TABLE `Oeuvre` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`api_id` integer,
	`mu_id` integer,
	`type` text NOT NULL,
	`titre` text NOT NULL,
	`description` text,
	`image_url` text,
	`nb_total` integer,
	`statut` text,
	`annee_sortie` integer,
	`note_moyenne` real,
	`mis_en_avant` integer DEFAULT 0 NOT NULL,
	`date_maj_api` integer,
	`createur_id` integer NOT NULL,
	`franchise_id` integer,
	FOREIGN KEY (`createur_id`) REFERENCES `Createur`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`franchise_id`) REFERENCES `Franchise`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `OeuvreGenre` (
	`oeuvre_id` integer NOT NULL,
	`genre_id` integer NOT NULL,
	PRIMARY KEY(`oeuvre_id`, `genre_id`),
	FOREIGN KEY (`oeuvre_id`) REFERENCES `Oeuvre`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genre_id`) REFERENCES `Genre`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Utilisateur` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pseudo` text NOT NULL,
	`email` text NOT NULL,
	`mot_de_passe` text NOT NULL,
	`date_inscription` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Utilisateur_pseudo_unique` ON `Utilisateur` (`pseudo`);--> statement-breakpoint
CREATE UNIQUE INDEX `Utilisateur_email_unique` ON `Utilisateur` (`email`);--> statement-breakpoint
CREATE TABLE `Suivi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`utilisateur_id` integer NOT NULL,
	`oeuvre_id` integer NOT NULL,
	`progression` integer DEFAULT 0 NOT NULL,
	`statut_lecture` text DEFAULT 'à commencer' NOT NULL,
	`note_perso` integer,
	`favori` integer DEFAULT false NOT NULL,
	`date_maj` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `Utilisateur`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`oeuvre_id`) REFERENCES `Oeuvre`(`id`) ON UPDATE no action ON DELETE cascade
);
