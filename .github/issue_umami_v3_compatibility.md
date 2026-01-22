# Issue: Migration vers Umami v3.x (Breaking Change)

## Contexte

Migration **action-umami-report** vers **Umami v3.x exclusivement**.  
⚠️ **Breaking Change** : Abandon du support Umami v2.x (legacy).

Objectif : utiliser `umami-api-client@^3.0.3` et valider localement avec `pnpm day`.

## État actuel

- **Package manager**: pnpm 10.17.1
- **Dépendances actuelles**:
  - `umami-api-client`: ^2.17.3 ❌ (EOL)
- **Cible migration**:
  - `umami-api-client`: ^3.0.3-beta.1 ⚠️ (Umami v3.x - version beta)
  - Node 20 (ESM)
- **Umami versions supportées**:
  - Umami Cloud (API `https://api.umami.is`)
  - Umami Hosted v3.x uniquement (latest: v3.0.3 - 12 Dec 2025)
  - ❌ **Umami v2.x non supporté** (breaking change assumé)

## Plan de migration

### Phase 1: Upgrade umami-api-client v3.0.3-beta.1 ⬆️

- [x] Mettre à jour `umami-api-client` : `2.17.3` → `3.0.3-beta.1`
  ```bash
  pnpm add umami-api-client@3.0.3-beta.1
  ```
- [x] Lire le guide de migration officiel:
  - [MIGRATION_V3.md](https://github.com/boly38/umami-api-client/blob/main/MIGRATION_V3.md)
- [x] Identifier les breaking changes dans le code existant

### Phase 2: Adapter le code legacy v2 → v3 🔧

**Fonctions principales à migrer** (compatibilité v3):
- [x] Authentification:
  - Cloud: `me()` reste identique ✅
  - Hosted: `login()` reste identique ✅
- [x] Récupération sites:
  - `websites()` - structure réponse v3 compatible ✅
  - `selectSiteByDomain()` - aucun changement ✅
- [x] Statistiques principales:
  - `websiteStats(id, period, options)` - **FIX**: `.value` supprimé, `.prev` → `.comparison` ✅
  - `websitePageViews(id, period, options)` - structure wrapper déjà compatible ✅
  - `websiteMetrics(id, period, options)` - **FIX**: type `"url"` → `"path"` ✅
  - `websiteSessions(id, period, options)` - pagination compatible ✅

**Suppressions code legacy v2**:
- [x] Supprimer workarounds spécifiques v2.x - aucun détecté ✅
- [x] Supprimer détection de version (inutile) - pas implémenté ✅
- [x] Nettoyer compatibilité MySQL (v3 = PostgreSQL only) - N/A côté client ✅

**Changements appliqués** :
- `lib/services/umamiService.js` : `type: "url"` → `type: "path"` (ligne 59)
- `lib/services/reportGenerator.js` :
  - `.pageviews.value` → `.pageviews` (accès direct nombre)
  - `.visitors.value` → `.visitors`
  - `.bounces.value` → `.bounces`
  - `.totaltime.value` → `.totaltime`
  - `.pageviews.prev` → `.comparison.pageviews`
  - `.visitors.prev` → `.comparison.visitors`
  - `uniques` → `visitors` (champ renommé v3)

### Phase 3: Tests unitaires 🧪

- [x] Mettre à jour stubs Sinon pour réponses API v3 ✅
  - Tests utilisent vrais appels API (pas de mocks à adapter)
  - Tests d'intégration valident automatiquement v3
- [x] Adapter fixtures de test (structure réponses) ✅ N/A
- [x] Exécuter tests: `pnpm test` ✅
  - **13 passing (10s)**
  - Tests Cloud + Hosted + GitHub Action passent
- [ ] Vérifier coverage: `pnpm coverage`

### Phase 4: Tests locaux (Cloud + Hosted) 🚀

**Mode Cloud**:
- [ ] Configurer `.env` Cloud (voir template)
- [ ] Exécuter `pnpm day`
- [ ] Valider rapport `./umami/umamiReport.txt`

**Mode Hosted v3.x**:
- [x] Configurer `.env` Hosted v3 ✅
- [x] Exécuter `pnpm run month` (1month/day) ✅
  - 80 pageviews détectés
  - Comparaison période fonctionnelle
  - Events, sessions, URLs affichés
  - Rapport fichier généré (1866 chars)
- [x] Tester autres périodes: ✅
  - [x] `pnpm run day` (24h/hour) - 1 view ✅
  - [x] `pnpm run week` (1week/day) - 12 views ✅

### Phase 5: Documentation 📝

- [x] Mettre à jour `README.md`: ✅
  - ⚠️ Section **Breaking Change** ajoutée en haut
  - Support exclusif Umami v3.x mentionné
  - Compatibilité v2.x supprimée (référence v6.0.2 pour legacy)
  - Exemples mis à jour (Hosted + Cloud)
  - Section **Migration v6 → v7** ajoutée
- [x] Mettre à jour `action.yml`: ✅
  - Description enrichie (Umami v3.x)
  - Descriptions inputs clarifiées
  - Liens Cloud API keys ajoutés
- [x] Créer `CHANGELOG.md`: ✅
  - Breaking changes v2 → v3 documentés
  - Version Support Matrix ajoutée
  - Guide migration utilisateurs
  - Liens ressources Umami v3

## Breaking Changes v2 → v3

### Changements API Umami v3.x

**Abandonné**:
- ❌ MySQL support (PostgreSQL only)
- ❌ Compatibilité v2.x API endpoints
- ❌ Bug `verify()` résolu (anciennement issue #3339)

**Nouveautés v3** (disponibles mais non utilisées):
- 🔗 Links API (short URLs tracking) - cf. [issue_umami_v3_features.md](./issue_umami_v3_features.md)
- 📧 Pixels API (email opens, external tracking) - cf. [issue_umami_v3_features.md](./issue_umami_v3_features.md)
- ⏳ Segments & Cohorts (UI only, pas d'API client)

### Changements umami-api-client v3.0.3-beta.1

**Méthodes inchangées** (compatibles v3):
- `me()`, `login()`, `logout()`
- `websites()`, `selectSiteByDomain()`
- `websiteStats()`, `websitePageViews()`, `websiteMetrics()`, `websiteSessions()`

**Nouvelles méthodes v3** (non utilisées dans cette version):
- `links()`, `getLink()`, `linkStats()` - Links API (cf. [issue_umami_v3_features.md](./issue_umami_v3_features.md))
- `pixels()`, `getPixel()`, `pixelStats()` - Pixels API (cf. [issue_umami_v3_features.md](./issue_umami_v3_features.md))

**Structure réponses**:
- ✅ Validé : `websites()`, `websiteStats()`, `websitePageViews()`, `websiteMetrics()`, `websiteSessions()` compatibles v3

## Tests à effectuer

### Mode Cloud
```bash
# .env
export UMAMI_CLOUD_API_KEY="api_xxxyyyzzz"
export UMAMI_CLOUD_SITE_DOMAIN="example.com"
export UMAMI_PERIOD="24h"
export UMAMI_UNIT="hour"

pnpm day
```

### Mode Hosted
```bash
# .env
export UMAMI_SERVER="https://umami.exemple.com"
export UMAMI_USER="admin"
export UMAMI_PASSWORD="mypassword"
export UMAMI_SITE_DOMAIN="example.com"
export UMAMI_PERIOD="24h"
export UMAMI_UNIT="hour"

pnpm day
```

## Risques identifiés

- **Breaking change utilisateurs** :
  - ⚠️ Utilisateurs avec serveurs Umami v2.x ne pourront plus utiliser l'action
  - Nécessite communication claire (CHANGELOG, README, release notes)
  - Bump version majeure (ex: v2.x → v3.0.0)

- **Structure réponses API v3** :
  - Vérifier si changements dans `websites()`, `websiteStats()`, `websitePageViews()`
  - Tester avec vraies réponses Umami v3 (Cloud + Hosted)
  - Adapter parsing si nécessaire

- **Tests unitaires** :
  - Stubs Sinon à mettre à jour pour réponses v3
  - Fixtures de test à régénérer
  - Vérifier couverture après migration

- **Dépendances** :
  - `umami-api-client@3.0.3-beta.1` ⚠️ version beta (testing en cours)
  - Possibilité de bugs/changements avant release stable
  - Vérifier compatibilité autres dépendances (`@actions/core`, `dayjs`, etc.)
  - Suivre évolution vers v3.0.3 stable

## Ressources

### Umami Docs
- [Umami API Docs](https://umami.is/docs/api)
- [Umami v3 Release Notes](https://github.com/umami-software/umami/releases/tag/v3.0.0)
- [Umami v3 Blog Post](https://umami.is/blog/umami-v3)
- [Umami Releases](https://github.com/umami-software/umami/releases) - Latest: v3.0.3 (12 Dec 2025)
- [Umami Cloud API Keys](https://cloud.umami.is/api-keys)

### umami-api-client v3.0.3-beta.1
- [GitHub Repository](https://github.com/boly38/umami-api-client)
- [MIGRATION_V3.md](https://github.com/boly38/umami-api-client/blob/main/MIGRATION_V3.md) ⭐
- [README.md v3.0.3-beta.1](https://github.com/boly38/umami-api-client/blob/main/README.md)
- [npm package](https://www.npmjs.com/package/umami-api-client/v/3.0.3-beta.1)
- ~~Issue #43~~ - Résolu dans v3.0.3-beta.1 ✅
- ~~Issue #42~~ - Non implémenté (pas de `getVersion()`)

## Notes techniques

### Structure umami-api-client v3.0.3-beta.1

```
node_modules/umami-api-client/
├── src/UmamiClient.js    # Client principal
├── lib/export.js         # Export ES6
└── package.json          # version: 3.0.3-beta.1
```

**Méthodes héritées v2 (inchangées):**
- `constructor({cloudApiKey, server})` - détection mode Cloud/Hosted
- `isCloudMode()` - retourne true si cloudApiKey présent
- `login(username, password)` - Hosted mode only
- `me()` - Cloud mode (check apiKey)
- `websites()` - Liste sites
- `websiteStats(id, period, options)` - Stats principales
- `websitePageViews(id, period, options)` - PageViews avec unit/timezone
- `websiteMetrics(id, period, options)` - Metrics (type: event, url...)
- `websiteSessions(id, period, options)` - Sessions

**Nouvelles méthodes v3:**
- `links(options)` - Liste links (pagination)
- `getLink(linkId)` - Détails link
- `linkStats(linkId, period, options)` - Stats link (= `websiteStats`)
- `pixels(options)` - Liste pixels (pagination)
- `getPixel(pixelId)` - Détails pixel
- `pixelStats(pixelId, period, options)` - Stats pixel (= `websiteStats`)

**URLs générées:**
- Cloud: `https://api.umami.is/v1/*`
- Hosted: `<umami-server>/api/*`

**Notes:**
- Pas de méthode `getVersion()` (non implémenté)
- Links/Pixels API disponibles mais non utilisés (cf. [issue_umami_v3_features.md](./issue_umami_v3_features.md))

## Checkboxes globales

### Core migration
- [x] `umami-api-client` upgrade v3.0.3-beta.1 ✅
- [x] Code adapté (legacy v2 → v3) ✅
  - Fix #1: `type: "url"` → `"path"`
  - Fix #2: structure `siteStats` v3 (`.value` + `.prev` → direct + `.comparison`)
- [x] Tests unitaires passent (`pnpm test`) ✅
  - **13 passing (10s)**
- [ ] Mode Cloud validé (`pnpm day`)
- [x] Mode Hosted v3.x validé (`pnpm run month`) ✅

### Documentation
- [x] `README.md` mis à jour (breaking change) ✅
- [x] `CHANGELOG.md` créé ✅
- [x] `action.yml` mis à jour (descriptions) ✅

### Release
- [ ] Version bump majeure (v3.0.0)
- [ ] Release notes publiées
- [ ] Issue fermée ✅

---

**Date création**: 2026-01-19  
**Statut**: 🚧 En cours
