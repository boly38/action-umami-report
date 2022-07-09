import UmamiClient from '../src/UmamiClient.js';

import { strict as assert } from 'assert';
import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
chai.should();

const TEST_VERBOSE = process.env.TEST_VERBOSE === 'true'
var client;
var authData = null;
var sitesData = null;
var siteData = null;

describe("Test UmamiClient env based cases", function() {
  before(function () {
    if (!isSet(process.env.UMAMI_SERVER)) {
      console.log("skip without UMAMI_SERVER, you must setup your env to play success cases")
      this.skip();
    }
    client = new UmamiClient();
    if (TEST_VERBOSE) {
      console.info("Test against umami server: "+process.env.UMAMI_SERVER);
    }
  });

  it("should login" , async function() {
    if (!isSet(process.env.UMAMI_USER) || !isSet(process.env.UMAMI_PASSWORD)) {
      console.log("skip without UMAMI_USER, UMAMI_PASSWORD")
      this.skip();
    }
    authData = await client.login(process.env.UMAMI_USER, process.env.UMAMI_PASSWORD).catch(_expectNoError);
    authData.should.not.be.empty;
    authData.token.should.not.be.empty;
  });

  it("should not login" , async function() {
    try {
      await client.login("admin","hack!Me");
    } catch(error) {
      assert.equal(error, `401 - Login failed - 401 Unauthorized`);
    }
  });

  it("should get sites" , async function() {
    expectAuthData();
    sitesData = await client.getSites(authData).catch(_expectNoError);
    if (!isSet(sitesData) || sitesData.length < 1) {
      console.info(" x none");
    } else if (TEST_VERBOSE) {
      sitesData.forEach(siteData => {
        console.info(" * #"+ siteData.website_uuid + " created_at:"+ siteData.created_at + " - name:"+ siteData.name + " domain:" + siteData.domain);
      })
    }
    sitesData.should.not.be.empty;
  });

  it("should get sites by domain" , async function() {
    expectSitesData();
    siteData = client.selectSiteByDomain(sitesData, sitesData[0].domain);
    if (!isSet(siteData) && TEST_VERBOSE) {
      console.info(" x none");
    } else if (TEST_VERBOSE){
      console.info(" * #"+ siteData.website_uuid + " created_at:"+ siteData.created_at + " - name:"+ siteData.name + " domain:" + siteData.domain);
    }
    siteData.should.not.be.empty;
    expect(siteData).to.be.eql(client.selectSiteByDomain(sitesData)); // return first by default
    expect(siteData).to.be.eql(client.selectSiteByDomain(sitesData, '*first*'));
  });

  it("should GET /api/website/{id}/stats" , async function() {
    expectAuthAndSiteData();
    var siteDataResult = await client.getStatsForLast24h(authData, siteData);
    assumeNotEmptyListResult('stats', siteDataResult);
  });

  it("should GET /api/website/{id}/pageviews" , async function() {
    expectAuthAndSiteData();
    var siteDataResult = await client.getPageViewsForLast24h(authData, siteData);
    assumeNotEmptyListResult('pageviews', siteDataResult);
  });

  it("should GET /api/website/{id}/events" , async function() {
    expectAuthAndSiteData();
    var siteDataResult = await client.getEventsForLast24h(authData, siteData);
    assumeNotEmptyListResult('events', siteDataResult);
  });

  // all types are : ['url', 'referrer', 'browser', 'os', 'device', 'country', 'event']
  it("should GET /api/website/{id}/metrics" , async function() {
    expectAuthAndSiteData();
    for (const type of ['url', 'referrer']) {
      var siteDataResult = await client.getMetricsForLast24h(authData, siteData, {type});
      assumeNotEmptyListResult(`metrics type:${type}`, siteDataResult);
    };

  });
});

const isSet = (value) => value !== null && value !== undefined;
const _expectNoError = (err) => expect.fail(err);
const expectAuthData = () => {
  if (!isSet(authData) || !isSet(authData.token)) {
    console.log("skip without authData")
    this.skip();
  }
}
const expectSitesData = () => {
  if (!isSet(sitesData)) {
    console.log("skip without sitesData")
    this.skip();
  }
}
const expectSiteData = () => {
  if (!isSet(siteData)) {
    console.log("skip without siteData")
    this.skip();
  }
}
const expectAuthAndSiteData = () => {
  expectAuthData();
  expectSiteData();
}
const assumeNotEmptyListResult = (description, siteResultList) => {
  if (!isSet(siteResultList) && TEST_VERBOSE) {
    console.info(" x none");
  } else if (TEST_VERBOSE){
    console.info(` * ${siteData.domain} ${description}: ${JSON.stringify(siteResultList)}`);
  }
  siteResultList.should.not.be.empty;
}