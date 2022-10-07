import action from './lib/action.js'
import core from '@actions/core';
import github from '@actions/github';

const UMAMI_SERVER = process.env.UMAMI_SERVER || null; // "umami.exemple.com";
const UMAMI_USER = process.env.UMAMI_USER || "admin";
const UMAMI_PASSWORD = process.env.UMAMI_PASSWORD || null;
const UMAMI_SITE_DOMAIN = process.env.UMAMI_SITE_DOMAIN;
const UMAMI_REPORT_FILE = process.env.UMAMI_REPORT_FILE || "umamiReport.txt";
const UMAMI_REPORT_CONTENT = process.env.UMAMI_REPORT_CONTENT || "pageviews|events|urls";
const rethrow = (err) => {throw err;}

class Manual {

  getOptions() {
      if (UMAMI_SERVER === null) {
        throw "please setup your environment UMAMI_SERVER, UMAMI_USER, UMAMI_PASSWORD, UMAMI_SITE_DOMAIN"
      }
      var options = {};
      options.server = "https://" + UMAMI_SERVER;
      options.user = UMAMI_USER;
      options.password = UMAMI_PASSWORD;
      options.domain = UMAMI_SITE_DOMAIN;
      options.outputFile = UMAMI_REPORT_FILE;
      options.reportContent = UMAMI_REPORT_CONTENT;
      options.period = '24h';
      options.unit = 'hour';
      options.tz = 'Europe/Paris';
      return options;
  }

  async fetch(options = {}) {
    try {
      const reportResult = await action.fetchUmamiServerApi(options.server).catch(rethrow);
    } catch (error) {
      console.info(`ERROR: ${error}`)
    }
  }

  async report(options = {}) {
    try {
      const reportResult = await action.umamiReport(options).catch(rethrow);
      if ('targetFile' in reportResult) {
        console.info(`Generated : ${reportResult.targetFile}`);
      }
    } catch (error) {
      console.info(`ERROR: ${error}`)
    }
  }

}
export default Manual;