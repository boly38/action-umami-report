import {assumeInputIsSet, isSet} from "./util.js";
import process from "node:process";

const cloudApiKey = process.env.UMAMI_CLOUD_API_KEY || null; // "api_xxxyyyzzz";
const server = process.env.UMAMI_SERVER || null; // "https://umami.exemple.com";
const username = process.env.UMAMI_USER || "admin";
const password = process.env.UMAMI_PASSWORD || null;
const domain = process.env.UMAMI_SITE_DOMAIN;
const cloudDomain = process.env.UMAMI_CLOUD_SITE_DOMAIN;
const outputFile = process.env.UMAMI_REPORT_FILE || "umamiReport.txt";
const reportContent = process.env.UMAMI_REPORT_CONTENT || "pageviews|events|sessions|urls";
const verbose = process.env.UMAMI_DEBUG_MANUAL === 'true';

export default class ManualAction {

    static getOptions(overrides = {}) {
        const period = "24h";
        const unit = "hour";
        const timezone = "Europe/Paris";
        const prefetch = "false";
        let options = {
            cloudApiKey, cloudDomain,
            server, username, password, domain,
            outputFile, reportContent,
            period, unit, timezone,
            prefetch
        };
        options = {...options, ...overrides};
        if (isSet(cloudApiKey)) {
            assumeInputIsSet(cloudDomain, 'env:UMAMI_CLOUD_SITE_DOMAIN');
        } else {
            assumeInputIsSet(server, 'env:UMAMI_SERVER');
            assumeInputIsSet(username, 'env:UMAMI_USER');
            assumeInputIsSet(password, 'env:UMAMI_PASSWORD');
            assumeInputIsSet(domain, 'env:UMAMI_SITE_DOMAIN');
        }
        ManualAction.logOptions(options);

        return options;
    }

    static logOptions({server, domain, outputFile, reportContent, period, unit, timezone, prefetch}) {
        // dont log creds ^^ // Weakness - CWE-312 CWE-359 CWE-532
        let toLog = {server, domain, outputFile, reportContent, period, unit, timezone, prefetch};
        verbose && console.log("input : " + JSON.stringify(toLog));
    }

    /**
     * produce manual actions results (output)
     */
    static async report({
                            umamiOneLineReport, umamiReport, pageViews,
                            umamiReportFile, reportLength
                        }) {
        console.log(`\n${umamiReport}`);
        console.table({
            umamiOneLineReport, pageViews, umamiReportFile, "reportLength": umamiReport?.length || 0
        });
    }
}