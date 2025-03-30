import action from '../lib/githubAction.js'
import {assumeInputIsSet} from "../lib/util.js";
import process from "node:process";

const server = process.env.UMAMI_SERVER || null; // "umami.exemple.com";
const username = process.env.UMAMI_USER || "admin";
const password = process.env.UMAMI_PASSWORD || null;
const domain = process.env.UMAMI_SITE_DOMAIN;
const outputFile = process.env.UMAMI_REPORT_FILE || "umamiReport.txt";
const reportContent = process.env.UMAMI_REPORT_CONTENT || "pageviews|events|urls";
const verbose = process.env.UMAMI_DEBUG_MANUAL === 'true';

export default class Manual {

    getOptions(overrides = {}) {
        const period = "24h";
        const unit = "hour";
        const timezone = "Europe/Paris";
        const prefetch = "false";
        let options = {
            server, username, password, domain,
            outputFile, reportContent,
            period, unit, timezone,
            prefetch
        };
        options = {...options, ...overrides};
        assumeInputIsSet(server, 'env:UMAMI_SERVER');
        assumeInputIsSet(username, 'env:UMAMI_USER');
        assumeInputIsSet(username, 'env:UMAMI_PASSWORD');
        assumeInputIsSet(domain, 'env:UMAMI_SITE_DOMAIN');
        this.logOptions(options);

        return options;
    }

    logOptions({server, domain, outputFile, reportContent, period, unit, timezone, prefetch}) {
        // dont log creds ^^ // Weakness - CWE-312 CWE-359 CWE-532
        let toLog = {server, domain, outputFile, reportContent, period, unit, timezone, prefetch};
        verbose && console.log("input : " + JSON.stringify(toLog));
    }

    async fetch(options) {
        try {
            const reportResult = await action.prefetchUmamiServerApi(options);
            console.log(`reportResult: ${reportResult}`)
        } catch (error) {
            console.log(`ERROR: ${error}`)
        }
    }

    async report({server, username, password, domain, period, unit, timezone}) {
        const {
            site,
            siteStats,
            sitePageViews,
            siteEvents,
            siteMetricsUrl
        } = await action.fetchUmamiData(server, username, password, domain, period, unit, timezone);

        return await action.produceReport(
            site, siteStats, sitePageViews, siteEvents, siteMetricsUrl,
            outputFile, reportContent, period
        );

    }

}