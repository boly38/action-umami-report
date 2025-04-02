import {logStringifyOf} from "../lib/services/util.js";
import UmamiReport from "../lib/umamiReport.js";

UmamiReport.manualReport(UmamiReport.getOptions())
    .then(logStringifyOf)
    .catch(console.error);