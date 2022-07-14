# umami-api-client

[![NPM](https://nodei.co/npm/umami-api-client.png?compact=true)](https://npmjs.org/package/umami-api-client)

Umami [ReST API](https://umami.is/docs/api).

- compatible with JavaScript.

## UmamiClient
Features

using apiKey:
- login
- getSites
- getStats, getPageViews, getEvents, getMetrics

accepted periods are : `1h`, `1d`, `7d`, `30d`, `31d`.

# Quick start

First setup your environment
```
cp ./env/initenv.template.sh ./env/initenv.dontpush.sh
# update ./env/initenv.dontpush.sh
. ./env/initenv.dontpush.sh
```

install umami-api-client

```
npm install umami-api-client
```

then let's go, here is a `sample.js`:
```
import UmamiClient from 'umami-api-client';
async function doIt() {
  try {
    var client = new UmamiClient();
    var authData = await client.login(); 
    // default is // client.login(process.env.UMAMI_USER, process.env.UMAMI_PASSWORD)
    var sitesData = await client.getSites(authData);
    console.log(sitesData);
  } catch(error) {
    console.error(error);
  }
}
doIt();
```
You could play mocha tests to get more examples (cf. next section).

You could avoid using environment variable by using constructor options:
```
var client = new UmamiClient({server:'umami.exemple.com'});
```

## Advanced usage


### UmamiClient options
This section describes UmamiClient available options.

Note about options precedence: 
- first take option value from constructor if any, 
- or else try to retrieve related environment variable, 
- or else apply default value.

Options:
- `server` : Umami endpoint - (or env.`UMAMI_SERVER`).

## How to contribute
You're not a dev ? just submit an issue (bug, improvements, questions). Or else:
* Clone
* Install deps
* setup your test environment (cf. [initenv.dontpush.sh](./env/initenv.dontpush.sh))
* Then mocha tests
```
git clone https://github.com/boly38/umami-api-client.git
cd umami-api-client
npm install
# play test without umami endpoint
npm run test
# play test with umami endpoint
. ./env/initenv.dontpush.sh
npm run test
```
* you could also fork, feature branch, then submit a pull request.

### Services or activated bots

| badge                                                                                                                                                                                      | name   | description  |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|:--------|
| ![CI/CD](https://github.com/boly38/umami-api-client/workflows/umami_api_client_ci/badge.svg)                                                                                               |Github actions|Continuous tests + coverage using [c8](https://www.npmjs.com/package/c8).
| [![scheduled npm audit](https://github.com/boly38/umami-api-client/actions/workflows/audit.yml/badge.svg)](https://github.com/boly38/umami-api-client/actions/workflows/audit.yml) |Github actions|Continuous vulnerability audit.
| [<img src="https://cdn.icon-icons.com/icons2/2148/PNG/512/houndci_icon_132320.png" width="100">](https://houndci.com/)                                                                     |[Houndci](https://houndci.com/)|JavaScript  automated review (configured by `.hound.yml`)|
| [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)                           |[gren](https://github.com/github-tools/github-release-notes)|[Release notes](https://github.com/boly38/umami-api-client/releases) automation|
| [<img src="https://codetheweb.blog/assets/img/posts/github-pages-free-hosting/cover.png" width="100">](https://boly38.github.io/umami-api-client/)                                     | Github pages host some metrics for the main branch of this project: [code coverage](https://boly38.github.io/umami-api-client/)

