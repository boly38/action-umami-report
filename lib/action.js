import path from 'path';
import fs from 'fs';
import dayjs from 'dayjs';
import core from '@actions/core';
import github from '@actions/github';

import UmamiClient from 'umami-api-client'

const DEBUG_ACTION = process.env.UMAMI_DEBUG_ACTION === 'true';
const UMAMI_OUTPUT_DIRECTORY = process.env.UMAMI_OUTPUT_DIRECTORY || './umami';
const rethrow = (err) => {throw err;}

class Action {

  static async produceActionResult(resultName, resultValue, outputFile = null) {
    const outFileAddition = outputFile !== null ? `file:${outputFile}` : '';
    console.info(`produce action result (output, env): ${resultName} ${outFileAddition}`);
    core.setOutput(resultName, resultValue);// core action output: to be declared as outputs by current job and used by another job
    core.exportVariable(resultName, resultValue);// core action env: to be used by current job by another step
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

  static async produceReport(umamiSite, umamiSiteStat, outputFile = null) {
    const reportDateTime = dayjs().format('DD/MM/YYYY HH:mm');

    const umamiOneLineReport = `${umamiSite.domain} [24h] : ${umamiSiteStat.pageviews.value} views (${umamiSiteStat.uniques.value} unique ${umamiSiteStat.bounces.value} bounce) ${umamiSiteStat.totaltime.value} totaltime`

    var umamiReport = `# ${reportDateTime} - Umami report\n`
    umamiReport += `for ${umamiSite.domain} [last 24 hours] :\n\n`;
    umamiReport += ` - ${umamiSiteStat.pageviews.value} (change:${umamiSiteStat.pageviews.change}) page views\n`;
    umamiReport += ` - ${umamiSiteStat.uniques.value} (change:${umamiSiteStat.uniques.change}) uniques\n`;
    umamiReport += ` - ${umamiSiteStat.bounces.value} (change:${umamiSiteStat.bounces.change}) bounces\n`;
    umamiReport += ` - ${umamiSiteStat.totaltime.value} (change:${umamiSiteStat.totaltime.change}) totaltime\n`;
    umamiReport += '\n';

    Action.produceActionResult("pageViews", umamiSiteStat.pageviews.value, null);
    Action.produceActionResult("umamiOneLineReport", umamiOneLineReport);
    const { targetFile } = await Action.produceActionResult("umamiReport", umamiReport, outputFile);
    if ( isSet(targetFile) ) {
      Action.produceActionResult("umamiReportFile", targetFile, null);
      return targetFile;
    }
    return null;
  }

  static async umamiDailyReportV0(server, user, password, domain = '*first*', outputFile = null) {
    const umamiClient = new UmamiClient({server});

    const authData = await umamiClient.login(user, password).catch(rethrow);
    const sites = await umamiClient.getSites(authData).catch(rethrow);
    const site = umamiClient.selectSiteByDomain(sites, domain);
    const siteStats = await umamiClient.getStatsForLast24h(authData, site).catch(rethrow);

    DEBUG_ACTION && console.log(site);
    DEBUG_ACTION && console.log(siteStats);
    const { targetFile } = Action.produceReport(site, siteStats, outputFile);
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