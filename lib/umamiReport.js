import {env} from 'node:process';
import core from '@actions/core';

import GithubAction from "./services/githubAction.js";
import ManualAction from "./services/manualAction.js";
import UmamiService from "./services/umamiService.js";
import ReportGenerator from "./services/reportGenerator.js";
import UmamiServiceBeta from "./services/beta/umamiServiceBeta.js";
import {isSet, logStringifyOf} from "./services/util.js";

const UMAMI_OUTPUT_DIRECTORY = env["UMAMI_OUTPUT_DIRECTORY"] || './umami';

export default class UmamiReport {

    static async githubActionReport() {
        try {
            const {
                server, username, password, domain,
                outputFile, reportContent,
                period, unit, timezone,
                prefetch
            } = GithubAction.getActionInputParameters();
            // printContext();

            if (prefetch === "true") {// optional to prevent flaky first connect timeout
                await UmamiServiceBeta.prefetchUmamiServerApi(
                    {server, username, password}
                );
            }
            const {
                site,
                siteStats,
                sitePageViews,
                siteEvents,
                siteMetricsUrl
            } = await UmamiService.fetchUmamiData(
                {server, username, password, domain, period, unit, timezone});

            const outputFilename = isSet(UMAMI_OUTPUT_DIRECTORY) && isSet(outputFile) ?
                `${UMAMI_OUTPUT_DIRECTORY}/${outputFile}` : null;

            const {
                umamiOneLineReport,
                umamiReport,
                pageViews,
                umamiReportFile = undefined
            } = await ReportGenerator.produceReportData({
                site, siteStats, sitePageViews, siteEvents, siteMetricsUrl,
                outputFilename, reportContent, period
            });

            const result = await GithubAction.reportResults({
                pageViews,
                umamiOneLineReport,
                umamiReport,
                umamiReportFile
            });

            core.info(`RESULT : ${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            console.info(`ERROR: ${error}`)
            core.setFailed(error);
        }
    }

    static getOptions(overrides = {}) {
        return ManualAction.getOptions(overrides);
    }

    static async manualReport({
                                  server, username, password, domain,
                                  period, unit, timezone,
                                  outputFile, reportContent,
                                  prefetch = "false"
                              }) {

        if (prefetch === "true") {// optional to prevent flaky first connect timeout
            await UmamiServiceBeta.prefetchUmamiServerApi({server, username, password})
                .then(logStringifyOf)
        }

        const {
            site,
            siteStats,
            sitePageViews,
            siteEvents,
            siteMetricsUrl
        } = await UmamiService.fetchUmamiData(
            {server, username, password, domain, period, unit, timezone}
        );

        const outputFilename = isSet(UMAMI_OUTPUT_DIRECTORY) && isSet(outputFile) ?
            `${UMAMI_OUTPUT_DIRECTORY}/${outputFile}` : null;

        const {
            umamiOneLineReport,
            umamiReport,
            pageViews,
            umamiReportFile = undefined,
        } = await ReportGenerator.produceReportData({
            site, siteStats, sitePageViews, siteEvents, siteMetricsUrl,
            outputFilename, reportContent, period
        });

        return await ManualAction.report({
            umamiOneLineReport, umamiReport, pageViews,
            umamiReportFile
        });

    }
}
