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

  static enrichReportWithStats(umamiSite, umamiReport, umamiSiteStats) {
    var report = umamiReport;
    report += `for ${umamiSite.domain} [last 24 hours] :\n\n`;
    report += ` - ${umamiSiteStats.pageviews.value} (change:${umamiSiteStats.pageviews.change}) page views\n`;
    report += ` - ${umamiSiteStats.uniques.value} (change:${umamiSiteStats.uniques.change}) uniques\n`;
    report += ` - ${umamiSiteStats.bounces.value} (change:${umamiSiteStats.bounces.change}) bounces\n`;
    report += ` - ${umamiSiteStats.totaltime.value} (change:${umamiSiteStats.totaltime.change}) totaltime\n`;
    report += '\n';
    return report;
  }

  // sitePageViews : {"pageviews":[{"t":"2022-07-08 20:00:00","y":4},{"t":"2022-07-09 10:00:00","y":2}],"sessions":[{"t":"2022-07-08 20:00:00","y":2},{"t":"2022-07-09 10:00:00","y":1}]}
  static enrichReportWithPageViews(umamiSite, umamiReport, sitePageViews) {
    if (sitePageViews === undefined || sitePageViews === null || sitePageViews.length < 1) {
      return umamiReport;
    }
    var report = umamiReport;
    report += `pageView details:\n`;
    sitePageViews.pageviews.forEach( page => {
        const sessionsCount = sitePageViews.sessions.find(session => session.t === page.t).y;
        const pageDateTime = page.t.substring(11);
        report += ` - ${pageDateTime} ${plural(page.y,'page','pages')} (${plural(sessionsCount,'session','sessions')}) `;
    });
    report += '\n';
    return report;
  }

  static async produceReport(umamiSite, umamiSiteStats, sitePageViews = null, outputFile = null) {
    const reportDateTime = dayjs().format('DD/MM/YYYY HH:mm');

    const umamiOneLineReport = `${umamiSite.domain} [24h] : `
    +`${umamiSiteStats.pageviews.value} views (${umamiSiteStats.uniques.value} unique `
    +`${umamiSiteStats.bounces.value} bounce) ${umamiSiteStats.totaltime.value} totaltime`;

    var umamiReport = `# ${reportDateTime} - Umami report\n`
    umamiReport = Action.enrichReportWithStats(umamiSite, umamiReport, umamiSiteStats);
    if (sitePageViews !== null) {
      umamiReport = Action.enrichReportWithPageViews(umamiSite, umamiReport, sitePageViews);
    }

    Action.produceActionResult("pageViews", umamiSiteStats.pageviews.value, null);
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
    const sitePageViews = await umamiClient.getPageViewsForLast24h(authData, site).catch(rethrow);

    DEBUG_ACTION && console.log(site);
    DEBUG_ACTION && console.log(siteStats);
    const targetFile = await Action.produceReport(site, siteStats, sitePageViews, outputFile);
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
const plural = (count, singular, plural) => {
  return count > 1 ? `${count} ${plural}` : `${count} ${singular}`;
}