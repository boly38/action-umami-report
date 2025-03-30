import Manual from "./manual.js";

const nbFetch = 5;
const timeoutMs = 10000;
const manual = new Manual();
manual.fetch(manual.getOptions({nbFetch, timeoutMs}))
    .catch(console.error);