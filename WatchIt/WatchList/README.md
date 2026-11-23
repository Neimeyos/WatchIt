# WatchIt

## Lancer le site

- npm install
- npx drizzle-kit migrate
- npm start


Puis ouvrir http://localhost:8080. Au premier démarrage, la seed (`db/seed.js`) remplit la base si elle est vide.
Pour changer de port : `PORT=3000 npm start` (ou `$env:PORT=3000; npm start` sous PowerShell).

Pour repartir d'une base neuve : arrêter le serveur, supprimer `db/database.db`, relancer `npx drizzle-kit migrate` puis `npm start`.

## Comptes de test (créés par la seed)

Mot de passe commun : `watchit123`

    Pseudo | Email 

 luffy_fan | luffy_fan@example.com 
    hokage | hokage@example.com 
    eren_j | eren_j@example.com 
  hunter_s | hunter_s@example.com 
     bam25 | bam25@example.com 


Les mots de passe sont stockés hachés (voir `services/motDePasse.js`, fonction `verifierMotDePasse` pour la connexion).

## API

- `GET /api/accueil` : oeuvres "À la une" (lues dans la base).
- `POST /api/oeuvres/:id/actualiser` : met à jour total, statut et note depuis Tenrai (et MangaUpdates pour le dernier chapitre d'un manga en cours). Si l'API ne répond pas, la base n'est pas modifiée.
