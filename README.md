# Suivi Interventions LDC

Outil de suivi des interventions support LDC — React + Vite + PHP.

## Structure

```
ldc/
├── backend/        ← API PHP (PSR-4, phpdotenv)
│   ├── public/     ← Point d'entrée (index.php)
│   └── src/        ← Controllers, Router, Auth, Database
└── frontend/       ← React + Vite + Zustand + SCSS
    └── src/
        ├── api/        ← Client HTTP centralisé
        ├── components/ ← Composants React
        ├── store/      ← Store Zustand
        └── styles/     ← SCSS modulaire
```

## Installation

### Backend
```bash
cd backend
cp .env.example .env
# Remplir les variables dans .env
composer install
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Remplir VITE_API_URL dans .env.local
npm run dev
```

## Déploiement sur alwaysdata

### Backend
```bash
# Uploader backend/ dans www/ldc/backend/
# Vérifier que www/ldc/backend/public/ est accessible
```

### Frontend
```bash
cd frontend
npm run build
# Uploader le dossier dist/ dans www/ldc/
```

## Variables d'environnement

### Backend (.env)
```
LDC_DB_HOST=mysql-xxxx.alwaysdata.net
LDC_DB_NAME=nom_de_la_base
LDC_DB_USER=utilisateur_mysql
LDC_DB_PASS=mot_de_passe
LDC_APP_SECRET=chaine_aleatoire
LDC_ALLOWED_ORIGIN=https://votre-domaine.alwaysdata.net
```

### Frontend (.env.local)
```
VITE_API_URL=https://votre-domaine.alwaysdata.net/ldc/backend/public
```
