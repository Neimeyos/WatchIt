// Appels aux API externes. Seul le serveur les utilise : les pages lisent la base de données

const TENRAI = "https://api.tenrai.org/v1";
const MANGAUPDATES = "https://api.mangaupdates.com/v1";

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// fetch + JSON, avec une limite de 10 s et une erreur claire si l'API répond mal
async function getJson(url, options = {}) {
    const rep = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
    if (!rep.ok) throw new Error(`${url} a répondu ${rep.status}`);
    return rep.json();
}

// Traduit le statut de l'API dans celui de notre base
function traduireStatut(statut) {
    if (["Finished Airing", "Finished", "Discontinued"].includes(statut)) return "terminé";
    if (["Not yet aired", "Not yet published"].includes(statut)) return "à venir";
    return "en cours"; // Currently Airing, Publishing, On Hiatus
}

// Pour un animé en cours : numéro du dernier épisode sorti (2 requêtes)
async function dernierEpisode(malId) {
    const page1 = await getJson(`${TENRAI}/anime/${malId}/episodes`);
    const derniere = page1.pagination.last_visible_page;
    let episodes = page1.data;
    if (derniere > 1) {
        await pause(400); // on reste sous la limite de requêtes
        episodes = (await getJson(`${TENRAI}/anime/${malId}/episodes?page=${derniere}`)).data;
    }
    return episodes.length > 0 ? episodes[episodes.length - 1].mal_id : null;
}

// Pour un manga / manhwa en cours : dernier chapitre sorti d'après MangaUpdates
// On cherche par titre la première fois, puis on réutilise mu_id
async function dernierChapitre(titre, muId) {
    if (!muId) {
        const recherche = await getJson(`${MANGAUPDATES}/series/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: titre, perpage: 1 }),
        });
        if (recherche.results.length === 0) return { muId: null, chapitre: null };
        muId = recherche.results[0].record.series_id;
    }
    const serie = await getJson(`${MANGAUPDATES}/series/${muId}`);
    return { muId, chapitre: serie.latest_chapter ?? null };
}

// Récupère les infos à jour d'une oeuvre. Renvoie seulement les champs à modifier dans la base
// Si Tenrai ne répond pas, l'erreur remonte et la route garde ce qu'il y a déjà dans la base
async function infosAJour(oeuvre) {
    const estAnime = oeuvre.type === "anime";
    const { data } = await getJson(`${TENRAI}/${estAnime ? "anime" : "manga"}/${oeuvre.api_id}`);

    const maj = {
        statut: traduireStatut(data.status),
        note_moyenne: data.score ?? oeuvre.note_moyenne,
        nb_total: estAnime ? data.episodes : data.chapters,
        date_maj_api: new Date(),
    };

    // Total inconnu (série en cours) : on regarde ce qui est déjà sorti
    // Une panne ici n'est pas grave, on garde l'ancien total
    let avertissement = null;
    if (maj.nb_total === null) {
        try {
            if (estAnime) {
                await pause(400);
                maj.nb_total = await dernierEpisode(oeuvre.api_id);
            } else {
                const { muId, chapitre } = await dernierChapitre(oeuvre.titre, oeuvre.mu_id);
                maj.mu_id = muId;
                maj.nb_total = chapitre;
            }
        } catch (erreur) {
            console.error(erreur);
            avertissement = estAnime
                ? "Liste des épisodes indisponible, total non mis à jour."
                : "MangaUpdates ne répond pas, dernier chapitre non mis à jour.";
        }
        if (maj.nb_total === null) maj.nb_total = oeuvre.nb_total; // on garde ce qu'on avait
    }

    return { maj, avertissement };
}

module.exports = { infosAJour };
