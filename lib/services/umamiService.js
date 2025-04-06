import UmamiClient from 'umami-api-client'
import {isSet, isVerbose, rethrow} from "./util.js";

const verbose = isVerbose;

export default class UmamiService {

    static async fetchUmamiData({
                                    cloudApiKey, server, username, password, domain,
                                    period, unit, timezone,
                                    reportContent
                                }) {
        //~ Get datas from umami
        const umamiClient = new UmamiClient({
            cloudApiKey, server
        });
        if (umamiClient.isCloudMode()) {
            await umamiClient.me();
        } else {
            await umamiClient.login(username, password)
                .catch(err => rethrow(err, `Unable to login`));
        }
        const sites = await umamiClient.websites()
            .catch(err => rethrow(err, `Unable to get websites`));
        const site = umamiClient.selectSiteByDomain(sites, domain);
        if (!isSet(site)) {
            throw new Error(`unable to select site having domain:${domain}`);
        }
        verbose && console.log(`site: ${JSON.stringify(site, null, 2)}`);

        const siteStats = await umamiClient.websiteStats(site.id, period)
            .catch(err => rethrow(err, `Unable to get websiteStats`));
        verbose && console.log(`siteStats: ${JSON.stringify(siteStats, null, 2)}`);

        const reportContents = reportContent?.length > 0 ? reportContent.split('|') : [];
        let sitePageViews, siteEvents, siteSessions, siteMetricsUrl;

        if (reportContents.includes('pageviews')) {
            sitePageViews = await umamiClient.websitePageViews(site.id, period, {unit, timezone})
                .catch(err => rethrow(err, `Unable to get websitePageViews`));
            verbose && console.log(`sitePageViews: ${JSON.stringify(sitePageViews, null, 2)}`);
        }

        let type = "event";
        if (reportContents.includes('events')) {
            siteEvents = await umamiClient.websiteMetrics(site.id, period, {unit, timezone, type})
                .catch(err => rethrow(err, `Unable to get websiteMetrics type ${type}`));
            verbose && console.log(`siteEvents: ${JSON.stringify(siteEvents, null, 2)}`);
        }
        if (reportContents.includes('sessions')) {
            siteSessions = await umamiClient.websiteSessions(site.id, period, {pageSize: 5, orderBy: "-views"})
                .catch(err => rethrow(err, `Unable to get websiteSessions`));
            verbose && console.log(`siteSessions: ${JSON.stringify(siteSessions, null, 2)}`);
        }
        if (reportContents.includes('urls')) {
            type = "url";
            siteMetricsUrl = await umamiClient.websiteMetrics(site.id, period, {unit, timezone, type})
                .catch(err => rethrow(err, `Unable to getMetrics type ${type}`));
            verbose && console.log(`siteMetricsUrl: ${JSON.stringify(siteMetricsUrl, null, 2)}`);
        }

        return {site, siteStats, sitePageViews, siteEvents, siteSessions, siteMetricsUrl};
    }

}