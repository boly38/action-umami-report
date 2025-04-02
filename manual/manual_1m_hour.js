import {logStringifyOf} from "../lib/services/util.js";
import UmamiReport from "../lib/umamiReport.js";

const period = "1month", unit = "hour";
UmamiReport.manualReport(UmamiReport.getOptions({period, unit}))
    .then(logStringifyOf)
    .catch(console.error);