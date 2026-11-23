async function chargerAccueil() {
    const zone = document.getElementById("a-la-une");
    try {
        const rep = await fetch("/api/accueil");
        if (!rep.ok) throw new Error(rep.status);
        const { aLaUne } = await rep.json();

        zone.innerHTML = "";
        if (aLaUne.length === 0) {
            zone.innerHTML = '<p class="message">Aucune oeuvre mise en avant pour le moment.</p>';
            return;
        }

        for (const oeuvre of aLaUne) {
            // On crée les éléments un par un (textContent) : un titre ne peut pas injecter de HTML.
            const carte = document.createElement("a");
            carte.className = "carte";
            carte.href = `/oeuvre?id=${oeuvre.id}`;

            const img = document.createElement("img");
            img.src = oeuvre.image_url;
            img.alt = oeuvre.titre;

            const titre = document.createElement("h3");
            titre.textContent = oeuvre.titre;

            const infos = document.createElement("p");
            infos.textContent = `${oeuvre.type} · ${oeuvre.mis_en_avant} vote(s)`;

            carte.append(img, titre, infos);
            zone.append(carte);
        }
    } catch (erreur) {
        zone.innerHTML = '<p class="message">Impossible de charger les oeuvres, réessaie plus tard.</p>';
    }
}

chargerAccueil();
