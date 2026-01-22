# Issue: Support des nouvelles features Umami v3 (Links & Pixels)

## Contexte

Suite à la migration vers **umami-api-client v3.0.3** (cf. [issue_umami_v3_compatibility.md](./issue_umami_v3_compatibility.md)), le projet supporte désormais **Umami v3.x**.

Cette issue concerne l'**ajout des nouvelles fonctionnalités** introduites par Umami v3 :
- 🔗 **Links API** : Tracking des short URLs
- 📧 **Pixels API** : Tracking des emails/images invisibles

## État actuel

### ✅ Implémenté (migration v3 de base)
- Statistiques classiques : `websiteStats`, `websitePageViews`, `websiteMetrics`, `websiteSessions`
- Authentification Cloud + Hosted
- Rapports : stats, pageviews, events, sessions, URLs

### 🆕 Disponible dans umami-api-client v3.0.3

**Links API** (read-only) :
- `links(options)` - Liste tous les links (pagination)
- `getLink(linkId)` - Détails d'un link
- `linkStats(linkId, period, options)` - Statistiques d'un link

**Pixels API** (read-only) :
- `pixels(options)` - Liste tous les pixels (pagination)
- `getPixel(pixelId)` - Détails d'un pixel
- `pixelStats(pixelId, period, options)` - Statistiques d'un pixel

**Non disponible** (use Umami UI) :
- ❌ Segments API
- ❌ Cohorts API
- ❌ Write operations (création/modification Links/Pixels)

## Objectifs

### Phase 1 : Analyse des besoins

- [ ] Identifier les use cases pour Links dans les rapports
- [ ] Identifier les use cases pour Pixels dans les rapports
- [ ] Décider si features activées par défaut ou opt-in (input parameter)

### Phase 2 : Implémentation Links API 🔗

**Backend** :
- [ ] Créer `lib/services/linksService.js`
  - Méthode `fetchLinksData(client, options)`
  - Parser les réponses API
- [ ] Intégrer dans `umamiService.js`
  - Appel conditionnel si Links présents
- [ ] Adapter `reportGenerator.js`
  - Nouvelle méthode `enrichReportWithLinks()`
  - Format rapport :
    ```
    ## 🔗 Links Performance
    - Total links: X
    - Top 5 most clicked:
      - XXX clicks [https://short.url/abc] → https://destination.com
      - YYY clicks [https://short.url/def] → https://other.com
    ```

**Inputs** :
- [ ] Ajouter input optionnel `umami-report-content` : support `links`
  - Exemple : `pageviews|events|sessions|urls|links`

**Tests** :
- [ ] Tests unitaires `linksService.test.js`
- [ ] Tests manuels : `manual/manual_links.js`
- [ ] Valider sur vraie instance Umami v3 avec Links

### Phase 3 : Implémentation Pixels API 📧

**Backend** :
- [ ] Créer `lib/services/pixelsService.js`
  - Méthode `fetchPixelsData(client, options)`
  - Parser les réponses API
- [ ] Intégrer dans `umamiService.js`
  - Appel conditionnel si Pixels présents
- [ ] Adapter `reportGenerator.js`
  - Nouvelle méthode `enrichReportWithPixels()`
  - Format rapport :
    ```
    ## 📧 Pixels Performance
    - Total pixels: X
    - Top 5 by opens:
      - XXX opens [email-campaign-jan] (open rate: YY%)
      - ZZZ opens [newsletter-weekly] (open rate: WW%)
    ```

**Inputs** :
- [ ] Ajouter support `pixels` dans `umami-report-content`
  - Exemple : `pageviews|events|sessions|urls|links|pixels`

**Tests** :
- [ ] Tests unitaires `pixelsService.test.js`
- [ ] Tests manuels : `manual/manual_pixels.js`
- [ ] Valider sur vraie instance Umami v3 avec Pixels

### Phase 4 : Documentation

- [ ] Mettre à jour `README.md` :
  - Section "Features Umami v3"
  - Exemples d'utilisation Links/Pixels
  - Screenshots de rapports
- [ ] Mettre à jour `action.yml` :
  - Description input `umami-report-content`
  - Mentionner support Links/Pixels
- [ ] Créer exemples workflows :
  - `.github/workflows/example_links_report.yml`
  - `.github/workflows/example_pixels_report.yml`

### Phase 5 : Tests & Validation

- [ ] Tests d'intégration complets
- [ ] Validation Cloud mode (Links/Pixels)
- [ ] Validation Hosted mode (Links/Pixels)
- [ ] Coverage > 80%

## Spécifications techniques

### Structure de données Links

**Réponse `links()`** (paginée) :
```json
{
  "data": [
    {
      "id": "link-uuid",
      "url": "https://destination.com",
      "slug": "abc123",
      "domain": "short.url",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "count": 10,
  "page": 1,
  "pageSize": 10
}
```

**Réponse `linkStats(linkId, period)`** :
```json
{
  "pageviews": 150,
  "visitors": 45,
  "visits": 60,
  "bounces": 5,
  "totaltime": 3600,
  "comparison": { ... }
}
```

### Structure de données Pixels

**Réponse `pixels()`** (paginée) :
```json
{
  "data": [
    {
      "id": "pixel-uuid",
      "name": "Email Campaign Jan",
      "slug": "email-jan",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "count": 5,
  "page": 1,
  "pageSize": 10
}
```

**Réponse `pixelStats(pixelId, period)`** :
```json
{
  "pageviews": 200,  // = opens
  "visitors": 150,   // = unique opens
  "visits": 160,
  "bounces": 0,
  "totaltime": 0,
  "comparison": { ... }
}
```

### Calculs métriques

**Open rate (Pixels)** :
```javascript
const openRate = (visitors / totalEmailsSent) * 100;
// Note: totalEmailsSent doit être fourni en contexte (metadata?)
```

**Click rate (Links)** :
```javascript
const clickRate = (visitors / totalImpressions) * 100;
// Note: totalImpressions doit être fourni en contexte
```

## Options de design

### Option A : Opt-in explicite (recommandé)

```yaml
- uses: boly38/action-umami-report@v7.1.0
  with:
    umami-report-content: 'pageviews|events|links|pixels'
```

**Avantages** :
- ✅ Pas de breaking change
- ✅ Performances : pas d'appels API inutiles
- ✅ Rétrocompatible

**Inconvénients** :
- ❌ Utilisateurs doivent découvrir la feature

### Option B : Auto-détection

Le service détecte automatiquement si des Links/Pixels existent et les inclut.

**Avantages** :
- ✅ Découverte automatique
- ✅ UX simplifiée

**Inconvénients** :
- ❌ Appels API supplémentaires même si non utilisés
- ❌ Complexité accrue

**→ Recommandation** : **Option A** (opt-in)

## Risques identifiés

- **Performances** :
  - Appels API supplémentaires (pagination Links/Pixels)
  - Impact sur timeout GitHub Actions
  - → Mitigation : pagination limitée (top 10)

- **Disponibilité features** :
  - Links/Pixels pas disponibles sur toutes instances v3
  - → Mitigation : gestion erreurs 404 gracieuse

- **Complexité rapports** :
  - Rapports trop longs/verbeux
  - → Mitigation : section optionnelle, limite top 5/10

## Dépendances

- ✅ `umami-api-client@3.0.3-beta.1` installé
- ✅ Migration v3 terminée (issue_umami_v3_compatibility.md)
- ⏳ Accès à instance Umami v3 avec Links/Pixels pour tests

## Ressources

### Documentation Umami v3
- [Umami v3 Blog Post](https://umami.is/blog/umami-v3) - Annonce Links/Pixels
- [Umami API Docs](https://umami.is/docs/api) - Endpoints officiels
- [Umami v3 Release Notes](https://github.com/umami-software/umami/releases/tag/v3.0.0)

### umami-api-client
- [README.md v3.0.3](https://github.com/boly38/umami-api-client/blob/main/README.md)
- Section "Links API" - Exemples d'utilisation
- Section "Pixels API" - Exemples d'utilisation

## Checkboxes globales

### Phase 1 : Analyse
- [ ] Use cases Links identifiés
- [ ] Use cases Pixels identifiés
- [ ] Design opt-in validé

### Phase 2 : Links API
- [ ] Service `linksService.js` créé
- [ ] Intégration `umamiService.js`
- [ ] Rapport `enrichReportWithLinks()`
- [ ] Tests passent

### Phase 3 : Pixels API
- [ ] Service `pixelsService.js` créé
- [ ] Intégration `umamiService.js`
- [ ] Rapport `enrichReportWithPixels()`
- [ ] Tests passent

### Phase 4 : Documentation
- [ ] `README.md` mis à jour
- [ ] `action.yml` mis à jour
- [ ] Exemples workflows créés

### Phase 5 : Release
- [ ] Tests d'intégration validés
- [ ] Coverage > 80%
- [ ] Version bump (v7.1.0)
- [ ] Release notes publiées
- [ ] Issue fermée ✅

---

**Date création** : 2026-01-22  
**Statut** : 📋 Backlog  
**Priorité** : 🟡 Medium (feature optionnelle)  
**Dépend de** : [issue_umami_v3_compatibility.md](./issue_umami_v3_compatibility.md) ✅
