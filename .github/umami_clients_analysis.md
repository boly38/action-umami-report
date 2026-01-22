# Umami API Clients - Competitive Analysis

**Date**: 2026-01-19  
**Context**: Recherche alternatives à `boly38/umami-api-client` pour compatibilité Umami v3

---

## 🔍 Résultats de recherche GitHub

**Query**: `umami api client`  
**Résultats**: 5 repositories

---

## 📊 Clients identifiés

### 1. ⭐ **umami-software/api-client** (OFFICIEL)

**Repo**: https://github.com/umami-software/api-client  
**NPM**: `@umami/api-client`

#### Stats
- **Stars**: 40 ⭐
- **Forks**: 19
- **Issues**: 9 ouvertes
- **Langage**: TypeScript (93.1%) + JavaScript (6.9%)
- **Licence**: MIT
- **Contributors**: 9 (mikecao, briancao, franciscao633, belastrittmatter...)

#### Activité récente
- **Dernier commit**: **22 Aug 2025** (5 mois)
- **Dernière release**: Aucune release publiée ⚠️
- **Commits 2025**: 
  - Aug 22: Merge PR #23 (fixes)
  - Aug 18: Rename metric axis labels
  - Jul 25: Added batch method, removed config endpoint
  - May 30: Added missing routes
  - May 3: Merge PRs #21, #22 (fixes)
  - Mar 20: **Added report methods** 🆕

#### Version actuelle (package.json)
- **v0.77** (Feb 2025)

#### Support Umami
- ✅ Umami v2.x (confirmé)
- ❓ Umami v3.x (pas de mention explicite)
- ⚠️ Dernière activité : Aug 2025 (avant Umami v3.0.0 - Nov 2025)

#### Endpoints disponibles (dernière version)
- ✅ Websites, Stats, PageViews, Metrics, Sessions
- ✅ Reports (ajouté Mar 2025)
- ✅ Batch method (ajouté Jul 2025)
- ✅ Teams, Users
- ❌ Links (v3)
- ❌ Pixels (v3)
- ❌ Segments (v3)

#### Verdict
- **Officiel** mais **PAS maintenu activement** pour v3
- Dernière activité **avant** sortie Umami v3
- **Aucune release NPM** = pas de versioning clair
- **Pas de support v3 confirmé**

---

### 2. ❌ **imjuniper/umami-api-client** (ARCHIVED)

**Repo**: https://github.com/imjuniper/umami-api-client  
**Status**: 🗄️ **Public archive**

#### Stats
- **Stars**: 12 ⭐
- **Forks**: ?
- **Langage**: TypeScript
- **Dernière MAJ**: Mar 21, 2025

#### Verdict
- ❌ **Abandonné** (archived)
- Ne pas utiliser

---

### 3. 🔧 **AdamShannag/umami-client** (Go)

**Repo**: https://github.com/AdamShannag/umami-client

#### Stats
- **Stars**: 7 ⭐
- **Langage**: **Go**
- **Dernière MAJ**: Nov 13, 2025

#### Verdict
- ❌ **Langage incompatible** (Go, pas JavaScript/TypeScript)
- Activité récente mais pas pertinent pour projet Node.js

---

### 4. 🛠️ **boly38/umami-api-client** (NOTRE CLIENT)

**Repo**: https://github.com/boly38/umami-api-client  
**NPM**: `umami-api-client`

#### Stats
- **Stars**: 1 ⭐
- **Langage**: JavaScript (ESM)
- **Version**: 2.17.3
- **Dernière MAJ**: Jun 12, 2025

#### Support
- ✅ Umami v2.17.x
- ✅ Mode Cloud + Hosted
- ❌ Umami v3.x (pas encore)

#### Verdict
- ✅ **Notre client** actuellement utilisé
- ⚠️ Nécessite mise à jour v3

---

### 5. ⚠️ **aatuh/api-boilerplate-core**

**Repo**: https://github.com/aatuh/api-boilerplate-core

#### Verdict
- ❌ **Pas un client Umami** (boilerplate Next.js SaaS générique)
- Faux positif de recherche

---

## 🎯 Conclusion & Recommandation

### État des lieux

| Client | Officiel | Actif | Umami v3 | TypeScript | NPM | Recommandation |
|--------|----------|-------|----------|------------|-----|----------------|
| **@umami/api-client** | ✅ | ⚠️ | ❌ | ✅ | ❌ | **ATTENDRE** |
| **umami-api-client** (boly38) | ❌ | ✅ | ❌ | ❌ | ✅ | **MAINTENIR** |
| imjuniper | ❌ | ❌ | ❌ | ✅ | ? | **ÉVITER** |
| AdamShannag (Go) | ❌ | ⚠️ | ❌ | ❌ | ❌ | **INCOMPATIBLE** |

### 🚨 Problème identifié

**AUCUN client JavaScript/TypeScript n'est compatible Umami v3 à ce jour !**

- Le client **officiel** (@umami/api-client) n'a **pas de release** et n'a **pas été mis à jour depuis Aug 2025** (avant v3.0.0)
- Notre client (boly38) est aligné sur v2.17.x uniquement

### 💡 Stratégie recommandée

#### Option A : **Maintenir notre client** (RECOMMANDÉ)

**Avantages**:
- ✅ Contrôle total du code
- ✅ Déjà publié sur NPM
- ✅ Utilisé en production (action-umami-report)
- ✅ JavaScript ESM (simple, pas de compilation)
- ✅ Tests existants

**Actions**:
1. Implémenter support v3 (via issues créées)
2. Publier version 3.0.0 ou 2.18.0
3. Maintenir compatibilité v2 + v3

#### Option B : Contribuer au client officiel

**Avantages**:
- ✅ Écosystème officiel Umami
- ✅ TypeScript (meilleur typage)

**Inconvénients**:
- ❌ Pas de releases (processus unclear)
- ❌ Activité irrégulière
- ❌ Pas de roadmap v3 visible
- ❌ Dépendance externe

#### Option C : Fork du client officiel

**Inconvénients**:
- ❌ Duplication d'efforts
- ❌ TypeScript = compilation nécessaire
- ❌ Perte de temps

---

## 🎬 Action immédiate

**DÉCISION**: **Maintenir `boly38/umami-api-client`** et l'upgrader vers v3

**Justification**:
1. Aucune alternative viable
2. Client officiel non maintenu pour v3
3. Contrôle total + agilité
4. Déjà en production

**Next steps**:
1. ✅ Issues créées (v3 support + getVersion)
2. ⏳ Implémenter v3 endpoints (2-3 jours)
3. ⏳ Tester contre Umami v3.0.3
4. ⏳ Publier npm 3.0.0 ou 2.18.0
5. ⏳ Mettre à jour action-umami-report

---

**Dernière mise à jour**: 2026-01-19  
**Analyse par**: AI Agent (Continue.dev)
