# Holberton HBnB — Guide complet (Parties 1 → 4)

## Sommaire
- Vue d'ensemble
- Structure du dépôt (Part 1 → Part 4)
- Exécution & installation (rapide)
- Détails par partie
- API (endpoints clés)
- Tests & démonstrations
- Auteurs et contacts

## Vue d'ensemble

Le projet est une application de type HBnB (liste de lieux, pages de détail, avis, authentification). Les 4 parties couvrent progressivement la conception, l'implémentation backend et l'intégration frontend.

## Structure du dépôt

- `part1/` — diagrammes et documentation (Conception, séquences, package diagrams).
- `part2/` — prototype backend et premières routes.
- `part3/` — backend complet avec modèles SQLAlchemy, repository, scripts SQL.
- `part4/` — finale (Frontend statique + Backend Flask prêt à l'emploi).

Contenu important dans `part4` :

- `part4/Frontend/` : `index.html`, `place.html`, `login.html`, `register.html`, `add_review.html`, `scripts.js`, `styles.css`.
- `part4/Backend/` : `run_simple.py`, `development.db`, `users_list.txt`.

## Exécution & installation (Part 4 — rapide)

Prérequis : Python 3.8+.

1) Backend (Part 4)

```powershell
Set-Location 'part4/Backend'
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
python -m pip install --upgrade pip
python -m pip install flask flask_sqlalchemy flask_jwt_extended flask_cors
python run_simple.py
```

2) Frontend (serveur statique)

```powershell
Set-Location 'part4/Frontend'
python -m http.server 8000
# Ouvrir http://127.0.0.1:8000/index.html
```

Pour réinitialiser la base : supprimer `part4/Backend/development.db` puis relancer `run_simple.py`.

## Détails par partie

- Part 1 — Conception (diagrammes, spécifications).
- Part 2 — Prototype backend et premières routes.
- Part 3 — Backend avec persistence SQL, modèles et services.
- Part 4 — Frontend statique + Backend Flask complet pour démonstration.

## API — Endpoints clés

- `POST /api/v1/users` — Inscription (retourne token + user)
- `POST /api/v1/auth/login` — Connexion (retourne access_token)
- `GET /api/v1/places` — Lister lieux
- `GET /api/v1/places/<id>` — Détail lieu
- `POST /api/v1/places` — Créer lieu (admin)
- `DELETE /api/v1/places/<id>` — Supprimer lieu (admin)
- `GET /api/v1/reviews/places/<place_id>` — Lister avis
- `POST /api/v1/reviews` — Poster avis (auth requis)
- `DELETE /api/v1/reviews/<review_id>` — Supprimer avis (owner/admin)

> Remarque : les objets `place` incluent un champ `amenities` (liste de chaînes) pour faciliter l'affichage côté frontend.

## Comptes seed (Part 4)

- Admin : `admin@example.com` / `AdminPass123`
- Demo : `demo@example.com` / `DemoPass123`

Ces comptes sont créés automatiquement lors de l'initialisation (`init_db()`) et écrits dans `part4/Backend/users_list.txt`.

## Tests & démonstrations (E2E)

Manuel :
1) Lancer backend + frontend
2) S'inscrire / Se connecter
3) Poster un avis sur un lieu
4) Se connecter en admin et supprimer avis / lieu

Commandes PowerShell utiles :

```powershell
# Lister lieux
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/v1/places' | ConvertTo-Json -Depth 5

# Tester inscription
$body = @{ first_name='Test'; last_name='User'; email='test@example.com'; password='TestPass123' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/v1/users' -Method Post -Body $body -ContentType 'application/json'

# Login
$body = @{ email='demo@example.com'; password='DemoPass123' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/v1/auth/login' -Method Post -Body $body -ContentType 'application/json'
```

## Suggestions d'amélioration

- Persister `amenities` en base et ajouter endpoints pour les gérer.
- Remplacer `alert()` par messages graphiques sous les formulaires pour une meilleure UX.
- Préparer déploiement production (WSGI, HTTPS, CORS strict).

## Contribuer

Fork → branche → Pull Request avec description claire.

## Auteurs

- Warrre — développeur principal / propriétaire du dépôt

---

Si vous voulez que je :
- crée un script E2E PowerShell automatique,
- améliore le frontend (messages d'erreur), ou
- commette ces changements sur `main`, dites‑le et je l'exécute.
