import path from 'path';
import fs from 'fs';
import core from '@actions/core';
import github from '@actions/github';

import UmamiClient from 'umami-api-client'

import ReportGenerator from './reportGenerator.js';

const DEBUG_ACTION = process.env.UMAMI_DEBUG_ACTION === 'true';
const UMAMI_OUTPUT_DIRECTORY = process.env.UMAMI_OUTPUT_DIRECTORY || './umami';
const rethrow = (err) => {throw err;}

class Action {

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
      outputFile = null, reportContent = 'pageviews|events|urls', period = '24h') {
    //~~ generate umami report content
    const generator = new ReportGenerator(umamiSite, reportContent, period, umamiSiteStats, sitePageViews, siteEvents, siteMetricsUrl);
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
  static async umamiDailyReportV0(server, user, password, domain = '*first*', outputFile = null, reportContent = 'pageviews|events|urls') {
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
    if (!isSet(domain)) {
      domain = '*first*';
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
    const umamiClient = new UmamiClient({server});

    const authData = await umamiClient.login(user, password).catch(rethrow);
    const sites = await umamiClient.getSites(authData).catch(rethrow);
    const site = umamiClient.selectSiteByDomain(sites, domain);
    const siteStats = await umamiClient.getStats(authData, site, period).catch(rethrow);
    const sitePageViews = await umamiClient.getPageViews(authData, site, {unit, tz}, period).catch(rethrow);
    const siteEvents = await umamiClient.getEvents(authData, site, {unit, tz}, period).catch(rethrow);
    const siteMetricsUrl = await umamiClient.getMetrics(authData, site, { type: 'url' }, period).catch(rethrow);

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
