import {logStringifyOf} from "../lib/services/util.js";
import UmamiReport from "../lib/umamiReport.js";

const period = "1week", unit = "day";
UmamiReport.manualReport(UmamiReport.getOptions({period, unit}))
    .then(logStringifyOf)
    .catch(console.error);