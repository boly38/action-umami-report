import fs from 'fs';
import core from '@actions/core';
import UmamiClient from 'umami-api-client'

import ReportGenerator from './reportGenerator.js';
import axios from "axios";
import {assumeInputIsSet, ensureDirectoryExistence, isSet} from "./util.js";

const verbose = process.env.UMAMI_DEBUG_ACTION === 'true';
const UMAMI_OUTPUT_DIRECTORY = process.env.UMAMI_OUTPUT_DIRECTORY || './umami';
const rethrow = (err, prefix = "") => {
    throw new Error(`${prefix} ${err?.message || JSON.stringify(err)}`);
}

export default class GithubAction {

    static getActionInputParameters() {
        //~ GitHub action inputs
        const server = core.getInput('umami-server', {required: true}); // example : https://umami.myinstance.com
        const username = core.getInput('umami-user', {required: true}); // example : admin
        const password = core.getInput('umami-password', {required: true}); // example : mY53[R3T
        const domain = core.getInput('umami-site-domain');// ''
        const outputFile = core.getInput('umami-report-file');// ''
        const reportContent = core.getInput('umami-report-content') || 'pageviews|events|urls';// 'pageviews|events|urls'
        const period = core.getInput('umami-period') || '24h';// '24h'
        const unit = core.getInput('umami-unit') || 'hour';// 'hour' // used by pageviews and events. need to be correlated to the period
        const timezone = core.getInput('umami-tz') || 'Europe/Paris';// 'Europe/Paris'
        const prefetch = core.getInput('umami-prefetch') || 'false';// 'Europe/Paris'
        //~ Github action inputs - end
        assumeInputIsSet(server, 'umami-server');
        assumeInputIsSet(username, 'umami-user');
        assumeInputIsSet(password, 'umami-password');
        verbose && console.log("input : " + JSON.stringify({
            server,
            "username.length": username?.length,
            // password : dont log creds ^^ // Weakness - CWE-312 CWE-359 CWE-532
            domain, outputFile, reportContent, period, unit, timezone, prefetch
        }));

        return {server, username, password, domain, outputFile, reportContent, period, unit, timezone, prefetch};
    }

    /**
     * fetch umami api to understand flaky results
     * cf. https://github.com/boly38/action-umami-report/issues/37
     */
    static async prefetchUmamiServerApi({server, username, password, nbFetch = 10, timeoutMs = 50000}) {
        return new Promise(async resolve => {
            let baseURL = `${server}/api`;
            verbose && console.log(`prefetchUmamiServerApi ${baseURL}`);
            const client = axios.create({baseURL: baseURL, timeout: timeoutMs});
            let fetchResults = [];
            for (let i = 1; i < nbFetch; i++) {
                const action = `post ${i}`;
                console.time(action);
                const loginResult = await client.post("/auth/login", {username, password}).catch(error => {
                    console.timeEnd(action);
                    const message = typeof error.response !== "undefined" ? JSON.stringify(error.response.data) : error.message;
                    const status = typeof error.response !== "undefined" ? `${error.response.status} ${error.response.statusText}` : '';
                    const logMessage = status !== message ? `[${status}] ${message}` : message;
                    if (logMessage !== '401 Unauthorized') {
                        console.log(`Login failed: ${logMessage}`);
                    }
                    fetchResults.push(status);
                });
                if (loginResult !== undefined) {
                    fetchResults.push(`OK ${JSON.stringify(loginResult.status)}`);
                }
            }
            resolve(fetchResults);
        });
    }

    static async fetchUmamiData(server, username, password, domain, period, unit, timezone) {
        //~ Get datas from umami
        const umamiClient = new UmamiClient({server});
        const authData = await umamiClient.login(username, password)
            .catch(err => rethrow(err, `Unable to login`));
        const sites = await umamiClient.getSites(authData)
            .catch(err => rethrow(err, `Unable to getSites`));
        const site = umamiClient.selectSiteByDomain(sites, domain);
        verbose && console.log(`site: ${JSON.stringify(site, null, 2)}`);
        const siteStats = await umamiClient.getStats(authData, site, period)
            .catch(err => rethrow(err, `Unable to getStats`));
        const sitePageViews = await umamiClient.getPageViews(authData, site, {unit, timezone}, period)
            .catch(err => rethrow(err, `Unable to getPageViews`));
        let type = "event";
        const siteEvents = await umamiClient.getMetrics(authData, site, {unit, timezone, type}, period)
            .catch(err => rethrow(err, `Unable to getMetrics type ${type}`));
        type = "url";
        const siteMetricsUrl = await umamiClient.getMetrics(authData, site, {unit, timezone, type}, period)
            .catch(err => rethrow(err, `Unable to getMetrics type ${type}`));

        verbose && console.log(`siteStats: ${JSON.stringify(siteStats, null, 2)}`);
        verbose && console.log(`siteEvents: ${JSON.stringify(siteEvents, null, 2)}`);
        verbose && console.log(`siteMetricsUrl: ${JSON.stringify(siteMetricsUrl, null, 2)}`);
        return {site, siteStats, sitePageViews, siteEvents, siteMetricsUrl};
    }

    static async produceActionResult(resultName, resultValue, outputFile = null) {
        const outFileAddition = outputFile !== null ? `file:${outputFile}` : '';
        verbose && console.info(`produce action result (output): ${resultName} ${outFileAddition}`);
        core.setOutput(resultName, resultValue);// core action output: to be declared as outputs by current job and used by another job
        // disabled by #12 // core.exportVariable(resultName, resultValue);// core action env: to be used by current job by another step

        let targetFile = null;
        if (isSet(UMAMI_OUTPUT_DIRECTORY) && isSet(outputFile)) {
            targetFile = `${UMAMI_OUTPUT_DIRECTORY}/${outputFile}`;
            if (targetFile?.includes("..")) {// this may be improved..
                throw new Error("Unsecure output file refused");
            }
            try {
                ensureDirectoryExistence(targetFile);
                fs.writeFileSync(targetFile, resultValue);
            } catch (error) {
                console.error(`ERROR: unable to write to ${targetFile} : ${error}`);
                targetFile = null;
            }
        }
        if (isSet(targetFile)) {
            verbose && console.info(`produce action result (targetFile): ${targetFile}`);
            return {targetFile};
        }
        return {};
    }


    static async produceReport(umamiSite, umamiSiteStats, sitePageViews = null, siteEvents = null, siteMetricsUrl = null,
                               outputFile = null, reportContent = 'pageviews|events|urls', period = '24h', unit = 'hour') {
        //~~ generate umami report content
        const generator = new ReportGenerator(umamiSite, reportContent, period, unit, umamiSiteStats, sitePageViews, siteEvents, siteMetricsUrl);
        const umamiOneLineReport = generator.oneLineReport();
        const umamiReport = generator.detailedReport();

        //~~ produce github actions results (output)
        let pageViews = umamiSiteStats?.pageviews?.value || 0;
        let reportLength = umamiReport.length;
        await GithubAction.produceActionResult("pageViews", pageViews, null);
        await GithubAction.produceActionResult("umamiOneLineReport", umamiOneLineReport);
        const {targetFile = null} = await GithubAction.produceActionResult("umamiReport", umamiReport, outputFile);
        await GithubAction.produceActionResult("umamiReportLength", reportLength, null);// #14
        if (isSet(targetFile)) {
            await GithubAction.produceActionResult("umamiReportFile", targetFile, null);
        }
        return {pageViews, umamiOneLineReport, reportLength, targetFile};
    }

    static async doAction() {
        try {
            const {
                server, username, password, domain,
                outputFile, reportContent,
                period, unit, timezone,
                prefetch
            } = GithubAction.getActionInputParameters();
            // printContext();

            if (prefetch === "true") {// optional to prevent flaky first connect timeout
                await GithubAction.prefetchUmamiServerApi({server, username, password});
            }
            const {
                site,
                siteStats,
                sitePageViews,
                siteEvents,
                siteMetricsUrl
            } = await GithubAction.fetchUmamiData(server, username, password, domain, period, unit, timezone);

            const result = await GithubAction.produceReport(
                site, siteStats, sitePageViews, siteEvents, siteMetricsUrl,
                outputFile, reportContent, period
            );

            core.info(`RESULT : ${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            console.info(`ERROR: ${error}`)
            core.setFailed(error);
        }
    }
}



