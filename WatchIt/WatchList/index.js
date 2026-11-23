const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const { tasksTable } = require("./db/schema");

const app = express();
const PORT = 3008;

// On définit un middleware pour parser les données des requêtes entrantes.
// Cela permet de récupérer les données envoyées via des formulaires et les rendre disponibles dans req.body.
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, index.js));
});

app.get("/tasks", async (req, res) => {
    const tasks = await db.select().from(tasksTable);
    res.json(tasks);
});

app.post("/tasks", async (req, res) => {
    const { title } = req.body;
    try {
        await db.insert(tasksTable).values({ title }); // Ici on ne stock pas le retour de la requête, mais on attend quand même son exécution
        res.status(201).redirect("/tasks"); // On redirige vers la page des tâches
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Task creation failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});