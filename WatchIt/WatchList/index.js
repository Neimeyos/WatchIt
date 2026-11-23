const express = require("express");
const path = require("path");
const { sql, desc, gt, eq } = require("drizzle-orm");
const db = require("./db");
const { oeuvreTable } = require("./db/schema");
const seed = require("./db/seed");
const { infosAJour } = require("./services/api");

const app = express();
const PORT = process.env.PORT || 8080;

// Récupère les données des formulaires (req.body) et du JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Fichiers CSS / JS / images communs : public/css/style.css est servi à l'adresse /css/style.css
app.use(express.static(path.join(__dirname, "public")));

const page = (dossier, fichier) => path.join(__dirname, "pages", dossier, fichier);

app.get("/", (req, res) => {
    res.sendFile(page("accueil", "Accueil.html"));
});

// Page d'une oeuvre : /oeuvre?id=3 (le contenu sera chargé par la page elle-même)
app.get("/oeuvre", (req, res) => {
    res.sendFile(page("Oeuvre", "Oeuvre.html"));
});

// Données de la page d'accueil : lues dans la base, jamais dans l'API
app.get("/api/accueil", async (req, res) => {
    const aLaUne = await db
        .select({
            id: oeuvreTable.id,
            titre: oeuvreTable.titre,
            type: oeuvreTable.type,
            image_url: oeuvreTable.image_url,
            mis_en_avant: oeuvreTable.mis_en_avant,
        })
        .from(oeuvreTable)
        .where(gt(oeuvreTable.mis_en_avant, 0))
        .orderBy(desc(oeuvreTable.mis_en_avant))
        .limit(5);
    res.json({ aLaUne });
});

// Bouton "Actualiser" d'une oeuvre : met à jour total, statut et note depuis l'API
// Si l'API ne répond pas, on renvoie une erreur et la base n'est pas modifiée
app.post("/api/oeuvres/:id/actualiser", async (req, res) => {
    const [oeuvre] = await db.select().from(oeuvreTable).where(eq(oeuvreTable.id, Number(req.params.id)));
    if (!oeuvre) return res.status(404).json({ erreur: "Oeuvre introuvable" });
    if (!oeuvre.api_id) return res.status(400).json({ erreur: "Cette oeuvre n'est pas liée à l'API" });

    let resultat;
    try {
        resultat = await infosAJour(oeuvre);
    } catch (erreur) {
        console.error(erreur);
        return res.status(502).json({ erreur: "L'API ne répond pas, réessaie plus tard.", oeuvre });
    }

    const [aJour] = await db.update(oeuvreTable).set(resultat.maj).where(eq(oeuvreTable.id, oeuvre.id)).returning();
    res.json({ oeuvre: aJour, avertissement: resultat.avertissement });
});

async function demarrer() {
    await db.run(sql`PRAGMA foreign_keys = ON`);
    await seed();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

demarrer();
