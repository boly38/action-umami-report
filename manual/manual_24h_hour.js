import {logStringifyOf} from "../lib/util.js";
import Manual from "./manual.js";

const manual = new Manual();
manual.report(manual.getOptions())
    .then(logStringifyOf)
    .catch(console.error);