
import action from './lib/action.js'

const core = require('@actions/core');
const github = require('@actions/github');

const umamiServer = core.getInput('umami-server', { required: true });
var umamiUser = core.getInput('umami-user', { required: true });
const umamiPassword = core.getInput('umami-password', { required: true });
const umamiSiteDomain = core.getInput('umami-site-domain');// *first*
const rethrow = (err) => {throw err;}

try {
  if (umamiServer === null || umamiServer === undefined) {
    throw "please setup your environment"
  }
  if (umamiUser === null || umamiUser === undefined) {
    umamiUser = 'admin';
  }

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const reportResult = await action.umamiDailyReportV0(umamiServer, umamiUser, umamiPassword, umamiSiteDomain).catch(rethrow);
  core.info(`Generated : ${reportResult.targetFile}`);
} catch (error) {
  console.info(`ERROR: ${error}`)
  core.setFailed(error);
}
