import fs from 'fs';
import dayjs from 'dayjs';

import UmamiClient from 'umami-api-client'

const DEBUG_ACTION = process.env.UMAMI_DEBUG_ACTION === 'true';
const rethrow = (err) => {throw err;}

class Action {

  static async produceReport(umamiSite, umamiSiteStat, targetFile) {
     const reportDateTime = dayjs().format('DD/MM/YYYY HH:mm');
     var umamiReport = `# ${reportDateTime} - Umami report\n`
     umamiReport += `for ${umamiSite.domain} [last 24 hours] :\n\n`;
     umamiReport += ` - ${umamiSiteStat.pageviews.value} (change:${umamiSiteStat.pageviews.change}) page views\n`;
     umamiReport += ` - ${umamiSiteStat.uniques.value} (change:${umamiSiteStat.uniques.change}) uniques\n`;
     umamiReport += ` - ${umamiSiteStat.bounces.value} (change:${umamiSiteStat.bounces.change}) bounces\n`;
     umamiReport += ` - ${umamiSiteStat.totaltime.value} (change:${umamiSiteStat.totaltime.change}) totaltime\n`;
     umamiReport += '\n';
     fs.writeFileSync(targetFile, umamiReport);
  }

  static async umamiDailyReportV0(server, user, password, domain = '*first*', targetFile = 'umamiReport.md') {
     const umamiClient = new UmamiClient({server});
     const authData = await umamiClient.login(user, password).catch(rethrow);
     const sites = await umamiClient.getSites(authData).catch(rethrow);
     const site = umamiClient.selectSiteByDomain(sites, domain);
     const siteStats = await umamiClient.getStatsForLast24h(authData, site).catch(rethrow);
     DEBUG_ACTION && console.log(site);
     DEBUG_ACTION && console.log(siteStats);
     Action.produceReport(site, siteStats, targetFile);
     return { site, siteStats, targetFile }
  }

}

export default Action;