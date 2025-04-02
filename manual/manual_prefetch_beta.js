import {logStringifyOf} from "../lib/services/util.js";
import UmamiReport from "../lib/umamiReport.js";
import UmamiServiceBeta from "../lib/services/beta/umamiServiceBeta.js";
const nbFetch = 5;
const timeoutMs = 10000;

UmamiServiceBeta.prefetchUmamiServerApi(UmamiReport.getOptions({nbFetch, timeoutMs}))
    .then(logStringifyOf)
    .catch(console.error);