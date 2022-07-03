import UmamiClient from '../src/UmamiClient.js';

import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
chai.should();

const TEST_VERBOSE = process.env.TEST_VERBOSE === 'true'
var client;
var authData = null;
var sitesData = null;
var siteData = null;

describe("Test UmamiClient success cases", function() {
  before(function () {
    if (!isSet(process.env.UMAMI_SERVER)) {
      console.log("skip without UMAMI_SERVER, you must setup your env to play success cases")
      this.skip();
    }
    client = new UmamiClient();
    if (TEST_VERBOSE) {
      console.info("Test agains umami server: "+process.env.UMAMI_SERVER);
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

  it("should get sites" , async function() {
    if (!isSet(authData) || !isSet(authData.token)) {
      console.log("skip without authData")
      this.skip();
    }
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
    if (!isSet(sitesData)) {
      console.log("skip without sitesData")
      this.skip();
    }
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

  it("should get site stats" , async function() {
    if (!isSet(authData) || !isSet(authData.token)) {
      console.log("skip without authData")
      this.skip();
    }
    if (!isSet(siteData)) {
      console.log("skip without siteData")
      this.skip();
    }
    var siteStats = await client.getStatsForLast24h(authData, siteData);
    if (!isSet(siteStats) && TEST_VERBOSE) {
      console.info(" x none");
    } else if (TEST_VERBOSE){
      console.info(" * "+ siteData.domain + " stats:\n"+ JSON.stringify(siteStats));
    }
    siteStats.should.not.be.empty;
  });
});

const isSet = (value) => value !== null && value !== undefined;
const _expectNoError = (err) => expect.fail(err);