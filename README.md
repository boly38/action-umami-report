# action-umami-report

This [action](./action.yml) generates periodic umami reports into a given file, and action outputs.

Accepted periods are: 1h, 1d, 1w, 1m.

## Inputs

| input name             | required | description                             |
|------------------------|----------|-----------------------------------------|
| `umami-server`         | yes      | Umami server instance (*).              |
| `umami-user`           | yes      | Umami API user. Default `"admin"`.      | 
| `umami-password`       | yes      | Umami API password.                     | 
| `umami-site-domain`    | no       | Umami site domain name (*).             | 
| `umami-report-file`    | no       | Umami report file to generate.          | 
| `umami-report-content` | no       | Report content to generate (*).         | 
| `umami-period`         | no       | (main) Report data/analysis period (*). | 
| `umami-unit`           | no       | (main) Report interval unit (*).        | 
| `umami-tz`             | no       | (main) Report date time timezone (*).   | 

legend*:
- [Umami API](https://umami.is/docs/api) login expected to be available at `https://<umami-server>/api/auth/login`.
- `umami-site-domain` is the target analysis domain name, example `"www.mysite.com"` (select first domain by default ).
- `umami-report-content` default is `pageviews|events|urls` (stats is always reported).
- `umami-period` default is `24h` (means 24 hours). But you can switch it to `24h`/`7d`/`1w`/`31d`/`1m`.
- `umami-unit` default is `hour`. But you can switch it to `day` depend on the period you choose.
- `umami-tz` default is `Europe/Paris`. But you can switch it to another timezone supported by Umami API (ex. `America/Los_Angeles`).

## Action outputs

This action produces some "action results" where an action result is a `resultName`, and a `resultValue`.

Each action result is available as [output parameter](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter) : to use in following `step` or`job`

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
        uses: boly38/action-umami-report@umami-server-2.9.0
        with:
          umami-server: https://${{secrets.UMAMI_SERVER}}
          umami-user: ${{secrets.UMAMI_USERNAME}}
          umami-password: ${{secrets.UMAMI_PASSWORD}}
          umami-site-domain: ${{secrets.UMAMI_SITE_DOMAIN}}
          umami-report-file: 'umamiReport.md'

      - name: Send Umami report to discord channel
        uses: tsickert/discord-webhook@v4.0.0
        with:
          webhook-url: ${{ secrets.UMAMI_TO_DISCORD_WEBHOOK_URL }}
          content: ${{ steps.umamiReportStep.outputs.umamiOneLineReport }}
```
Full working sample: cf. [daily_umami_report.yml](.github/workflows/daily_umami_report.yml)

**TIP**: if your umami server version is not compatible with current GithubActions, you could change `umami-server-2.9.0` keyword by one of the [current repository tags](https://github.com/boly38/action-umami-report/tags) with `umami-server-x.y` format. 

# See also

## Umami
Umami server :
- [API](https://umami.is/docs/api) 
- [source](https://github.com/umami-software/umami)

Umami API clients:
- jakobbouchard TS/JS [umami-api-client](https://github.com/jakobbouchard/umami-api-client)
  - Import: `import UmamiApiClient from 'umami-api'`
- boly38 JS [umami-api-client](https://github.com/boly38/umami-api-client)
  - Import: `import UmamiClient from 'umami-api-client'` 

## possible next step
- send the report [by email](https://github.com/marketplace?type=actions&query=mail+), on [discord](https://github.com/marketplace?type=actions&query=discord+), etc..

# How to contribute
You're not a dev ? just submit an issue (bug, improvements, questions). 

Or else:
* Clone
* Install deps
* setup your test environment (cf. [initenv.template.sh](./env/initenv.template.sh))
```
cp ./env/initenv.template.sh ./env/initenv.dontpush.sh
. ./env/initenv.dontpush.sh
```
* Then run manual test
```
git clone https://github.com/boly38/action-umami-report.git
cd action-umami-report
npm install
npm run day
npm run showResults
# check other targets in package.json
```
* you could also fork, feature branch, then submit a pull request.


### Services or activated bots

- [Github actions](https://github.com/features/actions) - Continuous vulnerability audit.<br/>
[![scheduled npm audit](https://github.com/boly38/action-umami-report/actions/workflows/audit.yml/badge.svg)](https://github.com/boly38/action-umami-report/actions/workflows/audit.yml)
 
- [Houndci](https://houndci.com/) - JavaScript  automated review (configured by [`.hound.yml`](./.hound.yml)).<br/>
[<img src="https://cdn.icon-icons.com/icons2/2148/PNG/512/houndci_icon_132320.png" width="100">](https://houndci.com/)

- [gren](https://github.com/github-tools/github-release-notes) - [Release notes](https://github.com/boly38/action-umami-report/releases) automation.<br/>
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

