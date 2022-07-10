import action from './lib/action.js'
import core from '@actions/core';
import github from '@actions/github';

const UMAMI_SERVER = process.env.UMAMI_SERVER || null; // "https://umami.exemple.com";
const UMAMI_USER = process.env.UMAMI_USER || "admin";
const UMAMI_PASSWORD = process.env.UMAMI_PASSWORD || null;
const UMAMI_SITE_DOMAIN = process.env.UMAMI_SITE_DOMAIN || "*first*";
const UMAMI_REPORT_FILE = process.env.UMAMI_REPORT_FILE || "umamiReport.txt";
const UMAMI_REPORT_CONTENT = process.env.UMAMI_REPORT_CONTENT || "pageviews|events|urls";
const rethrow = (err) => {throw err;}

const actionUmamiReport = async function() {
    try {
      if (UMAMI_SERVER === null) {
        throw "please setup your environment UMAMI_SERVER, UMAMI_USER, UMAMI_PASSWORD, UMAMI_SITE_DOMAIN"
      }
      const reportResult = await action.umamiDailyReportV0(UMAMI_SERVER, UMAMI_USER, UMAMI_PASSWORD, UMAMI_SITE_DOMAIN,
                UMAMI_REPORT_FILE, UMAMI_REPORT_CONTENT)
                                       .catch(rethrow);
      if ('targetFile' in reportResult) {
        console.info(`Generated : ${reportResult.targetFile}`);
      }
    } catch (error) {
      console.info(`ERROR: ${error}`)
    }
}

actionUmamiReport();