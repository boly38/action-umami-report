# How to contribute
You're not a dev ? just submit an issue (bug, improvements, questions).

## HowTo setup

* Install NodeJs and pnpm
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
pnpm run day
pnpm run debugDay
# or on windows : pnpm run debugDayWin
pnpm run showResults
# check other targets in package.json
pnpm run
````

* To run mocha test

````bash
. ./env/initenv.dontpush.sh
# run all tests
pnpm run test
# run all tests with code coverage
pnpm run ci-test
# run a single test file
tst=1_sinon_based pnpm run tst
````


* you could also fork, feature branch, then submit a pull request.

## HowTo package
````bash
pnpm install -g @vercel/ncc
ncc build index.js
# package result under dist/
````