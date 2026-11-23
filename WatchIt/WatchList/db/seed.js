const { count } = require("drizzle-orm");
const db = require("./index");
const {
    createurTable,
    franchiseTable,
    genreTable,
    oeuvreTable,
    oeuvreGenreTable,
    utilisateurTable,
    suiviTable,
} = require("./schema");
const { hacherMotDePasse } = require("../services/motDePasse");

// La seed n'appelle aucune API : tout est écrit ici (données recopiées une fois depuis Tenrai).
// Elle ne s'exécute que si la base est vide, donc pas de doublons si on relance le serveur.

const createurs = [
    { id: 1, nom: "Eiichirō Oda", type: "auteur", pays: "Japon" },
    { id: 2, nom: "Masashi Kishimoto", type: "auteur", pays: "Japon" },
    { id: 3, nom: "Hajime Isayama", type: "auteur", pays: "Japon" },
    { id: 4, nom: "Chugong", type: "auteur", pays: "Corée du Sud" },
    { id: 5, nom: "SIU", type: "auteur", pays: "Corée du Sud" },
    { id: 6, nom: "Toei Animation", type: "studio", pays: "Japon" },
    { id: 7, nom: "Studio Pierrot", type: "studio", pays: "Japon" },
    { id: 8, nom: "Wit Studio", type: "studio", pays: "Japon" },
    { id: 9, nom: "A-1 Pictures", type: "studio", pays: "Japon" },
    { id: 10, nom: "Telecom Animation Film", type: "studio", pays: "Japon" },
];

const franchises = [
    { id: 1, nom: "One Piece", description: "Les aventures de Luffy et de son équipage à la recherche du trésor légendaire One Piece." },
    { id: 2, nom: "Naruto", description: "Le parcours de Naruto Uzumaki, jeune ninja qui rêve de devenir Hokage." },
    { id: 3, nom: "L'Attaque des Titans", description: "L'humanité se bat pour survivre face aux Titans, cachée derrière d'immenses murs." },
    { id: 4, nom: "Solo Leveling", description: "Sung Jin-Woo, le chasseur le plus faible du monde, devient le seul à pouvoir monter de niveau." },
    { id: 5, nom: "Tower of God", description: "Bam entre dans une Tour mystérieuse pour retrouver Rachel, la seule personne qu'il ait connue." },
];

const genres = [
    { id: 1, nom: "Action" },
    { id: 2, nom: "Aventure" },
    { id: 3, nom: "Fantasy" },
    { id: 4, nom: "Drame" },
    { id: 5, nom: "Comédie" },
    { id: 6, nom: "Mystère" },
    { id: 7, nom: "Surnaturel" },
    { id: 8, nom: "Horreur" },
];

// mis_en_avant > 0 pour 4 oeuvres : ce sont elles qui apparaissent dans "À la une".
// nb_total à null = total inconnu (série en cours) : One Piece et Tower of God (manhwa).
const oeuvres = [
    {
        id: 1, api_id: 13, type: "manga", titre: "One Piece",
        description: "Gol D. Roger, le roi des pirates, révèle avant son exécution l'existence d'un immense trésor, le One Piece. Des années plus tard, Monkey D. Luffy prend la mer pour le trouver.",
        image_url: "https://cdn.myanimelist.net/images/manga/2/253146l.jpg",
        nb_total: null, statut: "en cours", annee_sortie: 1997, note_moyenne: 9.2, mis_en_avant: 5,
        createur_id: 1, franchise_id: 1,
    },
    {
        id: 2, api_id: 21, type: "anime", titre: "One Piece",
        description: "Monkey D. Luffy, un garçon au corps élastique, forme un équipage pour devenir le roi des pirates et trouver le One Piece.",
        image_url: "https://cdn.myanimelist.net/images/anime/1244/138851l.jpg",
        nb_total: null, statut: "en cours", annee_sortie: 1999, note_moyenne: 8.72, mis_en_avant: 3,
        createur_id: 6, franchise_id: 1,
    },
    {
        id: 3, api_id: 11, type: "manga", titre: "Naruto",
        description: "Rejeté par son village depuis sa naissance, Naruto Uzumaki s'entraîne sans relâche pour devenir Hokage et gagner le respect de tous.",
        image_url: "https://cdn.myanimelist.net/images/manga/3/249658l.jpg",
        nb_total: 700, statut: "terminé", annee_sortie: 1999, note_moyenne: 8.09, mis_en_avant: 4,
        createur_id: 2, franchise_id: 2,
    },
    {
        id: 4, api_id: 20, type: "anime", titre: "Naruto",
        description: "Douze ans après l'attaque du démon renard sur le village de Konoha, le jeune Naruto, qui porte la bête en lui, rêve de devenir le plus grand ninja.",
        image_url: "https://cdn.myanimelist.net/images/anime/1141/142503l.jpg",
        nb_total: 220, statut: "terminé", annee_sortie: 2002, note_moyenne: 8.03, mis_en_avant: 0,
        createur_id: 7, franchise_id: 2,
    },
    {
        id: 5, api_id: 1735, type: "anime", titre: "Naruto Shippuden",
        description: "Deux ans et demi plus tard, Naruto revient à Konoha alors que l'organisation Akatsuki se rapproche de son but.",
        image_url: "https://cdn.myanimelist.net/images/anime/1565/111305l.jpg",
        nb_total: 500, statut: "terminé", annee_sortie: 2007, note_moyenne: 8.29, mis_en_avant: 0,
        createur_id: 7, franchise_id: 2,
    },
    {
        id: 6, api_id: 23390, type: "manga", titre: "L'Attaque des Titans",
        description: "Des géants dévoreurs d'hommes ont presque exterminé l'humanité. Les survivants vivent derrière des murs, jusqu'au jour où un Titan colossal les franchit.",
        image_url: "https://cdn.myanimelist.net/images/manga/2/37846l.jpg",
        nb_total: 141, statut: "terminé", annee_sortie: 2009, note_moyenne: 8.56, mis_en_avant: 2,
        createur_id: 3, franchise_id: 3,
    },
    {
        id: 7, api_id: 16498, type: "anime", titre: "L'Attaque des Titans",
        description: "Après la destruction de son village par les Titans, Eren Jäger jure de tous les éliminer et rejoint l'armée.",
        image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
        nb_total: 25, statut: "terminé", annee_sortie: 2013, note_moyenne: 8.58, mis_en_avant: 0,
        createur_id: 8, franchise_id: 3,
    },
    {
        id: 8, api_id: 121496, type: "manhwa", titre: "Solo Leveling",
        description: "Des portails vers un monde de monstres sont apparus. Sung Jin-Woo, le chasseur le plus faible, reçoit un pouvoir unique : monter de niveau.",
        image_url: "https://cdn.myanimelist.net/images/manga/3/222295l.jpg",
        nb_total: 201, statut: "terminé", annee_sortie: 2018, note_moyenne: 8.54, mis_en_avant: 4,
        createur_id: 4, franchise_id: 4,
    },
    {
        id: 9, api_id: 52299, type: "anime", titre: "Solo Leveling",
        description: "Après avoir survécu de justesse à un donjon mortel, Sung Jin-Woo découvre un mystérieux système qui le rend plus fort chaque jour.",
        image_url: "https://cdn.myanimelist.net/images/anime/1801/142390l.jpg",
        nb_total: 12, statut: "terminé", annee_sortie: 2024, note_moyenne: 8.12, mis_en_avant: 0,
        createur_id: 9, franchise_id: 4,
    },
    {
        id: 10, api_id: 58567, type: "anime", titre: "Solo Leveling Saison 2 : Arise from the Shadow",
        description: "Jin-Woo devient de plus en plus puissant, mais garder ses pouvoirs secrets devient difficile face aux incidents qui se multiplient.",
        image_url: "https://cdn.myanimelist.net/images/anime/1448/147351l.jpg",
        nb_total: 13, statut: "terminé", annee_sortie: 2025, note_moyenne: 8.49, mis_en_avant: 0,
        createur_id: 9, franchise_id: 4,
    },
    {
        id: 11, api_id: 122663, type: "manhwa", titre: "Tower of God",
        description: "Bam a toujours été seul jusqu'à sa rencontre avec Rachel. Quand elle entre dans la Tour, il la suit pour la retrouver.",
        image_url: "https://cdn.myanimelist.net/images/manga/2/223694l.jpg",
        nb_total: null, statut: "en cours", annee_sortie: 2010, note_moyenne: 8.33, mis_en_avant: 0,
        createur_id: 5, franchise_id: 5,
    },
    {
        id: 12, api_id: 40221, type: "anime", titre: "Tower of God",
        description: "Bam pénètre dans la Tour et doit réussir une série d'épreuves dangereuses pour monter les étages et retrouver Rachel.",
        image_url: "https://cdn.myanimelist.net/images/anime/1702/106229l.jpg",
        nb_total: 13, statut: "terminé", annee_sortie: 2020, note_moyenne: 7.55, mis_en_avant: 0,
        createur_id: 10, franchise_id: 5,
    },
];

// [oeuvre_id, [genre_ids]]
const genresParOeuvre = [
    [1, [1, 2, 3, 5]], [2, [1, 2, 3, 5]],
    [3, [1, 2, 3, 5]], [4, [1, 2, 3, 5]], [5, [1, 2, 3, 4]],
    [6, [1, 4, 6, 8]], [7, [1, 4, 6, 8]],
    [8, [1, 2, 3, 7]], [9, [1, 2, 3, 7]], [10, [1, 2, 3, 7]],
    [11, [1, 2, 3, 4, 6]], [12, [1, 2, 3, 4, 6]],
];

// Mot de passe commun des comptes de test : voir le README.
const MOT_DE_PASSE_TEST = "watchit123";
const pseudos = ["luffy_fan", "hokage", "eren_j", "hunter_s", "bam25"];

// [utilisateur_id, oeuvre_id, progression, statut_lecture, note_perso, favori]
const suivis = [
    [1, 1, 1120, "en cours", 10, true],
    [1, 2, 1100, "en cours", 9, false],
    [1, 8, 201, "terminé", 9, true],
    [2, 3, 700, "terminé", 9, true],
    [2, 4, 220, "terminé", 8, false],
    [2, 5, 250, "en cours", null, false],
    [3, 6, 141, "terminé", 10, true],
    [3, 7, 25, "terminé", 9, false],
    [3, 11, 400, "en cours", null, false],
    [4, 8, 120, "en cours", null, false],
    [4, 9, 12, "terminé", 8, true],
    [4, 10, 0, "à commencer", null, false],
    [5, 11, 650, "en cours", 9, true],
    [5, 12, 13, "terminé", 7, false],
    [5, 1, 0, "à commencer", null, false],
];

async function seed() {
    const [{ n }] = await db.select({ n: count() }).from(oeuvreTable);
    if (n > 0) {
        console.log("Seed : la base contient déjà des données, rien à faire.");
        return;
    }

    // db.batch exécute tout d'un coup : si une insertion échoue, rien n'est enregistré.
    // L'ordre compte à cause des clés étrangères.
    await db.batch([
        db.insert(createurTable).values(createurs),
        db.insert(franchiseTable).values(franchises),
        db.insert(genreTable).values(genres),
        db.insert(oeuvreTable).values(oeuvres),
        db.insert(oeuvreGenreTable).values(
            genresParOeuvre.flatMap(([oeuvre_id, ids]) => ids.map((genre_id) => ({ oeuvre_id, genre_id })))
        ),
        db.insert(utilisateurTable).values(
            pseudos.map((pseudo, i) => ({
                id: i + 1,
                pseudo,
                email: `${pseudo}@example.com`,
                mot_de_passe: hacherMotDePasse(MOT_DE_PASSE_TEST),
            }))
        ),
        db.insert(suiviTable).values(
            suivis.map(([utilisateur_id, oeuvre_id, progression, statut_lecture, note_perso, favori]) => ({
                utilisateur_id, oeuvre_id, progression, statut_lecture, note_perso, favori,
            }))
        ),
    ]);

    console.log("Seed terminée : 10 créateurs, 5 franchises, 8 genres, 12 oeuvres, 5 utilisateurs, 15 suivis.");
}

module.exports = seed;
