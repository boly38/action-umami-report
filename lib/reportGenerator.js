import dayjs from 'dayjs';

class ReportGenerator {

  constructor(umamiSite, umamiSiteStats = null, sitePageViews = null, siteEvents = null) {
    this.site = umamiSite;
    this.siteStats = umamiSiteStats;
    this.sitePageViews = sitePageViews;
    this.siteEvents = siteEvents;
    this.reportDateTime = dayjs().format('DD/MM/YYYY HH:mm')
  }

  oneLineReport() {
    const eventsCount = this.eventsCount();
    return `${this.site.domain} [24h] : `
          +`${this.siteStats.pageviews.value} views (${this.siteStats.uniques.value} unique `
          +`${this.siteStats.bounces.value} bounce) `
          + (eventsCount > 0 ? `${eventsCount} events ` : '')
          +`${this.siteStats.totaltime.value} totaltime`;
  }

  eventsCount() {
    return (this.siteEvents === undefined || this.siteEvents === null || this.siteEvents.length < 1) ? 0 :
           this.siteEvents.reduce( (from, obj) => from + obj.y, 0);
  }

  enrichReportWithStats(umamiReport) {
    if (this.siteStats === null) {
      return umamiReport;
    }
    var report = umamiReport;
    report += `for ${this.site.domain} [last 24 hours] :\n\n`;
    report += ` - ${this.siteStats.pageviews.value} (${this.siteStats.pageviews.change}) page views\n`;
    report += ` - ${this.siteStats.uniques.value} (${this.siteStats.uniques.change}) uniques\n`;
    report += ` - ${this.siteStats.bounces.value} (${this.siteStats.bounces.change}) bounces\n`;
    report += ` - ${this.siteStats.totaltime.value} (${this.siteStats.totaltime.change}) totaltime\n`;
    report += '\n\n';
    return report;
  }

  // sitePageViews : {"pageviews":[{"t":"2022-07-08 20:00:00","y":4},{"t":"2022-07-09 10:00:00","y":2}],"sessions":[{"t":"2022-07-08 20:00:00","y":2},{"t":"2022-07-09 10:00:00","y":1}]}
  enrichReportWithPageViews(umamiReport) {
    if (this.sitePageViews === undefined || this.sitePageViews === null || this.sitePageViews.length < 1) {
      return umamiReport;
    }
    var report = umamiReport;
    report += `pageView details:\n`;
    this.sitePageViews.pageviews.forEach( page => {
        const sessionsCount = this.sitePageViews.sessions.find(session => session.t === page.t).y;
        const pageDateTime = page.t.substring(11);
        report += ` - ${pageDateTime} ${plural(page.y,'page','pages')} (${plural(sessionsCount,'session','sessions')}) `;
    });
    report += '\n\n';
    return report;
  }

  // siteEvents :  events: [{"x":"cookies validate","t":"2022-07-09 22:00:00","y":1},{"x":"cookies validate","t":"2022-07-10 11:00:00","y":1},{"x":"list clocks","t":"2022-07-10 11:00:00","y":16},{"x":"cookies validate","t":"2022-07-10 14:00:00","y":1},{"x":"product 554422","t":"2022-07-10 14:00:00","y":1}]
  enrichReportWithEvents(umamiReport) {
    if (this.siteEvents === undefined || this.siteEvents === null || this.siteEvents.length < 1) {
      return umamiReport;
    }
    var report = umamiReport;
    report += `events details:\n`;
    var lastTime = '';
    this.siteEvents.forEach( event => {
        const eventDateTime = event.t.substring(11);
        if (eventDateTime !== lastTime) {
          report += ` - ${eventDateTime} ${event.y}x [${event.x}]`;
        } else {
          report += `, ${event.y}x [${event.x}]`;
        }
        lastTime = eventDateTime;
    });
    report += '\n';
    return report;
  }

  detailedReport() {
    var umamiReport = `# ${this.reportDateTime} - Umami report\n`
    umamiReport = this.enrichReportWithStats(umamiReport);
    umamiReport = this.enrichReportWithPageViews(umamiReport);
    umamiReport = this.enrichReportWithEvents(umamiReport);
    return umamiReport;
  }

}

export default ReportGenerator;

const plural = (count, singular, plural) => {
  return count > 1 ? `${count} ${plural}` : `${count} ${singular}`;
}