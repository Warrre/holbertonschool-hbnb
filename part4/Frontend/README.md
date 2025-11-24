# Part 4 — Frontend

Ce dossier contient les pages statiques du projet Part 4 (HTML/CSS/JS). Le frontend communique avec le backend via `http://127.0.0.1:5000/api/v1`.

Fichiers principaux
- `index.html` — liste des lieux et filtre prix
- `login.html` — page de connexion (enregistrement possible via API)
- `place.html` — détail d'un lieu et affichage des avis
- `add_review.html` — page pour ajouter un avis (protégée)
- `scripts.js` — logique JS (auth, fetch API, filtrage, reviews)

Démarrage (Windows PowerShell)
1. Servir le dossier statique :
```powershell
cd 'C:\Users\warre\partie 4 hbnb\holbertonschool-hbnb-1\part4\Frontend'
python -m http.server 8000
```
2. Ouvrir le navigateur : `http://127.0.0.1:8000/index.html`

Flux utilisateur rapide
- S'inscrire : utilisez le formulaire d'inscription (ou `POST /api/v1/users`) pour créer un compte.
- Se connecter : `login.html` — après connexion le token est stocké dans un cookie nommé `token` et la barre de navigation montre `Se déconnecter`.
- Poster un avis : rendez-vous sur une page de lieu, cliquez `Add a Review` ou `add_review.html?id=<place_id>`. Le formulaire POST envoie le token via `Authorization: Bearer <token>`.

Vérifications
- Le filtre `Prix maximum` affiche les options `All`, `10`, `50`, `100`. Sélectionnez une valeur pour limiter l'affichage des cartes.
- Si une carte apparaît pour un prix supérieur au max sélectionné, cliquez sur `Actualiser` pour refetch et appliquer le filtre.

Dépannage rapide
- Assurez-vous que le backend minimal est démarré sur le port `5000`.
- Ouvrez la console devtools (F12) et regardez les erreurs réseau si une requête échoue.
