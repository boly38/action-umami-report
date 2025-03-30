import {logStringifyOf} from "../lib/util.js";
import Manual from "./manual.js";

const period = "1week", unit = "day";
const manual = new Manual();
manual.report(manual.getOptions({period, unit}))
    .then(logStringifyOf)
    .catch(console.error);