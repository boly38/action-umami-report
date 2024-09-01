import path from 'path';
import fs from 'fs';
import core from '@actions/core';

import UmamiClient from 'umami-api-client'

import ReportGenerator from './reportGenerator.js';
import axios from "axios";

const DEBUG_ACTION = process.env.UMAMI_DEBUG_ACTION === 'true';
const UMAMI_OUTPUT_DIRECTORY = process.env.UMAMI_OUTPUT_DIRECTORY || './umami';
const rethrow = (err, prefix = "") => {
    throw new Error(`${prefix} ${err.message}`);
}

class Action {

    /**
     * fetch umami api to understand flaky results
     * cf. https://github.com/boly38/action-umami-report/issues/37
     * @param server
     * @param timeoutMs
     * @returns {Promise<unknown>}
     */
    static async fetchUmamiServerApi(server, timeoutMs = 50000) {
        return new Promise(async (resolve, reject) => {
            const username = 'admin';
            const password = '075827845F';
            console.log(`fetchUmamiServerApi`);
            let fetchResults = [];
            for (let i = 1; i < 10; i++) {
                const action = "post " + i;
                console.time(action);
                const client = axios.create({baseURL: `${server}/api`, timeout: timeoutMs});
                const loginResult = await client.post("/auth/login", {username, password}).catch(error => {
                    console.timeEnd(action);
                    const message = typeof error.response !== "undefined" ? error.response.data : error.message;
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

    static async produceActionResult(resultName, resultValue, outputFile = null) {
        const outFileAddition = outputFile !== null ? `file:${outputFile}` : '';
        console.info(`produce action result (output): ${resultName} ${outFileAddition}`);
        core.setOutput(resultName, resultValue);// core action output: to be declared as outputs by current job and used by another job
        // disabled by #12 // core.exportVariable(resultName, resultValue);// core action env: to be used by current job by another step

        let targetFile = null;
        if (isSet(UMAMI_OUTPUT_DIRECTORY) && isSet(outputFile)) {
            targetFile = `${UMAMI_OUTPUT_DIRECTORY}/${outputFile}`;
            try {
                ensureDirectoryExistence(targetFile);
                fs.writeFileSync(targetFile, resultValue);
            } catch (error) {
                console.info(`ERROR: unable to write to ${targetFile} : ${error}`);
                targetFile = null;
            }
        }
        if (isSet(targetFile)) {
            console.info(`produce action result (targetFile): ${targetFile}`);
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
        await Action.produceActionResult("pageViews", umamiSiteStats.pageviews.value, null);
        await Action.produceActionResult("umamiOneLineReport", umamiOneLineReport);
        const {targetFile} = await Action.produceActionResult("umamiReport", umamiReport, outputFile);
        await Action.produceActionResult("umamiReportLength", umamiReport.length, null);// #14
        if (isSet(targetFile)) {
            await Action.produceActionResult("umamiReportFile", targetFile, null);
            return targetFile;
        }
        return null;
    }

    static async umamiReport(options) {
        return new Promise(async (resolve, reject) => {
            try {
                // options
                let {server, user, password, domain, outputFile, reportContent, period, unit, timezone} = options;
                // default options
                if (!isSet(user)) {
                    user = 'admin';
                }
                if (!isSet(outputFile)) {
                    outputFile = null;
                }
                if (!isSet(reportContent)) {
                    reportContent = 'pageviews|events|urls';
                }
                if (!isSet(period)) {
                    period = '24h';
                }
                if (!isSet(unit)) {
                    unit = 'hour';
                }
                if (!isSet(timezone)) {
                    timezone = 'Europe/Paris';
                }

                DEBUG_ACTION && console.log("options : " + JSON.stringify({
                    server,
                    user,
                    password,
                    domain,
                    outputFile,
                    reportContent,
                    period,
                    unit,
                    timezone
                }));

                const umamiClient = new UmamiClient({server});
                const authData = await umamiClient.login(user, password)
                    .catch(err => rethrow(err, `Unable to login`));

                const sites = await umamiClient.getSites(authData).catch(err => {
                    console.error("errBX" + err);
                    throw new Error(err);
                })
                const site = umamiClient.selectSiteByDomain(sites, domain);
                DEBUG_ACTION && console.log(`site: ${JSON.stringify(site, null, 2)}`);
                const siteStats = await umamiClient.getStats(authData, site, period).catch(rethrow);
                const sitePageViews = await umamiClient.getPageViews(authData, site, {unit, timezone}, period).catch(rethrow);
//                const siteEvents = ( await umamiClient.getEvents(authData, site, {unit, tz}, period).catch(rethrow) ).data;
                const siteEvents = await umamiClient.getMetrics(authData, site, {unit, timezone, type: 'event'}, period).catch(rethrow);
                const siteMetricsUrl = await umamiClient.getMetrics(authData, site, {type: 'url'}, period).catch(rethrow);

                DEBUG_ACTION && console.log(`siteStats: ${JSON.stringify(siteStats, null, 2)}`);
                DEBUG_ACTION && console.log(`siteEvents: ${JSON.stringify(siteEvents, null, 2)}`);
                DEBUG_ACTION && console.log(`siteMetricsUrl: ${JSON.stringify(siteMetricsUrl, null, 2)}`);
                const targetFile = await Action.produceReport(site, siteStats, sitePageViews, siteEvents, siteMetricsUrl,
                    outputFile, reportContent, period);
                if (isSet(targetFile)) {
                    resolve({site, siteStats, targetFile});
                } else {
                    resolve({site, siteStats});
                }
            } catch (err) {
                console.error("err" + err);
                reject(err);
            }
        });
    }
}

export default Action;

const isSet = (value) => value !== null && value !== undefined && value !== '';
const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
};
