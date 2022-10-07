import path from 'path';
import fs from 'fs';
import core from '@actions/core';
import github from '@actions/github';

import axios from 'axios'
import UmamiAPIClient from 'umami-api'

import ReportGenerator from './reportGenerator.js';

const DEBUG_ACTION = process.env.UMAMI_DEBUG_ACTION === 'true';
const UMAMI_OUTPUT_DIRECTORY = process.env.UMAMI_OUTPUT_DIRECTORY || './umami';
const rethrow = (err) => {throw err;}

class Action {

  static async fetchUmamiServerApi(server, timeoutMs = 50000) {
    const username = 'abc';
    const password = 'abc';
    console.log(`fetchUmamiServerApi`);
    for (var i = 1 ; i < 10 ; i++) {
      var expectedResult = [];
      const action = "post " + i;
      console.time(action);
        const client = axios.create({ baseURL: `${server}/api`, timeout: timeoutMs });
        const loginResult = await client.post("/auth/login", { username, password }).catch(error => {
            console.timeEnd(action);
            const message = typeof error.response !== "undefined" ? error.response.data : error.message;
            const status = typeof error.response !== "undefined" ? `${error.response.status} ${error.response.statusText}`:'';
            const logMessage = status !== message ? `[${status}] ${message}` : message;
            if (logMessage !== '401 Unauthorized') {
              console.log(`Login failed: ${logMessage}`);
            } else {
              expectedResult.push(error);
            }
        });
        if (loginResult !== undefined || expectedResult.length > 0) {
          return;
        }
    }
  }

  static async produceActionResult(resultName, resultValue, outputFile = null) {
    const outFileAddition = outputFile !== null ? `file:${outputFile}` : '';
    console.info(`produce action result (output): ${resultName} ${outFileAddition}`);
    core.setOutput(resultName, resultValue);// core action output: to be declared as outputs by current job and used by another job
    // disabled by #12 // core.exportVariable(resultName, resultValue);// core action env: to be used by current job by another step

    var targetFile = null;
    if (isSet(UMAMI_OUTPUT_DIRECTORY) && isSet(outputFile)) {
      targetFile = `${UMAMI_OUTPUT_DIRECTORY}/${outputFile}`;
      try {
        ensureDirectoryExistence(targetFile);
        fs.writeFileSync(targetFile, resultValue);
      } catch (error) {
        console.error(`ERROR: unable to write to ${targetFile} : ${error}`);
        targetFile = null;
      }
    }
    return { targetFile };
  }


  static async produceReport(umamiSite, umamiSiteStats, sitePageViews = null, siteEvents = null, siteMetricsUrl = null,
      outputFile = null, reportContent = 'pageviews|events|urls', period = '24h', unit = 'hour') {
    //~~ generate umami report content
    const generator = new ReportGenerator(umamiSite, reportContent, period, unit, umamiSiteStats, sitePageViews, siteEvents, siteMetricsUrl);
    const umamiOneLineReport = generator.oneLineReport();
    const umamiReport = generator.detailedReport();

    //~~ produce github actions results (output)
    Action.produceActionResult("pageViews", umamiSiteStats.pageviews.value, null);
    Action.produceActionResult("umamiOneLineReport", umamiOneLineReport);
    const { targetFile } = await Action.produceActionResult("umamiReport", umamiReport, outputFile);
    Action.produceActionResult("umamiReportLength", umamiReport.length, null);// #14
    if ( isSet(targetFile) ) {
      Action.produceActionResult("umamiReportFile", targetFile, null);
      return targetFile;
    }
    return null;
  }

  /**
    * @deprecated : please use umamiReport(...)
    */
  static async umamiDailyReportV0(server, user, password, domain = '', outputFile = null, reportContent = 'pageviews|events|urls') {
    var options = { server, user, password, domain, outputFile, reportContent };
    return await Action.umamiReport(options);
  }

  static async umamiReport(options) {
    // options
    var { server, user, password, domain, outputFile, reportContent, period, unit, tz } = options;
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
    if (!isSet(tz)) {
      tz = 'Europe/Paris';
    }

    const umami = new UmamiAPIClient(server, user, password, false);
    const site = isSet(domain) ? await umami.getWebsiteBy("domain", domain).catch(rethrow) : await umami.getWebsite().catch(rethrow);
    const siteStats = await umami.getStats(site.website_id, { period }).catch(rethrow);
    const sitePageViews = await umami.getPageviews(site.website_id, { period, unit, tz }).catch(rethrow);
    const siteEvents = await umami.getEvents(site.website_id, { period, unit, tz }).catch(rethrow);
    const siteMetricsUrl = await umami.getMetrics(site.website_id, { period }).catch(rethrow);

    DEBUG_ACTION && console.log(site);
    DEBUG_ACTION && console.log(siteStats);
    const targetFile = await Action.produceReport(site, siteStats, sitePageViews, siteEvents, siteMetricsUrl,
       outputFile, reportContent, period);
    if (targetFile != null) {
      return { site, siteStats, targetFile }
    }
    return { site, siteStats };
  }
}

export default Action;

const isSet = (value) => value !== null && value !== undefined && value !== '';
const ensureDirectoryExistence = (filePath) => {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};
