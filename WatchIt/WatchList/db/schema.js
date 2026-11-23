const { sql } = require("drizzle-orm");
const { sqliteTable, integer, text, real, primaryKey } = require("drizzle-orm/sqlite-core");



const createurTable = sqliteTable("Createur", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nom: text("nom").notNull(),
    type: text("type").notNull(), // "auteur" ou "studio"
    pays: text("pays").notNull(),
});

const franchiseTable = sqliteTable("Franchise", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nom: text("nom").notNull(),
    description: text("description"),
});

const genreTable = sqliteTable("Genre", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nom: text("nom").notNull().unique(),
});

const oeuvreTable = sqliteTable("Oeuvre", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    api_id: integer("api_id"), // id MyAnimeList (Tenrai), vide si l'oeuvre est ajoutée à la main
    mu_id: integer("mu_id"),   // id MangaUpdates, seulement pour les mangas / manhwas
    type: text("type").notNull(), // "anime", "manga" ou "manhwa"
    titre: text("titre").notNull(),
    description: text("description"),
    image_url: text("image_url"),
    nb_total: integer("nb_total"), // NULL = total inconnu (série en cours)
    statut: text("statut"),        // "en cours" ou "terminé"
    annee_sortie: integer("annee_sortie"),
    note_moyenne: real("note_moyenne"),
    mis_en_avant: integer("mis_en_avant").notNull().default(0), // compteur de votes "À la une"
    date_maj_api: integer("date_maj_api", { mode: "timestamp" }), // dernière actualisation via l'API
    // Pas de onDelete : on ne peut pas supprimer un créateur qui a encore des oeuvres
    createur_id: integer("createur_id").notNull().references(() => createurTable.id),
    // Une oeuvre peut ne pas avoir de franchise (one-shot)
    franchise_id: integer("franchise_id").references(() => franchiseTable.id, { onDelete: "set null" }),
});

const oeuvreGenreTable = sqliteTable("OeuvreGenre", {
    oeuvre_id: integer("oeuvre_id").notNull().references(() => oeuvreTable.id, { onDelete: "cascade" }),
    genre_id: integer("genre_id").notNull().references(() => genreTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.oeuvre_id, t.genre_id] })]);

const utilisateurTable = sqliteTable("Utilisateur", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pseudo: text("pseudo").notNull().unique(),
    email: text("email").notNull().unique(),
    mot_de_passe: text("mot_de_passe").notNull(), // voir services/motDePasse.js
    date_inscription: integer("date_inscription", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

const suiviTable = sqliteTable("Suivi", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    utilisateur_id: integer("utilisateur_id").notNull().references(() => utilisateurTable.id, { onDelete: "cascade" }),
    oeuvre_id: integer("oeuvre_id").notNull().references(() => oeuvreTable.id, { onDelete: "cascade" }),
    progression: integer("progression").notNull().default(0), // épisode ou chapitre atteint
    statut_lecture: text("statut_lecture").notNull().default("à commencer"), // "à commencer", "en cours", "terminé"
    note_perso: integer("note_perso"), // sur 10
    favori: integer("favori", { mode: "boolean" }).notNull().default(false),
    date_maj: integer("date_maj", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

module.exports = {
    createurTable,
    franchiseTable,
    genreTable,
    oeuvreTable,
    oeuvreGenreTable,
    utilisateurTable,
    suiviTable,
};
