# action-umami-report

This [action](./action.yml) generates periodic umami reports into a given file, and action outputs.

Accepted periods are: 1h, 1d, 7d, 30d, 31d.

## Inputs

| input name             | required | description                        |
|------------------------|----------|------------------------------------|
| `umami-server`         | yes      | Umami server instance (*).         |
| `umami-user`           | yes      | Umami API user. Default `"admin"`. | 
| `umami-password`       | yes      | Umami API password.                | 
| `umami-site-domain`    | no       | Umami site domain name (*).        | 
| `umami-report-file`    | no       | Umami report file to generate.     | 
| `umami-report-content` | no       | Report content to generate (*).    | 
| `umami-period`         | no       | (main) Report data/analysis period (*).   | 
| `umami-unit`           | no       | (main) Report interval unit (*).          | 
| `umami-tz`             | no       | (main) Report date time timezone (*).     | 

legend*:
- [Umami API](https://umami.is/docs/api) login expected to be available at `<umami-server>/api/auth/login`.
- `umami-site-domain` is the target analysis domain name, example `"www.mysite.com"` (select first domain by default ).
- `umami-report-content` default is `pageviews|events|urls` (stats is always reported).
- `umami-period` default is `24h` (means 24 hours). But you can switch it to `1h`/`7d`/`30d`/`31d`.
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
        uses: boly38/action-umami-report@stable
        with:
          umami-server: ${{secrets.UMAMI_SERVER}}
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

# See also

## Umami
- Umami [API](https://umami.is/docs/api) ([API client](https://github.com/jakobbouchard/umami-api-client))- [Source](https://github.com/umami-software/umami)

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
git clone https://github.com/boly38y/action-umami-report.git
cd action-umami-report
npm install
npm manual.js
```
* you could also fork, feature branch, then submit a pull request.


### Services or activated bots

| badge                                                                                                                                                                                     | name                                                         | description                                                                        |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|:-----------------------------------------------------------------------------------|
| [![scheduled npm audit](https://github.com/boly38/action-umami-report/actions/workflows/audit.yml/badge.svg)](https://github.com/boly38/action-umami-report/actions/workflows/audit.yml)  | Github actions                                               | Continuous vulnerability audit.                                                    
| [<img src="https://cdn.icon-icons.com/icons2/2148/PNG/512/houndci_icon_132320.png" width="100">](https://houndci.com/)                                                                    | [Houndci](https://houndci.com/)                              | JavaScript  automated review (configured by `.hound.yml`)                          |
| [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)                          | [gren](https://github.com/github-tools/github-release-notes) | [Release notes](https://github.com/boly38/action-umami-report/releases) automation |

