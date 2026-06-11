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
- [Tests](#tests)
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
- **PHP** 8.2+
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

Le frontend sera accessible sur `http://localhost:5173`.

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
| `test/description` | Ajout ou amélioration de tests |

### Exemple

```bash
git checkout -b feature/export-excel
# ... développement ...
git add .
git commit -m "feat: ajout export Excel pour le rapport trimestriel"
git push origin feature/export-excel
```

---

## Conventions de code

### Frontend (React / JavaScript)

- **Composants** : PascalCase (`InterventionForm.jsx`)
- **Hooks** : camelCase préfixé `use` (`useSessionTimeout.js`)
- **Utilitaires** : camelCase (`pdfExport.js`)
- **Tests** : même nom que le fichier testé + `.test.js(x)` (`categories.test.js`)
- **Styles** : BEM via SCSS (`.intervention-card__header`)
- Pas de `var` — utiliser `const` et `let`
- Fonctions fléchées pour les callbacks
- Props destructurées dans la signature de fonction
- Un composant = un fichier
- Hooks appelés uniquement à l'intérieur des composants React

```jsx
// ✅ Bien
export default function InterventionCard({ nom, date, status, onClick }) {
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin')
  return (
    <div className="intervention-card" onClick={onClick}>
      ...
    </div>
  )
}

// ❌ À éviter — hook hors composant
const isAdmin = useAuthStore((s) => s.user?.role === 'admin')
export default function InterventionCard(props) { ... }
```

### Backend (PHP)

- **Namespace** : `App\` pour les classes, `App\Controllers\` pour les contrôleurs
- **Classes** : PascalCase (`InterventionController`)
- **Méthodes** : camelCase (`getInterventions`)
- **Variables** : camelCase (`$bodyContent`)
- Typage strict des paramètres et retours de méthodes
- Toujours utiliser des requêtes préparées PDO
- Ne jamais stocker de données sensibles en clair
- Annotations Swagger via attributs PHP `#[OA\...]` (pas PHPDoc)

```php
// ✅ Bien
#[OA\Get(path: "/interventions", summary: "Liste", tags: ["Interventions"])]
public function index(): void
{
    Auth::check();
    $stmt = $db->prepare('SELECT * FROM interventions WHERE id = ?');
    $stmt->execute([$id]);
}

// ❌ À éviter
function index() {
    $result = mysqli_query($conn, "SELECT * FROM interventions WHERE id = $id");
}
```

### SCSS

- Variables dans `_variables.scss`
- Utiliser les variables CSS (`var(--accent)`) pour les couleurs thémables
- Éviter les `!important`
- Media queries dans les blocs concernés

---

## Structure des commits

Ce projet suit la convention [Conventional Commits](https://www.conventionalcommits.org/fr/).

### Format

```
<type>(<scope>): <description courte>
```

### Types

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Maintenance (dépendances, config) |
| `docs` | Documentation uniquement |
| `style` | Formatage, espaces (pas de changement logique) |
| `refactor` | Refactoring sans ajout de fonctionnalité |
| `perf` | Amélioration des performances |
| `test` | Ajout ou modification de tests |

### Exemples

```bash
git commit -m "feat: ajout panneau historique par volontaire"
git commit -m "fix: correction encodage HTML dans les notes"
git commit -m "chore: mise à jour dépendances npm"
git commit -m "docs: mise à jour README avec nouvelles routes API"
git commit -m "test: ajout tests PHPUnit pour ActivityLog"
```

---

## Tests

### Backend (PHPUnit)

```bash
cd backend
vendor/bin/phpunit
```

Les tests utilisent une base SQLite en mémoire — aucune connexion à la BDD de production n'est nécessaire.

Fichiers de test dans `backend/tests/` :
- `AuthTest.php` — génération et vérification des tokens JWT
- `ActivityLogTest.php` — insertion et comptage des logs
- `SanitizeHtmlTest.php` — sanitisation HTML (XSS, balises autorisées)

### Frontend (Vitest)

```bash
cd frontend
npm run test:run       # exécution unique
npm run test           # mode watch
```

Fichiers de test dans `frontend/src/tests/` :
- `utils/categories.test.js` — liste des catégories
- `utils/pdfExport.test.js` — export PDF (avec mocks)
- `components/StatusBadge.test.jsx` — configuration des statuts

### Règles pour les tests

- Tout nouveau utilitaire doit avoir un fichier de test associé
- Les mocks doivent utiliser `vi.fn().mockImplementation(function() {...})` pour les constructeurs
- Ne jamais connecter les tests à la BDD de production
- Les tests doivent passer avant toute PR

---

## Soumettre une Pull Request

1. **Forker** le dépôt et créer une branche depuis `main`
2. **Développer** en suivant les conventions ci-dessus
3. **Tester** — s'assurer que tous les tests passent
4. **Builder** le frontend sans erreur : `npm run build`
5. **Commiter** avec des messages clairs
6. **Ouvrir une PR** vers `main` avec :
   - Un titre clair décrivant la modification
   - Une description expliquant le pourquoi et le comment
   - Des captures d'écran si la modification est visuelle
   - La mention des issues liées (`Closes #12`)

### Checklist PR

- [ ] Tous les tests PHPUnit passent (`vendor/bin/phpunit`)
- [ ] Tous les tests Vitest passent (`npm run test:run`)
- [ ] Le build frontend passe sans erreur (`npm run build`)
- [ ] Les conventions de nommage sont respectées
- [ ] Pas de fichiers `.env`, `node_modules/` ou `vendor/` inclus
- [ ] Le code ne contient pas de `console.log` de debug
- [ ] La documentation Swagger est mise à jour si de nouvelles routes sont ajoutées
- [ ] Le README est mis à jour si nécessaire

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

Pour toute question sur le projet, ouvrez une Issue avec le label `question`.

---

Merci pour votre contribution ! 🙏