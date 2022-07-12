import dayjs from 'dayjs';

const ENUMERATION_LIMIT = 10;

class ReportGenerator {

  constructor(umamiSite, reportContent = 'pageviews|events|urls', umamiSiteStats = null, sitePageViews = null, siteEvents = null, siteMetricsUrl = null) {
    this.site = umamiSite;
    this.siteStats = umamiSiteStats;
    this.sitePageViews = sitePageViews;
    this.siteEvents = siteEvents;
    this.siteMetricsUrl = siteMetricsUrl;
    this.reportContent = reportContent;
    this.reportDateTime = dayjs().format('DD/MM/YYYY HH:mm')
  }

  hasContent(type) {
    return this.reportContent !== null && this.reportContent.length > 0 && this.reportContent.split('|').includes(type);
  }

  oneLineReport() {
    const eventsCount = this.eventsCount();
    return `${this.site.domain} [24h] : `
          +`${this.siteStats.pageviews.value} views (${this.siteStats.uniques.value} unique `
          +`${this.siteStats.bounces.value} bounce) `
          + (eventsCount > 0 ? `${eventsCount} events ` : '')
          +`${secondsToHms(this.siteStats.totaltime.value)} totaltime`;
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
    report += ` - ${secondsToHms(this.siteStats.totaltime.value)} (${secondsToHms(this.siteStats.totaltime.change)}) totaltime\n`;
    report += '\n\n';
    return report;
  }

  // sitePageViews : {"pageviews":[{"t":"2022-07-08 20:00:00","y":4},{"t":"2022-07-09 10:00:00","y":2}],"sessions":[{"t":"2022-07-08 20:00:00","y":2},{"t":"2022-07-09 10:00:00","y":1}]}
  enrichReportWithPageViews(umamiReport) {
    if (this.sitePageViews === undefined || this.sitePageViews === null
     || !this.sitePageViews.pageviews < 1 || this.sitePageViews.pageviews.length < 1) {
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
    report += `events:\n`;
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
    report += '\n\n';
    return report;
  }

  // siteMetricsUrl :   [{"x":"https://www.exemple.fr/listing/1234","y":2},{"x":"https://www.exemple.fr/listing/5555?lang=fr","y":1},{"x":"https://www.creharmony.fr/listing/5556?lang=fr","y":1}]
  enrichReportWithMetricsUrl(umamiReport) {
    if (this.siteMetricsUrl === undefined || this.siteMetricsUrl === null || this.siteMetricsUrl.length < 1) {
      return umamiReport;
    }
    var report = umamiReport;
    if (this.siteMetricsUrl.length > ENUMERATION_LIMIT) {
      report += `top ${ENUMERATION_LIMIT} urls:\n`;
    } else {
      report += `urls:\n`;
    }
    var lastTime = '';
    this.siteMetricsUrl.slice(0, ENUMERATION_LIMIT).forEach( metricUrl => {
      report += ` - ${metricUrl.y}x [${metricUrl.x}]\n`;
    });
    report += '\n\n';
    return report;
  }

  detailedReport() {
    var umamiReport = `# ${this.reportDateTime} - Umami report\n`
    umamiReport = this.enrichReportWithStats(umamiReport);
    if (this.hasContent('pageviews')) {
      umamiReport = this.enrichReportWithPageViews(umamiReport);
    }
    if (this.hasContent('events')) {
      umamiReport = this.enrichReportWithEvents(umamiReport);
    }
    if (this.hasContent('urls')) {
      umamiReport = this.enrichReportWithMetricsUrl(umamiReport);
    }
    return umamiReport;
  }

}

export default ReportGenerator;

const plural = (count, singular, plural) => {
  return count > 1 ? `${count} ${plural}` : `${count} ${singular}`;
}
const secondsToHms = (nbSeconds) => {
    nbSeconds = Number(nbSeconds);
    var h = Math.floor(nbSeconds / 3600);
    var m = Math.floor(nbSeconds % 3600 / 60);
    var s = Math.floor(nbSeconds % 3600 % 60);

    var hDisplay = h != 0 ? (Math.abs(h) + "h ") : "";
    var mDisplay = m != 0 ? (Math.abs(m) + "' ") : "";
    var sDisplay = s != 0 ? (Math.abs(s) + "''") : "";
    var result = (nbSeconds < 0 ? "-" : "") + hDisplay + mDisplay + sDisplay;
    return result === "" ? "0''" : result;
}