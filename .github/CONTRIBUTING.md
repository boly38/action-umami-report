# How to contribute
You're not a dev ? just submit an issue (bug, improvements, questions).
* you could also fork, feature branch, then submit a pull request.

## HowTo setup

* Install Node.js and pnpm
* Clone
* Install deps
* setup your test environment (cf. [initenv.template.sh](./env/initenv.template.sh))

````bash
git clone https://github.com/boly38/action-umami-report.git
cd action-umami-report
pnpm install
# setup test env
cp ./env/initenv.template.sh ./env/initenv.dontpush.sh
# edit ./env/initenv.dontpush.sh then source it
. ./env/initenv.dontpush.sh
````

## HowTo test
* To run manual test

````bash
. ./env/initenv.dontpush.sh
pnpm day
pnpm showResults
# check other targets in package.json
pnpm run
````

* To run mocha test

````bash
. ./env/initenv.dontpush.sh
# run all tests
pnpm test
# run all tests with code coverage
pnpm ci-test
# run a single test file
tst=1_sinon_cloud_umami pnpm tst
````


## HowTo locally test GitHub action

* To run GitHub action workflow locally, cf [TESTING_ACTION](./TESTING_ACTION.md) 



## HowTo reproduce package

Packaging is defined in `.github/scripts/package.sh` 
````bash
pnpm install -g @vercel/ncc
ncc build index.js
# package result under dist/
````

## HowTo publish a new umami-server compatible branch ?

- check that `package.json::orphanBranch` do match current umami server version compatibility of current source
- create a version using patch/minor/major
- create and push a `to-package` branch on the version you want to publish
- this will trigger a `.github/workflows/main_ci_and_package_action.yml` workflow (internally with `MUST_BE_PACKAGED=true`)
1) a dist package is created and pushed onto an orphan branch (`package.json::orphanBranch`)
2) a new tag is (re-created and) pushed with `last-<orphanBranch>` as name to understand source code reference

For example the `umami-server-2.17.0` dist orphan branch used `last-umami-server-2.17.0` as source reference tag for the last packaging.

## HowTo create a fresh version
- install GitHub client
- create automatically a draft release version using [gh client](https://cli.github.com/)

Example to create v6.0.1
```bash
gh release create v6.0.1 --draft --generate-notes
```

this will make a new draft release. Verify it in [releases list](https://github.com/boly38/action-mongo-tools/releases)

- ⚠️ the repository apply immutable releases since #8, so you can't modify a release once published
- publish the release when ready
