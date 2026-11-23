## Le pitch
Notre site permet de suivre les animés, mangas et manhwas que l'on est en train de lire ou de regarder.
Après s'être connecté, l'utilisateur ajoute ses oeuvres et note l'épisode ou le chapitre où il s'est arrêté.
Le nombre total d'épisodes ou de chapitres peut être récupéré avec les API publiques Jikan et MangaUpdates (pas besoin de clé).
Les oeuvres sont rangées par franchise (par exemple le manhwa et l'animé Solo Leveling sont dans la même franchise).
Le site propose aussi des recommandations selon les genres et les franchises des oeuvres mises en favori.

## Groupe

Ethan SOULLIAGE, Enzo BONY et Victor ROMEAS

## La stack technique
Node.js + Express, SQLite, HTML/CSS/JS : ce sont les technos vues en cours et on a déjà travaillé avec.
SQLite tient dans un fichier, donc rien à installer à côté.
API : Tenrai (https://tenrai.org), une API non officielle de MyAnimeList, gratuite et sans clé. Elle a les animés et les mangas, manhwas compris.
API 2 : MangaUpdates (https://api.mangaupdates.com/v1), gratuite et sans clé pour la lecture. On l'utilise seulement pour les mangas et manhwas en cours, parce qu'elle donne le dernier chapitre sorti alors que Jikan ne le donne pas.

## Les entités
- oeuvre : id, api_id (id MyAnimeList), mu_id (id MangaUpdates), type (anime / manga / manhwa), titre, description, image_url, nb_total, statut, annee_sortie, note_moyenne, mis_en_avant, createur_id, franchise_id
- createur : id, nom, type (auteur / studio), pays
- franchise : id, nom, description
- genre : id, nom
- utilisateur : id, pseudo, email, mot_de_passe, date_inscription
- suivi : id, utilisateur_id, oeuvre_id, progression, statut_lecture, note_perso, favori, date_maj
- oeuvre_genre : oeuvre_id, genre_id

## Les relations
- 1-N : un créateur a plusieurs oeuvres, une oeuvre a un seul créateur
- 1-N : une franchise a plusieurs oeuvres, une oeuvre est dans une franchise (ou aucune)
- N-N : oeuvre <-> genre (table oeuvre_genre)
- N-N en plus : utilisateur <-> oeuvre via suivi

## Entités A et B
- A : oeuvre (création, liste, détail, modification avec créateur, franchise et genres, suppression)
- B : créateur (création, liste, détail avec ses oeuvres, modification, suppression)

## Pages de détail
- Page d'un créateur : ses oeuvres.
- Page d'une franchise : ses oeuvres.
- Page d'un genre : les oeuvres de ce genre.
- Page d'une oeuvre : son créateur, sa franchise et ses genres, avec un lien vers chacun.

On ajoute ou retire les genres d'une oeuvre dans son formulaire de modification (cases à cocher). Le changement se voit sur la page de l'oeuvre et sur la page du genre.
Partout sur le site, cliquer sur une oeuvre, un créateur, une franchise ou un genre amène sur sa page.

## Mise en avant
Le champ mis_en_avant est un réglage global : c'est le même pour tout le monde. Ça n'a rien à voir avec le favori, qui est propre à chaque utilisateur (dans la table suivi). C'est un compteur sur chaque oeuvre, et les plus votées sont affichées sur la page d'accueil.

- Sur l'accueil, il y a une section "À la une" avec les oeuvres mises en avant (image + titre, cliquable).
- Sur la page d'une oeuvre, un utilisateur connecté a un bouton "Mettre en avant" ou "Retirer de la une" selon l'état actuel.

## Seed
Le seed n'appelle aucune API, toutes les données sont écrites directement dans le fichier. Comme ça le site se lance même si Jikan ou MangaUpdates ne marchent pas ce jour-là.
Il se lance au démarrage du serveur et seulement si la base est vide, donc pas de doublons si on relance.

Ce qu'il contient :
- 10 créateurs : Eiichirō Oda, Masashi Kishimoto, Hajime Isayama, Chugong, SIU (auteurs) et Toei Animation, Studio Pierrot, Wit Studio, A-1 Pictures, Telecom Animation Film (studios)
- 5 franchises : One Piece, Naruto, L'Attaque des Titans, Solo Leveling, Tower of God
- 8 genres : Action, Aventure, Fantasy, Drame, Comédie, Mystère, Surnaturel, Horreur
- 12 oeuvres (le manga ou manhwa et l'animé de chaque franchise, etc.), dont 4 mises en avant et au moins une sans nombre total connu
- 5 utilisateurs de test (identifiants dans le README)
- 15 suivis, dont quelques favoris

## Les API
Les API servent juste à remplir ou mettre à jour une oeuvre :
- quand on crée une oeuvre, on peut chercher son titre sur Jikan pour préremplir le formulaire ;
- sur la page d'une oeuvre, un bouton "Actualiser" met à jour le nombre total, le statut et la note ;
- pour un manga ou un manhwa en cours, si Jikan ne donne pas de total, on va chercher le dernier chapitre sorti sur MangaUpdates. On cherche par titre la première fois, puis on garde son id dans mu_id.

Si une API ne répond pas, on affiche un message d'erreur et on garde ce qu'il y a déjà dans la base. On peut toujours remplir le formulaire à la main, le site marche sans les API.

## Nombre total inconnu
Pour une série en cours, Jikan ne donne pas toujours le nombre total. On regarde alors :
- pour un animé : la liste des épisodes déjà sortis sur Jikan ;
- pour un manga ou un manhwa : le dernier chapitre sorti sur MangaUpdates.

Si on n'a toujours rien (oeuvre introuvable ou API en panne), nb_total reste vide (NULL) et on affiche par exemple "Chapitre 45 / ?".
La progression est vérifiée côté serveur : elle ne peut pas dépasser le total connu. Tant que le total est inconnu, elle n'a pas de limite.

## Suppressions
- Créateur qui a encore des oeuvres : on bloque la suppression et on affiche la liste de ses oeuvres. Il faut d'abord les changer de créateur ou les supprimer.
- Oeuvre qui a des suivis : on demande une confirmation en indiquant combien d'utilisateurs la suivent. Si on confirme, l'oeuvre est supprimée avec ses suivis et ses liens avec les genres.
- Les clés étrangères sont activées dans SQLite.

## Questions pour le prof

- Franchise - oeuvre
On garde le fait qu'une oeuvre peut ne pas avoir de franchise : le prof a dit que c'était mieux, par exemple pour les one-shots.

- Pour l'affichage du nombre de chapitres, est-ce que c'est bon ?
On conserve l'affichage actuel des chapitres. On peut aussi ajouter un 2e affichage pour les oeuvres dont les API ne donnent pas le nombre de chapitres : on y met le nombre de chapitres de l'utilisateur qui est le plus avancé (il faut bien préciser que c'est une info non officielle si on implémente cette fonction).
" On peut mettre quand on a pas le nombre de chapitre le dernier recensé si il est pas a jour ou si il est inconnu "

- Est-ce que la taille du seed convient, ou faut-il l'agrandir ?
La taille du seed convient, pas de modification à faire.

- Voir la mise en avant
Le favori fonctionne pour la mise en avant, mais on peut quand même garder la mise en avant avec un compteur (un entier) sur chaque oeuvre : les oeuvres avec le plus grand compteur seront mises en avant sur la page d'accueil. On peut essayer de faire une remise à zéro hebdomadaire ou mensuelle si besoin.

## Mettons nous d'accord.

Il faudrait que l'on voit comment on veut faire le site (nb de pages/disposition etc...) 3 clics max !! 

## Le dico du .md :
// [] = Barre de recherche
// -- Ce qui est affiché de base sur la page
// --> possibles affichages
// *** Lien vers page
// Tri soit : - historique des vues (genre la plus récente modifiée) OU - La dernière ajoutée dans la liste
// (?) Hésitation choix cornélien
// $$$$ Action $$$$

# Arborescence : 

// Note des administrateurs : On ne réécrit pas toutes les arborescences car y'a bcp de répétitions

Accueil
|__ Profil
        |__ Catalogue Perso
                        |__ Page Formulaire Ajout
                        |__ Accueil
                        |__ Profil
        |__ Catalogue
                    |__ [...]
        |__ Accueil
                |__ [...]
|
|
|__ Catalogue Perso
                |__ [...]
|
|__ Catalogue
        |__ Page Formulaire Ajout
        |__ Info Oeuvre
                    |__ Info Createur
                    |__ Info Franchise (si y'a)
        |__ Accueil

Si tu as des modifs tu peux nous en parler on va pas te manger. On a jamais mangé personne (pas encore)


# Template : 
Dans la template : 

# Page-Accueil : 
La page principal ou l'on voit les oeuvres qui sont en "trend" cette semaine et on a aussi les dernieres oeuvres que l'on 
a mis a jour soit même + une rubrique "Recommandations" qui affiche les oeuvres boostées par les utilisateurs.

*** Lien vers "Page-Catalogue-Perso"
*** Lien vers "Page-Profil"

-- Le top 10 (les plus connus)
-- Rubrique Les oeuvres du mois (Tedances)
(?) -- Les sorties de cette semaines
-- Rubrique Pépite (recommandations de la commu)


# Page-Catalogue-Perso : 
Une page ou l'on peut voir ses oeuvres en cours avec une option de tri et de recherche. + oeuvres mises en favoris

// Note des administrateurs : L'ancien Page-Profil contenait seulement les oeuvres en favoris, on a pas trouvé ça pertinent d'en faire une page. Mieux vaut faire une option de recherche dans le catalogue perso

[Recherche avec les filtres]
-- Oeuvre Favoris
-- Toutes les oeuvres que l'on a ajouté à la liste
    --> Oeuvres en cours de visionnage
    --> Oeuvre à commencer
    --> Oeuvres terminées

# Page-Catalogue : 
Une page pour faire des recherches d'oeuvres avec pas mal d'option de tri (genre/nbChap/nbEpisode....).

[Recherche avec les filtres]
-- Toutes les oeuvres

// Note des administrateurs : Choix de l'affichage et de l'organisation de cette page reste encore floue, voici 3 possibilités (si tu comprends pas envoie nous un msg)

1. Liste alphabétique de toutes les oeuvres tout type confondu
2. 3 Listes alphabétiques de toutes les oeuvres en fonction de leur type
3. Juste une page d'ajout avec selection

# Page-Profil : 
Informations sur l'utilisateur 

-- Ses infos 
-- mdp, email
*** Lien vers "Page-Catalogue-Perso"
*** Lien vers "Page-Catalogue"

# Page-Info-Createur : 
Informations sur le créateur 

-- Ses infos 
-- Liste de ses oeuvres 
*** Lien vers l'oeuvre séléctionnée

# Page-Info-Franchise : 
Informations sur la franchise 

# Page-Formulaire-Ajout :
Page qui permet d'ajouter une oeuvre a la watchList

# Page-Info-Oeuvre : 

Informations sur l'oeuvre

-- titre, description, annee_sortie, statut
-- type (anime / manga / manhwa), note_moyenne 
$$$$ mises en avant (mettre en favoris ou alors recommander à la populace) $$$$
*** Lien vers createur 
*** Lien vers franchise

# Exigences complètes : 
D1, D2, D3, D4
F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12, F13, F14
N1, N2, N3, N4 à confirmer