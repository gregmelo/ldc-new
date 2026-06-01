# Guide de contribution

Merci de l'intérêt que vous portez au projet **Suivi Interventions LDC** !  
Ce document décrit les conventions et bonnes pratiques à suivre pour contribuer.

## Table des matières

- [Code de conduite](#code-de-conduite)
- [Prérequis](#prérequis)
- [Mise en place de l'environnement](#mise-en-place-de-lenvironnement)
- [Workflow Git](#workflow-git)
- [Conventions de code](#conventions-de-code)
- [Structure des commits](#structure-des-commits)
- [Soumettre une Pull Request](#soumettre-une-pull-request)
- [Signaler un bug](#signaler-un-bug)
- [Proposer une fonctionnalité](#proposer-une-fonctionnalité)

---

## Code de conduite

Ce projet est utilisé dans un contexte associatif bienveillant.  
Toute contribution doit être respectueuse, constructive et orientée vers l'amélioration de l'outil pour ses utilisateurs.

---

## Prérequis

Avant de contribuer, assurez-vous d'avoir installé :

- **Node.js** 18+ et **npm**
- **PHP** 8.1+
- **Composer**
- **Git**
- Un éditeur de code (VSCode recommandé)

---

## Mise en place de l'environnement

### 1. Forker et cloner le dépôt

```bash
git clone https://github.com/gregmelo/ldc-new.git
cd ldc-new
```

### 2. Installer les dépendances backend

```bash
cd backend
cp .env.example .env
# Remplir les variables dans .env avec vos infos locales
composer install
```

### 3. Installer les dépendances frontend

```bash
cd ../frontend
cp .env.example .env.local
# Remplir VITE_API_URL dans .env.local
npm install
```

### 4. Lancer l'environnement de développement

```bash
# Terminal 1 — frontend
cd frontend
npm run dev

# Terminal 2 — backend via un serveur PHP local
cd backend/public
php -S localhost:8080
```

Le frontend sera accessible sur `http://localhost:5173` avec un proxy vers le backend configuré dans `vite.config.js`.

---

## Workflow Git

### Branches

| Branche | Usage |
|---------|-------|
| `main` | Code stable en production |
| `feature/nom-fonctionnalite` | Nouvelle fonctionnalité |
| `fix/nom-du-bug` | Correction de bug |
| `chore/description` | Maintenance, dépendances, config |
| `docs/description` | Documentation uniquement |

### Exemple

```bash
# Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/export-excel

# Travailler, commiter
git add .
git commit -m "feat: ajout export Excel pour le rapport trimestriel"

# Pousser et ouvrir une PR
git push origin feature/export-excel
```

---

## Conventions de code

### Frontend (React / JavaScript)

- **Composants** : PascalCase (`InterventionForm.jsx`)
- **Hooks** : camelCase préfixé `use` (`useSessionTimeout.js`)
- **Utilitaires** : camelCase (`pdfExport.js`)
- **Styles** : BEM via SCSS (`.intervention-card__header`)
- Pas de `var` — utiliser `const` et `let`
- Fonctions fléchées pour les callbacks
- Props destructurées dans la signature de fonction
- Un composant = un fichier

```jsx
// ✅ Bien
export default function InterventionCard({ nom, date, status, onClick }) {
  return (
    <div className="intervention-card" onClick={onClick}>
      ...
    </div>
  )
}

// ❌ À éviter
export default function InterventionCard(props) {
  var nom = props.nom
  ...
}
```

### Backend (PHP)

- **Namespace** : `App\` pour les classes, `App\Controllers\` pour les contrôleurs
- **Classes** : PascalCase (`InterventionController`)
- **Méthodes** : camelCase (`getInterventions`)
- **Variables** : camelCase (`$bodyContent`)
- Typage strict des paramètres et retours de méthodes
- Toujours utiliser des requêtes préparées PDO
- Ne jamais stocker de données sensibles en clair

```php
// ✅ Bien
public function show(int $id): void
{
    Auth::check();
    $db   = Database::getInstance();
    $stmt = $db->prepare('SELECT * FROM interventions WHERE id = ?');
    $stmt->execute([$id]);
    ...
}

// ❌ À éviter
function show($id) {
    $result = mysqli_query($conn, "SELECT * FROM interventions WHERE id = $id");
    ...
}
```

### SCSS

- Variables dans `_variables.scss`
- Un fichier par domaine (`_layout.scss`, `_components.scss`)
- Utiliser les variables CSS (`var(--accent)`) pour les couleurs thémables
- Éviter les `!important`
- Media queries dans les blocs concernés ou en fin de fichier

---

## Structure des commits

Ce projet suit la convention [Conventional Commits](https://www.conventionalcommits.org/fr/).

### Format

```
<type>(<scope>): <description courte>

[corps optionnel]

[pied de page optionnel]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Maintenance (dépendances, config, CI) |
| `docs` | Documentation uniquement |
| `style` | Formatage, espaces (pas de changement logique) |
| `refactor` | Refactoring sans ajout de fonctionnalité |
| `perf` | Amélioration des performances |
| `test` | Ajout ou modification de tests |

### Exemples

```bash
git commit -m "feat: ajout du panneau historique par volontaire"
git commit -m "fix: correction de l'encodage HTML dans les notes"
git commit -m "chore: mise à jour de Chart.js vers la v4"
git commit -m "docs: mise à jour du README avec les nouvelles routes API"
git commit -m "refactor: extraction de la logique PDF dans un utilitaire dédié"
```

---

## Soumettre une Pull Request

1. **Forker** le dépôt et créer une branche depuis `main`
2. **Développer** en suivant les conventions ci-dessus
3. **Tester** votre modification manuellement
4. **Builder** le frontend sans erreur : `npm run build`
5. **Commiter** avec des messages clairs
6. **Ouvrir une PR** vers `main` avec :
   - Un titre clair décrivant la modification
   - Une description expliquant le pourquoi et le comment
   - Des captures d'écran si la modification est visuelle
   - La mention des issues liées (`Closes #12`)

### Checklist PR

- [ ] Le build frontend passe sans erreur
- [ ] Les conventions de nommage sont respectées
- [ ] Pas de fichiers `.env` ou `node_modules` inclus
- [ ] Le code ne contient pas de `console.log` de debug
- [ ] La documentation est mise à jour si nécessaire

---

## Signaler un bug

Ouvrez une **Issue** sur GitHub avec :

- **Titre** : Description courte et claire du problème
- **Environnement** : navigateur, OS, appareil
- **Étapes pour reproduire** : numérotées et précises
- **Comportement attendu** : ce qui devrait se passer
- **Comportement observé** : ce qui se passe réellement
- **Captures d'écran** : si pertinent
- **Logs** : erreurs console ou réseau si disponibles

---

## Proposer une fonctionnalité

Ouvrez une **Issue** avec le label `enhancement` en décrivant :

- Le **problème** que la fonctionnalité résout
- La **solution envisagée** avec le plus de détails possible
- Les **alternatives** considérées
- L'**impact** sur l'expérience utilisateur existante

---

## Questions

Pour toute question sur le projet, vous pouvez ouvrir une Issue avec le label `question`.

---

Merci pour votre contribution ! 🙏