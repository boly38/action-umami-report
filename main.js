import action from './lib/action.js'
import core from '@actions/core';
import github from '@actions/github';

const umamiServer = core.getInput('umami-server', { required: true }); // example : https://umami.myinstance.com
const umamiUser = core.getInput('umami-user', { required: true }); // example : admin
const umamiPassword = core.getInput('umami-password', { required: true }); // example : mY53[R3T
const umamiSiteDomain = core.getInput('umami-site-domain');// ''
const umamiReportFile = core.getInput('umami-report-file');// ''
const umamiReportContent = core.getInput('umami-report-content');// 'pageviews|events|urls'
const umamiPeriod = core.getInput('umami-period');// '24h'
const umamiUnit = core.getInput('umami-unit');// 'hour' // used by pageviews and events. need to be correlated to the period
const umamiTz = core.getInput('umami-tz');// 'Europe/Paris'
const rethrow = (err) => {throw err;};

const printContext = () => {
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
};

const actionUmamiReport = async function() {
    try {
      if (umamiServer === null || umamiServer === undefined) {
        throw new Error("please setup your environment");
      }
      let options = {};
      options.server = umamiServer;
      options.user = umamiUser;
      options.password = umamiPassword;
      options.domain = umamiSiteDomain;
      options.outputFile = umamiReportFile;
      options.reportContent = umamiReportContent;
      options.period = umamiPeriod;
      options.unit = umamiUnit;
      options.tz = umamiTz;

      await action.fetchUmamiServerApi(umamiServer);
      // printContext();
      const reportResult = await action.umamiReport(options).catch(rethrow);
      if ('targetFile' in reportResult) {
        core.info(`Generated : ${reportResult.targetFile}`);
      }
    } catch (error) {
      console.info(`ERROR: ${error}`)
      core.setFailed(error);
    }
}

core.info(`PNPM ACTION`);
actionUmamiReport();