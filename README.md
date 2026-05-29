# Suivi des interventions — LDC

Application de suivi des interventions (backend API en PHP + frontend React/Vite).

Contenu du dépôt

- `backend/` : API PHP (PSR-4) avec routes minimalistes, authentification JWT, accès MySQL.
- `frontend/` : application React + Vite, gestion d'état avec Zustand, styles SCSS.

Objectif

Ce projet permet de gérer des interventions (création, consultation, modification, suppression) et des utilisateurs (comptes administrateurs) pour une équipe de support.

Fonctionnalités principales

- Authentification via token JWT (`/login`, `/me`).
- CRUD complet sur les interventions (`/interventions`).
- Gestion des utilisateurs (liste, création, suppression, changement de mot de passe) réservée aux administrateurs.

Prérequis

- PHP 8.0+ (ou 7.4+ ; recommandé 8.x)
- Composer
- MySQL / MariaDB
- Node.js 18+ et npm (pour le frontend)

Installation et exécution (développement)

1) Récupérer le dépôt

```bash
git clone git@github.com:gregmelo/ldc-new.git
cd ldc-new
```

2) Backend (API PHP)

- Copier l'exemple d'environnement et installer les dépendances :

```bash
cd backend
cp .env.example .env
# éditer .env et renseigner LDC_DB_* et LDC_APP_SECRET
composer install
```

- Lancer le serveur PHP intégré pour le développement (serveur simple) :

```bash
# depuis la racine du projet
php -S localhost:8000 -t backend/public
```

Le point d'entrée de l'API sera `http://localhost:8000` (ajustez si vous utilisez un chemin). Assurez-vous que `LDC_ALLOWED_ORIGIN` autorise l'origine du frontend.

3) Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env.local
# éditer .env.local et renseigner VITE_API_URL (ex: http://localhost:8000)
npm run dev
```

Le frontend sera disponible par défaut sur `http://localhost:5173` (Vite).

Configuration d'environnement

- Backend (`backend/.env`) :

```
LDC_DB_HOST=localhost
LDC_DB_NAME=ldc_db
LDC_DB_USER=root
LDC_DB_PASS=
LDC_APP_SECRET=remplacez_par_une_chaine_secrete
LDC_ALLOWED_ORIGIN=http://localhost:5173
```

- Frontend (`frontend/.env.local`) :

```
VITE_API_URL=http://localhost:8000
```

Base de données (schéma recommandé)

Exemples de commandes SQL pour initialiser la base :

```sql
-- table users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- table interventions
CREATE TABLE interventions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    duree VARCHAR(50) DEFAULT NULL,
    sujet TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'en_cours'
);
```

API — routes principales

Base : `https://YOUR_DOMAIN/.../backend/public` ou `http://localhost:8000`

- POST `/login` : authentification
    - Input: `username`, `password`
    - Réponse: `{ token, role, username }`
- GET `/me` : retourne les infos du token

- Interventions
    - GET `/interventions` : liste toutes les interventions (auth requis)
    - POST `/interventions` : créer une intervention (auth requis)
        - Champs requis: `date`, `nom`, `type`, `sujet`
    - GET `/interventions/:id` : récupérer une intervention
    - PUT `/interventions/:id` : mettre à jour (mêmes champs requis)
    - DELETE `/interventions/:id` : supprimer

- Utilisateurs
    - GET `/users` : lister (admin uniquement)
    - POST `/users` : créer un utilisateur (admin)
        - Champs requis: `username`, `password`, `role`
    - DELETE `/users/:id` : supprimer un utilisateur (admin)
    - PUT `/users/:id/password` : changer le mot de passe (admin ou propriétaire)

Authentification

L'API retourne un `token` JWT au login. Toutes les routes protégées nécessitent l'en-tête HTTP :

```
Authorization: Bearer <token>
```

Exemples d'utilisation (curl)

```bash
# login
curl -X POST http://localhost:8000/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"secret"}'

# lister les interventions
curl http://localhost:8000/interventions \
    -H "Authorization: Bearer <token>"

# créer une intervention
curl -X POST http://localhost:8000/interventions \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"date":"2026-05-29","nom":"Dupont","type":"maintenance","sujet":"Problème X"}'
```

Déploiement

- Backend : déployer le contenu de `backend/` sur votre hébergement (Apache/nginx/PHP-FPM). Le répertoire public accessible doit pointer sur `backend/public`.
- Frontend : construire la version de production `npm run build` puis déployer le dossier `dist/` sur votre serveur web.

Bonnes pratiques & sécurité

- Garder `LDC_APP_SECRET` confidentiel et long.
- Ne pas committer `backend/.env` ni `frontend/.env.local`.
- Utiliser HTTPS en production et restreindre `LDC_ALLOWED_ORIGIN`.
- Hasher les mots de passe (le backend utilise `password_hash`).

Tests et amélioration

- Ajouter des tests unitaires et d'intégration côté backend.
- Ajouter validation côté frontend et gestion d'erreurs centralisée.
- Ajouter CI (GitHub Actions) pour lint, tests et build.

Contribuer

1. Fork du dépôt
2. Créer une branche feature/bugfix
3. Ouvrir une pull request avec une description claire




