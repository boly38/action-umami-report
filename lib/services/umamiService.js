import UmamiClient from 'umami-api-client'
import {isVerbose, rethrow} from "./util.js";

const verbose = isVerbose;

export default class UmamiService {


    static async fetchUmamiData({server, username, password, domain, period, unit, timezone}) {
        //~ Get datas from umami
        const umamiClient = new UmamiClient({server});
        const authData = await umamiClient.login(username, password)
            .catch(err => rethrow(err, `Unable to login`));
        const sites = await umamiClient.getSites(authData)
            .catch(err => rethrow(err, `Unable to getSites`));
        const site = umamiClient.selectSiteByDomain(sites, domain);
        verbose && console.log(`site: ${JSON.stringify(site, null, 2)}`);
        const siteStats = await umamiClient.getStats(authData, site, period)
            .catch(err => rethrow(err, `Unable to getStats`));
        const sitePageViews = await umamiClient.getPageViews(authData, site, {unit, timezone}, period)
            .catch(err => rethrow(err, `Unable to getPageViews`));
        let type = "event";
        const siteEvents = await umamiClient.getMetrics(authData, site, {unit, timezone, type}, period)
            .catch(err => rethrow(err, `Unable to getMetrics type ${type}`));
        type = "url";
        const siteMetricsUrl = await umamiClient.getMetrics(authData, site, {unit, timezone, type}, period)
            .catch(err => rethrow(err, `Unable to getMetrics type ${type}`));

        verbose && console.log(`siteStats: ${JSON.stringify(siteStats, null, 2)}`);
        verbose && console.log(`siteEvents: ${JSON.stringify(siteEvents, null, 2)}`);
        verbose && console.log(`siteMetricsUrl: ${JSON.stringify(siteMetricsUrl, null, 2)}`);
        return {site, siteStats, sitePageViews, siteEvents, siteMetricsUrl};
    }

}