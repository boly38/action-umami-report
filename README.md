# action-umami-report

⚠️ **Version 7.0.0** - **Breaking Change: Umami v3.x only**

This [action](./action.yml) generates periodic umami reports into a given file, and action outputs.

**Compatibility:**
- ✅ **Umami v3.x** (Cloud & Hosted)
- ❌ **Umami v2.x** - Use `v6.0.2` or earlier ([migration guide](#migration-from-v6-to-v7))

Accepted periods are: 1h, 24h, 7d, 1w, 30d, 1m.

## Inputs

| input name             | required | description                             |
|------------------------|----------|-----------------------------------------|
| `umami-cloud-api-key`  | (1)      | Umami Cloud API key .                   |
| `umami-server`         | (2)      | Umami server instance .                 |
| `umami-user`           | (2)      | Umami API user. Default `"admin"`.      | 
| `umami-password`       | (2)      | Umami API password.                     | 
| `umami-site-domain`    | no       | Umami site domain name (*).             | 
| `umami-report-file`    | no       | Umami report file to generate.          | 
| `umami-report-content` | no       | Report content to generate (*).         | 
| `umami-period`         | no       | (main) Report data/analysis period (*). | 
| `umami-unit`           | no       | (main) Report interval unit (*).        | 
| `umami-tz`             | no       | (main) Report date time timezone (*).   | 

legend(1)(2):

- (1) `umami-cloud-api-key` is required for Umami [CLOUD](https://cloud.umami.is/) mode ([create yours](https://cloud.umami.is/api-keys))
- (2) `umami-server` `umami-user` `umami-password` is required for Umami Hosted mode
- (2) [Umami API](https://umami.is/docs/api) login expected to be available at `<umami-server>/api/auth/login`.

  legend*:
- `umami-site-domain` is the target analysis domain name, example `"www.mysite.com"` (select first domain by default ).
- `umami-report-content` default is `pageviews|events|sessions|urls` (stats is always reported).
- `umami-period` default is `24h` (means 24 hours). But you can switch it to `24h`/`7d`/`1w`/`31d`/`1m`.
- `umami-unit` default is `hour`. But you can switch it to `day` depend on the period you choose.
- `umami-tz` default is `Europe/Paris`. But you can switch it to another timezone supported by Umami API (ex.
  `America/Los_Angeles`).

## Action outputs

This action produces some "action results" where an action result is a `resultName`, and a `resultValue`.

Each action result is available
as [output parameter](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter) :
to use in following `step` or`job`

| resultName           | resultValue        | description                     |
|----------------------|--------------------|---------------------------------|
| `pageViews`          | integer            | number of pageView in last 24h  |
| `umamiOneLineReport` | string             | short summary of domain stats   | 
| `umamiReport`        | multi-lines string | detailed report of domain stats | 
| `umamiReportLength`  | int                | v1.2, detailed report length    | 

## Action generated file

When an `umami-report-file` is set, the target file is written in `./umami/<umami-report-file>`.

## Example usage

### Umami Hosted (self-hosted v3.x)

```yaml
jobs:
  umamiReport:
    name: umami report example
    runs-on: ubuntu-latest

    steps:
      - name: Create Umami report
        id: umamiReport
        uses: boly38/action-umami-report@v7
        with:
          umami-server: ${{secrets.UMAMI_SERVER}}
          umami-user: ${{secrets.UMAMI_USERNAME}}
          umami-password: ${{secrets.UMAMI_PASSWORD}}
          umami-site-domain: ${{secrets.UMAMI_SITE_DOMAIN}}
          umami-report-file: 'umamiReport.md'

      - name: Send report to discord if pageViews is positive
        if: steps.umamiReport.outputs.pageViews != '0'
        uses: tsickert/discord-webhook@v7.0.0
        with:
          webhook-url: ${{ secrets.UMAMI_TO_DISCORD_WEBHOOK_URL }}
          username: "Umami report"
          content: "${{ steps.umamiReport.outputs.umamiOneLineReport }}"
          filename: "${{ steps.umamiReport.outputs.umamiReportFile }}"
```

### Umami Cloud

```yaml
jobs:
  umamiReport:
    name: umami cloud report
    runs-on: ubuntu-latest

    steps:
      - name: Create Umami report
        id: umamiReport
        uses: boly38/action-umami-report@v7
        with:
          umami-cloud-api-key: ${{secrets.UMAMI_CLOUD_API_KEY}}
          umami-site-domain: ${{secrets.UMAMI_CLOUD_SITE_DOMAIN}}
          umami-report-file: 'umamiReport.md'
```

cf. working sample: cf. [(full) daily yml](.github/workflows/cron_daily_umami_report.yml) or [(min) weekly yml](.github/workflows/cron_weekly_umami_report.yml)

## Migration from v6 to v7

### Breaking Changes

**v7.0.0** drops support for **Umami v2.x** servers.

| Version | Umami Support | Status |
|---------|---------------|--------|
| **v7.x** | **Umami v3.x only** | ✅ Current |
| v6.x | Umami v2.x | ❌ EOL |

### What changed?

1. **`umami-api-client` upgraded** to v3.0.3 (Umami v3.x compatible)
2. **API response structure** changed:
   - `siteStats.pageviews.value` → `siteStats.pageviews` (direct number)
   - `siteStats.pageviews.prev` → `siteStats.comparison.pageviews`
   - Metrics type `"url"` → `"path"`
3. **No code changes required** for users (inputs/outputs unchanged)

### Migration steps

**If using Umami v3.x** (✅ recommended):
```yaml
# Update your workflow
- uses: boly38/action-umami-report@v7  # ← Change from v6 to v7
```

**If still using Umami v2.x** (⚠️ legacy):
```yaml
# Stay on v6 until you upgrade Umami server
- uses: boly38/action-umami-report@v6.0.2
```

**Resources:**
- [Umami v3 Release Notes](https://umami.is/blog/umami-v3)
- [CHANGELOG.md](./CHANGELOG.md)
- [Migration Issue](./.github/issue_umami_v3_compatibility.md)

---

# See also

## Contribute
- cf [CONTRIBUTING.md](./.github/CONTRIBUTING.md)

## Umami

Umami server : [API](https://umami.is/docs/api) - [source](https://github.com/umami-software/umami)

Umami API clients:

- boly38 JS [umami-api-client](https://github.com/boly38/umami-api-client)
  - Import: `import UmamiClient from 'umami-api-client'`
- (archived) jakobbouchard TS/JS [umami-api-client](https://github.com/jakobbouchard/umami-api-client)
  - Import: `import UmamiApiClient from 'umami-api'`


## possible next step

- send the report [by email](https://github.com/marketplace?type=actions&query=mail+),
  on [discord](https://github.com/marketplace?type=actions&query=discord+), etc..

### Services or activated bots

- GitHub actions : continuous tests + coverage using [c8](https://www.npmjs.com/package/c8) reported on github pages [website](https://boly38.github.io/action-umami-report/)
- GitHub security checks activated
- [Houndci](https://houndci.com/) : JavaScript  automated review (configured by `.hound.yml`)
- GitHub client to automate release creation and actions local test (with act extension)
- GitHub pages [website](https://boly38.github.io/action-umami-report/) hosts some metrics for the main branch of this project: [code coverage](https://boly38.github.io/action-umami-report/)



