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
                cloudApiKey, server, username, password, domain,
                outputFile, reportContent,
                period, unit, timezone,
                prefetch
            } = GithubAction.getActionInputParameters();

            if (!isSet(cloudApiKey) && prefetch) {// hosted mode: optional to prevent flaky first connect timeout
                await UmamiServiceBeta.prefetchUmamiServerApi(
                    {server, username, password}
                );
            }
            const {
                site,
                siteStats,
                sitePageViews,
                siteEvents,
                siteSessions,
                siteMetricsUrl
            } = await UmamiService.fetchUmamiData(
                {
                    cloudApiKey, server, username, password, domain,
                    period, unit, timezone,
                    reportContent
                });

            const outputFilename = isSet(UMAMI_OUTPUT_DIRECTORY) && isSet(outputFile) ?
                `${UMAMI_OUTPUT_DIRECTORY}/${outputFile}` : null;

            const {
                umamiOneLineReport,
                umamiReport,
                pageViews,
                umamiReportFile = undefined
            } = await ReportGenerator.produceReportData({
                site, siteStats, sitePageViews, siteEvents, siteSessions, siteMetricsUrl,
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
                                  cloudApiKey, cloudDomain,
                                  server, username, password, domain,
                                  period, unit, timezone,
                                  outputFile, reportContent,
                                  prefetch = "false"
                              }) {

        if (!isSet(cloudApiKey) && prefetch === "true") {// hosted mode : optional to prevent flaky first connect timeout
            await UmamiServiceBeta.prefetchUmamiServerApi({server, username, password})
                .then(logStringifyOf)
        }

        const {
            site,
            siteStats,
            sitePageViews,
            siteEvents,
            siteSessions,
            siteMetricsUrl
        } = await UmamiService.fetchUmamiData(
            {
                cloudApiKey,
                server, username, password,
                "domain": isSet(cloudApiKey) ? cloudDomain : domain,
                period, unit, timezone,
                reportContent
            }
        );

        const outputFilename = isSet(UMAMI_OUTPUT_DIRECTORY) && isSet(outputFile) ?
            `${UMAMI_OUTPUT_DIRECTORY}/${outputFile}` : null;

        const {
            umamiOneLineReport,
            umamiReport,
            pageViews,
            umamiReportFile = undefined,
        } = await ReportGenerator.produceReportData({
            site, siteStats, sitePageViews, siteEvents, siteSessions, siteMetricsUrl,
            outputFilename, reportContent, period
        });

        return await ManualAction.report({
            umamiOneLineReport, umamiReport, pageViews,
            umamiReportFile
        });

    }
}
