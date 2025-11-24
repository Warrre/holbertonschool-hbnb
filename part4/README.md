
**Holberton HBnB — Projet Partie 4**

**Structure**
- **`part4/Frontend`**: pages HTML/CSS/JS statiques (index, login, register, place, add_review, scripts.js, styles.css).
- **`part4/Backend`**: API Flask simple dans `run_simple.py` (utilise Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS). Base de données: `development.db`.
- **Fichiers utiles**: `part4/Backend/users_list.txt` (comptes seed), `part4/Backend/development.db` (DB persistante).

**Prérequis**
- Python 3.8+ (Windows PowerShell).
- Packages Python: `flask`, `flask_sqlalchemy`, `flask_jwt_extended`, `flask_cors`.

**Installation & Exécution (Windows PowerShell)**

- Installer dépendances et lancer le backend:
```powershell
Set-Location 'C:\...\holbertonschool-hbnb\part4\Backend'
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install flask flask_sqlalchemy flask_jwt_extended flask_cors
python run_simple.py
```

- Servir le frontend (serveur statique) :
```powershell
Set-Location 'C:\...\holbertonschool-hbnb\part4\Frontend'
python -m http.server 8000
# Ouvrir http://127.0.0.1:8000/index.html
```

**Comptes seed connus**
- **Admin**: `admin@example.com` / `AdminPass123` (compte admin créé/securisé par `init_db()`)
- **Demo**: `demo@example.com` / `DemoPass123`

**Fonctionnalités principales**

## Architecture

L'application est conçue selon une architecture simple client / serveur :
- Frontend statique (HTML/CSS/JS) qui consomme une API REST.
- Backend Flask exposant des endpoints REST et persistant les données dans une base SQLite locale (`development.db`).
- Authentification par JWT : le backend signe des tokens et le frontend les stocke en cookie `token` pour les appels protégés.

Composants principaux :
- Serveur HTTP statique (pour le frontend) — aucune build JS nécessaire, pages servies telles quelles.
- API Flask (backend) — logique métier simple, contrôles d'accès côté serveur pour les opérations admin.

## Project Structure

Arborescence principale (les chemins relatifs sont depuis la racine du dépôt) :

- `part4/Frontend/`
	- `index.html` — page de listing des lieux
	- `place.html` — page de détail d'un lieu
	- `login.html` — page de connexion
	- `register.html` — page d'inscription
	- `add_review.html` — page d'ajout d'avis
	- `scripts.js` — logique JS client (fetch API, gestion JWT, rendu)
	- `styles.css` — styles du site

- `part4/Backend/`
	- `run_simple.py` — serveur Flask (API)
	- `development.db` — base SQLite (générée par `init_db()`)
	- `users_list.txt` — fichier généré listant les comptes seed

Autres dossiers du dépôt contiennent les parties précédentes du projet (part1, part2, part3) et de la documentation.

## Expected output: Accessing the Application

Après avoir démarré le backend et le serveur statique :

- Ouvrir `http://127.0.0.1:8000/index.html` affichera la liste des lieux (titre, description, prix, équipements).
- Cliquer sur un lieu ouvrira `place.html?id=<place_id>` avec les détails et la section avis.
- En vous inscrivant / en vous connectant, vous pourrez poster un avis sur un lieu; l'avis restera persistant dans `development.db`.
- En vous connectant avec le compte admin (`admin@example.com`), des boutons de suppression apparaîtront et l'admin pourra supprimer des avis et des lieux.

Exemples d'états attendus :
- Listing : 3 lieux seedés (après initialisation propre): `Beautiful Beach House`, `Cozy Cabin`, `Modern Apartment` plus le lieu `Beautiful Beach` ajouté.
- Poster un avis renvoie `201` avec l'objet `review` créé.
- Tentative d'inscription avec un email déjà pris renvoie `400` avec `{ "error": "Email already registered" }`.

## Accessing the Application (quick)

1. Démarrer le backend :
```powershell
Set-Location 'part4/Backend'
python run_simple.py
```
2. Servir le frontend :
```powershell
Set-Location 'part4/Frontend'
python -m http.server 8000
```
3. Ouvrir `http://127.0.0.1:8000/index.html` dans un navigateur.

Pour interroger directement l'API depuis PowerShell :
```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/v1/places' | ConvertTo-Json -Depth 5
```

## API Endpoints (récapitulatif détaillé)

- `POST /api/v1/users`
	- Description : Crée un nouvel utilisateur et retourne un token.
	- Body JSON : `{ "first_name": "...", "last_name": "...", "email": "...", "password": "..." }`
	- Réponses : `201` (création) ou `400` (email déjà enregistré) ou `500` (erreur serveur).

- `POST /api/v1/auth/login`
	- Description : Authentifie et retourne un `access_token`.
	- Body JSON : `{ "email": "...", "password": "..." }`.
	- Réponse : `200` + `{ "access_token": "..." }` ou `401` si identifiants invalides.

- `GET /api/v1/places`
	- Description : Retourne la liste des lieux.
	- Réponse : `200` + tableau d'objets `place` (champs : `id`, `title`, `description`, `price`, `owner_id`, `amenities`).

- `GET /api/v1/places/<id>`
	- Description : Retourne le détail d'un lieu.

- `POST /api/v1/places` (admin)
	- Description : Crée un lieu (admin uniquement).
	- Header : `Authorization: Bearer <token>` (token admin).

- `DELETE /api/v1/places/<id>` (admin)

- `GET /api/v1/reviews/places/<place_id>`
	- Description : Liste des avis pour un lieu.

- `POST /api/v1/reviews`
	- Description : Ajoute un avis pour un lieu (auth requis).
	- Body JSON : `{ "place_id": "...", "text": "...", "rating": 1..5 }`.
	- Réponse : `201` + review créé, ou `409` si avis dupliqué, ou `400` si champs manquants.

- `DELETE /api/v1/reviews/<review_id>`
	- Description : Supprime un avis (propriétaire ou admin).

## Authors

- Développeur principal: Warrre
- Compte admin seed : `admin@example.com` (mot de passe : `AdminPass123`)

---
