# Projet action-umami-report - Agent Context

## Stack

- **Runtime**: Node.js 20 (ESM modules)
- **GitHub Action**: Node20 runtime
- **Dependencies**: @actions/core, umami-api-client, axios, dayjs
- **Tests**: Mocha + Chai + Sinon + c8 (coverage)

## Principes

- **SOLID**: Single Responsibility, Dependency Injection
- **KISS**: Code simple, éviter sur-engineering
- **DRY**: Réutiliser composants/services existants
- **Tests**: Privilégier testabilité (injection dépendances)

## Workflow développement

1. **Analyser l'existant** avant toute modification
2. **Service first**: Service → Mapper → Action wrapper
3. **Tests**: Écrire/adapter tests (Mocha) avant commit
4. **Tests manuels**: Scripts `manual/*.js` pour validation locale
5. **Documentation**: Mettre à jour `.github/` si feature importante

## Structure projet

```
index.js                  ← Entry point GitHub Action
lib/umamiReport.js        ← Main orchestrator
lib/services/             ← Services métier (githubAction, umamiService, reportGenerator)
lib/services/mapper/      ← Mappers données Umami API
lib/services/beta/        ← Features expérimentales
tests/*.test.js           ← Tests Mocha (0_env, 1-4_specific)
manual/*.js               ← Scripts test manuel (24h, 1w, 1m...)
env/                      ← Templates config locale (.env, init scripts)
.github/                  ← Documentation workflows/contributing
```

## Outils IDE (MCP IntelliJ)

**PRIORITÉ ABSOLUE**: Utiliser fonctions natives IDE plutôt que scripts shell

### Préférer

- ✅ **Refactor** → Rename / Extract Method / Move
- ✅ **Search** → Find in Files / Find Usages
- ✅ **Navigate** → Go to Declaration / Class
- ✅ **Git** → Commit / Diff / History (UI intégrée)
- ✅ **Tests** → Voir `backend/tests/README.md`

### Éviter

- ❌ Scripts bash complexes (sed, awk, grep) → Utiliser Search/Replace IDE
- ❌ find/mv en masse → Utiliser Refactor IDE
- ❌ `npm` → **Toujours utiliser `pnpm`**

### Exceptions acceptées

- Installation: `pnpm install`
- Tests: `pnpm run test` ou `pnpm run ci-test` (coverage)
- Scripts manuels: `pnpm run day|week|month` (cf. package.json)
- Debug: `export UMAMI_DEBUG_ACTION=true`

## Documentation

Toute feature importante doit avoir :

1. **Issue file** `.github/issue_*.md` avec plan action et checkboxes
2. **Update file** au commit final (résumé changements)
3. **Agent.md update** si patterns/règles changent

**Contrainte agent.md** :
- ✅ Essentiel uniquement (patterns, règles strictes)
- ❌ PAS d'exemples verbeux, duplication, explications longues
- 🎯 Optimiser tokens : concis, dense, utile

**Références clés** :
- Tests: `tests/TestsReadme.md` + tests/*.test.js
- Action config: `action.yml`
- Contributing: `.github/CONTRIBUTING.md`
- Testing Action: `.github/TESTING_ACTION.md`

## Conventions globales

- **Branches**: feature/xxx, fix/xxx, `umami-server-x.y.z` pour compatibilité versions
- **Commits**: Messages clairs anglais (projet open-source international)
- **Code**: Anglais (noms variables/fonctions), commentaires anglais
- **Logs**: `core.info()` / `core.error()` pour GitHub Actions
- **ESM**: Imports avec `.js` explicites (ex: `import x from './x.js'`)
- **Tests Mocha**: PAS de arrow functions (besoin `this.skip()`)
