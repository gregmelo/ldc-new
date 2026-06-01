# Suivi Interventions LDC

Application web de suivi des interventions support pour les équipes LDC (Service local de développement-construction) des Témoins de Jéhovah.

## Aperçu

Cet outil permet aux volontaires du support informatique de tracer, gérer et analyser leurs interventions auprès des membres de l'équipe. Il offre une interface moderne, responsive et accessible depuis n'importe quel appareil.

## Fonctionnalités

### Gestion des interventions
- Création, modification et suppression d'interventions
- Types d'intervention : visio/appel ou aide par message
- Statuts : En cours, Résolu, En attente de retour, Annulé, Envoyé support Béthel
- Notes enrichies avec éditeur de texte formaté (gras, italique, listes, liens, titres)
- Date de début et date de fin
- Recherche et filtres par statut et type

### Historique & Analyse
- Tableau de bord avec graphiques (évolution mensuelle, répartition par statut, top volontaires)
- Comparaison avec le trimestre précédent
- Historique par volontaire (panneau slide-in)
- Rapport trimestriel avec export PDF et CSV

### Administration
- Gestion des utilisateurs avec rôles (admin / utilisateur)
- Journal d'activité complet (connexions, créations, modifications, suppressions)
- Expiration de session automatique après 2h d'inactivité

### Interface
- Mode clair / sombre (automatique selon les préférences système + toggle manuel)
- Design responsive optimisé mobile et tablette
- Cartes adaptatives sur mobile pour l'historique

## Stack technique

### Frontend
- **React 18** + **Vite 5**
- **Zustand** — gestion d'état
- **Chart.js** + **react-chartjs-2** — graphiques
- **TipTap** — éditeur de notes enrichies
- **jsPDF** + **html2canvas** — export PDF
- **SCSS** modulaire

### Backend
- **PHP 8** — architecture PSR-4
- **MySQL / MariaDB**
- **vlucas/phpdotenv** — variables d'environnement
- **ezyang/htmlpurifier** — sanitisation HTML
- JWT maison pour l'authentification

### Hébergement
- **Alwaysdata** (backend PHP + base de données)
- Déployable sur tout hébergement PHP 8+

## Structure du projet

```
ldc-new/
├── backend/
│   ├── public/
│   │   ├── index.php          # Point d'entrée unique
│   │   └── .htaccess
│   ├── src/
│   │   ├── Auth.php
│   │   ├── ActivityLog.php
│   │   ├── Database.php
│   │   ├── Router.php
│   │   └── Controllers/
│   │       ├── AuthController.php
│   │       ├── InterventionController.php
│   │       ├── UserController.php
│   │       └── ActivityLogController.php
│   ├── .env.example
│   ├── .gitignore
│   └── composer.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── ActivityLogPanel.jsx
│   │   │   ├── interventions/
│   │   │   │   ├── InterventionForm.jsx
│   │   │   │   ├── InterventionTable.jsx
│   │   │   │   ├── InterventionEditModal.jsx
│   │   │   │   ├── InterventionModal.jsx
│   │   │   │   └── VolunteerPanel.jsx
│   │   │   ├── stats/
│   │   │   │   └── StatsPanel.jsx
│   │   │   ├── users/
│   │   │   │   └── UserTable.jsx
│   │   │   └── ui/
│   │   │       ├── Modal.jsx
│   │   │       ├── RichTextEditor.jsx
│   │   │       └── StatusBadge.jsx
│   │   ├── hooks/
│   │   │   └── useSessionTimeout.js
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── styles/
│   │   │   ├── main.scss
│   │   │   ├── _variables.scss
│   │   │   └── tiptap.scss
│   │   ├── utils/
│   │   │   └── pdfExport.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Installation

### Prérequis
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL / MariaDB

### Backend

```bash
cd backend
cp .env.example .env
# Remplir les variables dans .env
composer install
```

Variables d'environnement requises :

```env
LDC_DB_HOST=mysql-xxxx.alwaysdata.net
LDC_DB_NAME=nom_de_la_base
LDC_DB_USER=utilisateur_mysql
LDC_DB_PASS=mot_de_passe
LDC_APP_SECRET=chaine_aleatoire_longue_et_securisee
LDC_ALLOWED_ORIGIN=https://votre-domaine.com
```

### Base de données

Exécuter le script SQL dans phpMyAdmin ou via CLI :

```bash
mysql -h host -u user -p database < schema.sql
```

Compte admin par défaut créé automatiquement — **changer le mot de passe à la première connexion**.

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Remplir VITE_API_URL dans .env.local
npm install
npm run dev
```

Variable d'environnement requise :

```env
VITE_API_URL=https://votre-domaine.com/backend/public/index.php
```

## Déploiement

### Build frontend

```bash
cd frontend
npm run build
```

Le build est généré dans le dossier `dist/` à la racine du projet.

### Upload sur le serveur

1. Uploader le contenu de `dist/` à la racine de votre domaine
2. Uploader le dossier `backend/` sur le serveur
3. S'assurer que les fichiers `.htaccess` sont bien présents
4. Configurer le `.env` avec les bonnes valeurs

### .htaccess requis

À la racine du site (pour React Router) :
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

Dans `backend/public/` (pour le routeur PHP) :
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

## API REST

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/login` | Authentification | — |
| GET | `/me` | Infos utilisateur courant | ✓ |
| GET | `/interventions` | Liste des interventions | ✓ |
| POST | `/interventions` | Créer une intervention | ✓ |
| PUT | `/interventions/:id` | Modifier une intervention | ✓ |
| DELETE | `/interventions/:id` | Supprimer une intervention | ✓ |
| GET | `/users` | Liste des utilisateurs | Admin |
| POST | `/users` | Créer un utilisateur | Admin |
| DELETE | `/users/:id` | Supprimer un utilisateur | Admin |
| PUT | `/users/:id/password` | Modifier un mot de passe | ✓ |
| GET | `/activity-log` | Journal d'activité | Admin |

## Sécurité

- Authentification par token JWT signé avec `APP_SECRET`
- Tokens expirés après 7 jours
- Expiration de session après 2h d'inactivité côté client
- Sanitisation HTML des notes avec HTMLPurifier
- Protection CORS configurée par domaine
- Mots de passe hashés avec bcrypt (coût 12)
- Variables sensibles dans `.env` (non versionné)

## Licence

MIT — voir [LICENSE](LICENSE)

## Auteur

Grégory Véricel — [L'Ain-terface](https://lain-terface.fr)