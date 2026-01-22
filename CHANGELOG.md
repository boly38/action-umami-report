# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [7.0.0] - 2026-01-22

### ⚠️ BREAKING CHANGES

**Umami v3.x only** - This version drops support for Umami v2.x servers.

- **Removed**: Compatibility with Umami v2.x API
- **Required**: Umami Cloud or Umami Hosted v3.0.0+
- **Migration**: See [README.md - Migration Guide](./README.md#migration-from-v6-to-v7)

### Changed

- **Upgraded** `umami-api-client` from `2.17.3` to `3.0.3-beta.1`
  - Targets Umami v3.x API exclusively
  - See [umami-api-client MIGRATION_V3.md](https://github.com/boly38/umami-api-client/blob/main/MIGRATION_V3.md)

- **Fixed** API response parsing for Umami v3:
  - Stats values: `siteStats.pageviews.value` → `siteStats.pageviews` (direct number)
  - Comparison data: `siteStats.*.prev` → `siteStats.comparison.*`
  - Metrics type: `type: "url"` → `type: "path"`
  - Visitors field: `uniques` → `visitors`

- **Updated** dependencies:
  - `dayjs`: `1.11.18` → `1.11.19`
  - `mocha`: `11.7.4` → `11.7.5`

### Technical Details

**Modified files:**
- `lib/services/umamiService.js` - Metrics type `"url"` → `"path"`
- `lib/services/reportGenerator.js` - Stats structure v3 (direct values + `.comparison`)

**Tests:**
- ✅ All 13 tests passing (integration tests with real Umami v3 API)
- ✅ Validated on Umami Hosted v3.0.3
- ✅ Periods tested: 24h, 1week, 1month

**Not included** (planned for v7.1.0):
- Links API (short URLs tracking)
- Pixels API (email opens tracking)
- See [issue_umami_v3_features.md](./.github/issue_umami_v3_features.md)

### Resources

- [Umami v3 Release Notes](https://github.com/umami-software/umami/releases/tag/v3.0.0)
- [Umami v3 Blog Post](https://umami.is/blog/umami-v3)
- [Migration Issue](./.github/issue_umami_v3_compatibility.md)

---

## [6.0.2] - 2024-XX-XX

### Changed
- Last version supporting Umami v2.x
- Uses `umami-api-client@2.17.3`

### Deprecated
- ⚠️ Umami v2.x support will be removed in v7.0.0

---

## [6.0.0] - 2023-XX-XX

### Added
- Umami Cloud support (API key authentication)
- Dual mode: Cloud + Hosted

### Changed
- Node.js 20 required (ESM modules)

---

## [5.x] and earlier

See [GitHub Releases](https://github.com/boly38/action-umami-report/releases) for older versions.

---

## Version Support Matrix

| action-umami-report | umami-api-client | Umami Server | Node.js | Status |
|---------------------|------------------|--------------|---------|--------|
| **v7.x** | v3.0.3 | **v3.x** | 20 | ✅ **Current** |
| v6.x | v2.17.3 | v2.x | 20 | ❌ EOL |
| v5.x | v2.x | v2.x | 16-20 | ❌ EOL |

---

## Links

- [GitHub Repository](https://github.com/boly38/action-umami-report)
- [Issues](https://github.com/boly38/action-umami-report/issues)
- [Releases](https://github.com/boly38/action-umami-report/releases)
- [Umami Official Docs](https://umami.is/docs)
