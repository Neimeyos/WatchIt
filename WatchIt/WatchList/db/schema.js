const { sql } = require("drizzle-orm");
const { sqliteTable, integer, text } = require("drizzle-orm/sqlite-core");

const tasksTable = sqliteTable("tasks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    isDone: integer("is_done", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
});

module.exports = { tasksTable };