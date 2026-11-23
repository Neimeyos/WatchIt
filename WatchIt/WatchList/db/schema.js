const { sql } = require("drizzle-orm");
const { sqliteTable, integer, text } = require("drizzle-orm/sqlite-core");

const oeuvreTable = sqliteTable("Oeuvre", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    api_id : integer("api_id").notNull(),
    mu_id : integer("api_id").notNull(),
    titre: text("titre").notNull(),
    description: text("description").notNull(),
    image_url: text("image_url").notNull(),
    annee_sortie : date("annee_sortie").notNull(),
    note_moyenne : integer("note_moyenne").notNull(),
    createur_id : integer("createur_id").references(() => createurTable.id)
});

const createurTable = sqliteTable("Createur", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nom: text("nom").notNull(),
    pays: text("pays").notNull(),
});

module.exports = { tasksTable };