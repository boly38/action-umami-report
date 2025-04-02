# DEV note about tests
- dont duplicate, factorize
- `mocha` : dont use arrow function https://mochajs.org/#arrow-functions
  (ex. `this.skip()` require mocha context)
- Intellij > Settings > Langage > Librairies : add node_modules/ or some deps: mocha, chai ...