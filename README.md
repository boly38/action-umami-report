# action-umami-report

This [action](./action.yml) generates periodic umami reports into a given file, and action outputs.

Accepted periods are: 1h, 1d, 1w, 1m.

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

```yaml
jobs:
  umamiReport:
    name: umami report example
    runs-on: ubuntu-latest

    steps:
      - name: Create Umami report
        id: umamiReport
        uses: boly38/action-umami-report@umami-server-2.17.0
        with:
          umami-server: ${{secrets.UMAMI_SERVER}}
          umami-user: ${{secrets.UMAMI_USERNAME}}
          umami-password: ${{secrets.UMAMI_PASSWORD}}
          umami-site-domain: ${{secrets.UMAMI_SITE_DOMAIN}}
          umami-report-file: 'umamiReport.md'

      - name: Send report to discord if pageViews is positive
        if: steps.umamiReportStep.outputs.pageViews != '0'
        uses: tsickert/discord-webhook@v7.0.0
        with:
          webhook-url: ${{ secrets.UMAMI_TO_DISCORD_WEBHOOK_URL }}
          username: "Umami report"
          content: "${{ steps.umamiReportStep.outputs.umamiOneLineReport }}"
          filename: "${{ steps.umamiReportStep.outputs.umamiReportFile }}"
          # avatar-url: ..set user logo
```

cf. working sample: cf. [(full) daily yml](.github/workflows/cron_daily_umami_report.yml) or [(min) weekly yml](.github/workflows/cron_weekly_umami_report.yml)

**TIP**: if your umami server version is not compatible with current GithubActions, you could change
`umami-server-2.17.0` keyword by one of
the [current repository branches](https://github.com/boly38/action-umami-report/branches) with `umami-server-x.y.z` format.

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

| ![CI/CD](https://github.com/boly38/action-umami-report/workflows/main_ci_and_package_action/badge.svg) | [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/) | [<img src="https://cdn.icon-icons.com/icons2/2148/PNG/512/houndci_icon_132320.png" width="40">](https://houndci.com/) | [<img src="https://codetheweb.blog/assets/img/posts/github-pages-free-hosting/cover.png" width="100">](https://boly38.github.io/action-umami-report/) |
|------------------------------------------------------------------------------------------------| ---- | ---- | ---- |

- Github actions : continuous tests + coverage using [c8](https://www.npmjs.com/package/c8) reported on github pages [website](https://boly38.github.io/action-umami-report/)
- Github security checks activated
- [Houndci](https://houndci.com/) : JavaScript  automated review (configured by `.hound.yml`)
- [gren](https://github.com/github-tools/github-release-notes) : [Release notes](https://github.com/boly38/action-umami-report/releases) automation
- Github pages [website](https://boly38.github.io/action-umami-report/) hosts some metrics for the main branch of this project: [code coverage](https://boly38.github.io/action-umami-report/)



