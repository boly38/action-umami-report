# susi-rali
[![NPM](https://nodei.co/npm/susi-rali.png?compact=true)](https://npmjs.org/package/susi-rali)

NodeJs Super Simple Rate Limiter : [susi-rali](https://npmjs.org/package/susi-rali).

This tool offers a way to rate limit a given action acting as client point of view. 
(In state this project is not designed to apply to rate limit server handlers and return 429 error for example) 

Features

- limitedCall - rate limited business promise method with result.

Susi super limitations:
- BETA: this project is in beta state. limit have not yet been evaluated. Input validation is light
- dont scale up: as this project dont yet rely on shared storage (ex. db or redis), usage must be limited to one instance.

# Quick start

install susi-rali

```
npm install susi-rali
```

then let's go:
```
const SusiRali = require('susi-rali')
const windowsMs=1000;
const maxQueryPerWindow=10;
const susi = new SusiRali({windowsMs, maxQueryPerWindow});

await susi.limitedCall(() => businessCode("businessArg"))
         .then((businessResolved)=>console.log(">" + businessResolved));
```


## Advanced usage


### SusiRali options
This section describes SusiRali available options.

Note about options precedence: first take option value from constructor if any,
or else apply default value.

- `windowsMs`         : Rate limit windows size in milliseconds - *optional* with default value: `1000`
- `maxQueryPerWindow` : Rate limit max query per windows size - *optional* with default value: `10`
- `maxProcessingPerWindow` : Rate limit max query processing per windows size - *optional* with default value: `maxQueryPerWindow`

## How to contribute
You're not a dev ? just submit an issue (bug, improvements, questions). Or else:
* Clone
* Install deps
* Then mocha tests
```
git clone https://github.com/creharmony/susi-rali.git
cd susi-rali
npm install
# play tests
npm run test
# play different parallel configurations
npm run manual
```
* you could also fork, feature branch, then submit a pull request.

### Services or activated bots

| badge  | name   | description  |
|--------|-------|:--------|
| ![CI/CD](https://github.com/creharmony/susi-rali/workflows/susi_rali_ci/badge.svg) |Github actions|Continuous tests.
| [![Audit](https://github.com/creharmony/susi-rali/actions/workflows/audit.yml/badge.svg)](https://github.com/creharmony/susi-rali/actions/workflows/audit.yml) |Github actions|Continuous vulnerability audit.
|[![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com)|[Houndci](https://houndci.com/)|JavaScript  automated review (configured by `.hound.yml`)|
|[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)| GREN |Automated Release Notes by gren|
<!-- 
| [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)|[gren](https://github.com/github-tools/github-release-notes)|[Release notes](https://github.com/creharmony/susi-rali/releases) automation|
-->
