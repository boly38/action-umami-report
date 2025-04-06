import dayjs from 'dayjs';
import {ensureDirectoryExistence, isArrayWithContent, isSet, isVerbose} from "./util.js";
import fs from "fs";
import {formatSession, intValueOf, pad, plural, secondsToHms} from "./mapper/reportMappers.js";

const ENUMERATION_LIMIT = 10;
const verbose = isVerbose;
export default class ReportGenerator {

    constructor(umamiSite, reportContent = 'pageviews|events|sessions|urls', period = '24h',
                unit = 'hour', umamiSiteStats = null, sitePageViews = null, siteEvents = null,
                siteSessions = null, siteMetricsUrl = null) {
        this.site = umamiSite;
        this.siteStats = umamiSiteStats;
        this.sitePageViews = sitePageViews;
        this.siteEvents = siteEvents;
        this.siteSessions = siteSessions;
        this.siteMetricsUrl = siteMetricsUrl;
        this.reportContent = reportContent;
        this.reportContents = reportContent?.length > 0 ? reportContent.split('|') : [];
        this.period = period;
        this.unit = unit;
        this.reportDateTime = dayjs().format('DD/MM/YYYY HH:mm')
    }

    /**
     * generate Umami report data
     */
    static async produceReportData({
                                       site, siteStats, sitePageViews, siteEvents, siteSessions, siteMetricsUrl,
                                       outputFilename = null,
                                       reportContent = 'pageviews|events|sessions|urls',
                                       period = '24h', unit = 'hour'
                                   }) {
        const generator = new ReportGenerator(site, reportContent, period, unit,
            siteStats, sitePageViews, siteEvents, siteSessions, siteMetricsUrl);
        const umamiOneLineReport = generator.oneLineReport();
        const umamiReport = generator.detailedReport();
        const pageViews = siteStats?.pageviews?.value || 0;
        let result = {
            umamiOneLineReport,
            umamiReport,
            pageViews
        };
        const {targetFile} = await ReportGenerator.produceResultFile("umamiReport", umamiReport,
            outputFilename);
        if (isSet(targetFile)) {
            result["umamiReportFile"] = targetFile;
        }
        return result;
    }

    static async produceResultFile(resultName, resultValue, targetFile) {
        if (!isSet(targetFile)) {
            return {};
        }
        if (targetFile?.includes("..")) {// this may be improved..
            throw new Error("Unsecure output file refused");
        }
        try {
            ensureDirectoryExistence(targetFile);
            fs.writeFileSync(targetFile, resultValue);
            verbose && console.info(`produce action result (targetFile): ${targetFile}`);
            return {targetFile};
        } catch (error) {
            console.error(`ERROR: unable to write to ${targetFile} : ${error.message}`);
        }
    }

    hasContent(type) {
        return this.reportContents.includes(type);
    }

    oneLineReport() {
        const eventsCount = this.eventsCount();
        return `${this.site.domain} [${this.period}] : `
            + `${intValueOf(this.siteStats?.pageviews?.value)} views (${intValueOf(this.siteStats?.uniques?.value)} unique `
            + `${intValueOf(this.siteStats?.bounces?.value)} bounce) `
            + (eventsCount > 0 ? `${eventsCount} events ` : '')
            + `${secondsToHms(intValueOf(this.siteStats?.totaltime?.value))} totaltime`;
    }

    eventsCount() {
        if (!Array.isArray(this.siteEvents)) {
            console.log("warn : siteEvents is not an array : please double check api usage");
            return 0;
        }
        return (this.siteEvents === undefined || this.siteEvents === null || this.siteEvents.length < 1) ? 0 :
            this.siteEvents.reduce((from, obj) => from + obj.y, 0);
    }

    enrichReportWithStats(umamiReport) {
        if (!isSet(this.siteStats)) {
            return umamiReport;
        }

        let report = umamiReport;
        report += `for ${this.site.domain} [${this.period}] :\n\n`;
        report += ` value (previous value) metric\n`;
        report += ` - ${pad(intValueOf(this.siteStats?.pageviews?.value))} (${pad(intValueOf(this.siteStats?.pageviews?.prev))}) page views\n`;
        report += ` - ${pad(intValueOf(this.siteStats?.visitors?.value))} (${pad(intValueOf(this.siteStats?.visitors?.prev))}) visitors\n`;
        report += ` - ${pad(intValueOf(this.siteStats?.visits?.value))} (${pad(intValueOf(this.siteStats?.visits?.prev))}) visits\n`;
        report += ` - ${pad(intValueOf(this.siteStats?.bounces?.value))} (${pad(intValueOf(this.siteStats?.bounces?.prev))}) bounces\n`;
        report += ` - ${secondsToHms(intValueOf(this.siteStats?.totaltime?.value))} (${secondsToHms(intValueOf(this.siteStats?.totaltime?.prev))}) totaltime\n`;
        report += '\n\n';
        return report;
    }

// sitePageViews : {"pageviews":[{"t":"2022-07-08 20:00:00","y":4},{"t":"2022-07-09 10:00:00","y":2}],"sessions":[{"t":"2022-07-08 20:00:00","y":2},{"t":"2022-07-09 10:00:00","y":1}]}

    enrichReportWithPageViews(umamiReport) {
        if (this.sitePageViews === undefined || this.sitePageViews === null
            || !this.sitePageViews.pageviews < 1 || this.sitePageViews.pageviews.length < 1) {
            return umamiReport;
        }
        let report = umamiReport;
        report += `pageView details:\n`;
        this.sitePageViews.pageviews.forEach(page => {
            const sessionsCount = this.sitePageViews.sessions.find(session => session.t === page.t).y;
            const pageDateTime = page.t.substring(11);
            report += ` - ${pageDateTime} ${plural(page.y, 'page', 'pages')} (${plural(sessionsCount, 'session', 'sessions')}) `;
        });
        report += '\n\n';
        return report;
    }

// siteEvents :  events: [{"x":"cookies validate","t":"2022-07-09 22:00:00","y":1},{"x":"cookies validate","t":"2022-07-10 11:00:00","y":1},{"x":"list clocks","t":"2022-07-10 11:00:00","y":16},{"x":"cookies validate","t":"2022-07-10 14:00:00","y":1},{"x":"product 554422","t":"2022-07-10 14:00:00","y":1}]

    enrichReportWithEvents(umamiReport) {
        if (!isArrayWithContent(this.siteEvents)) {
            return umamiReport;
        }
        let report = umamiReport;
        report += `events:\n - `;
        report += this.siteEvents.map(event => {
            const {x, y} = event;// no more date
            return `${y}x [${x}]`;
        }).join(", ");
        report += '\n\n';
        return report;
    }

// siteSessions : { data: [{id:...,websiteId:...,hostname:... (...)}], count: 1, page: 1, pageSize: 5, orderBy: '-views'}
//    id websiteId hostname browser os device screen language country subdivision1 city firstAt lastAt visits views createdAt
    enrichReportWithSessions(umamiReport) {
        const data = this.siteSessions?.data;
        if (!isArrayWithContent(data)) {
            return umamiReport;// no session
        }
        let report = umamiReport;
        report += `sessions:\n`;
        report += data.map(formatSession).join("\n");
        report += '\n\n';
        return report;
    }

// siteMetricsUrl :   [{"x":"https://www.exemple.fr/listing/1234","y":2},{"x":"https://www.exemple.fr/listing/5555?lang=fr","y":1},{"x":"https://www.creharmony.fr/listing/5556?lang=fr","y":1}]

    enrichReportWithMetricsUrl(umamiReport) {
        if (!isArrayWithContent(this.siteMetricsUrl)) {
            return umamiReport;
        }
        let report = umamiReport;
        if (this.siteMetricsUrl.length > ENUMERATION_LIMIT) {
            report += `top ${ENUMERATION_LIMIT} urls:\n`;
        } else {
            report += `urls:\n`;
        }
        this.siteMetricsUrl.slice(0, ENUMERATION_LIMIT).forEach(metricUrl => {
            report += ` - ${metricUrl.y}x [${metricUrl.x}]\n`;
        });
        report += '\n\n';
        return report;
    }

    detailedReport() {
        let umamiReport = `# ${this.reportDateTime} - Umami report\n`
        umamiReport = this.enrichReportWithStats(umamiReport);
        if (this.hasContent('pageviews')) {
            umamiReport = this.enrichReportWithPageViews(umamiReport);
        }
        if (this.hasContent('events')) {
            umamiReport = this.enrichReportWithEvents(umamiReport);
        }
        if (this.hasContent('sessions')) {
            umamiReport = this.enrichReportWithSessions(umamiReport);
        }
        if (this.hasContent('urls')) {
            umamiReport = this.enrichReportWithMetricsUrl(umamiReport);
        }
        return umamiReport;
    }
}
