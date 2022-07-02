import action from './lib/action.js'
import core from '@actions/core';
import github from '@actions/github';

const UMAMI_SERVER = process.env.UMAMI_SERVER || null; // "https://umami.exemple.com";
const UMAMI_USER = process.env.UMAMI_USER || "admin";
const UMAMI_PASSWORD = process.env.UMAMI_PASSWORD || null;
const UMAMI_SITE_DOMAIN = process.env.UMAMI_SITE_DOMAIN || "*first*";
const rethrow = (err) => {throw err;}

try {
  if (UMAMI_SERVER === null) {
    throw "please setup your environment UMAMI_SERVER, UMAMI_USER, UMAMI_PASSWORD, UMAMI_SITE_DOMAIN"
  }
  const reportResult = await action.umamiDailyReportV0(UMAMI_SERVER, UMAMI_USER, UMAMI_PASSWORD, UMAMI_SITE_DOMAIN)
                                   .catch(rethrow);
  console.info(`Generated : ${reportResult.targetFile}`);
} catch (error) {
  console.info(`ERROR: ${error}`)
}
