import action from './lib/action.js'
import core from '@actions/core';
import github from '@actions/github';

const umamiServer = core.getInput('umami-server', { required: true });
const umamiUser = core.getInput('umami-user', { required: true });
const umamiPassword = core.getInput('umami-password', { required: true });
const umamiSiteDomain = core.getInput('umami-site-domain');// *first*
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
        throw "please setup your environment"
      }
      var options = {};
      options.server = umamiServer;
      options.user = umamiUser;
      options.password = umamiPassword;
      options.domain = umamiSiteDomain;
      options.outputFile = umamiReportFile;
      options.reportContent = umamiReportContent;
      options.period = umamiPeriod;
      options.unit = umamiUnit;
      options.tz = umamiTz;
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

actionUmamiReport();