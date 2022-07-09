import UmamiClient from '../src/UmamiClient.js';

import { strict as assert } from 'assert';
import chai from 'chai';
const should = chai.should;
const expect = chai.expect;

var testClient = new UmamiClient({server:'https://fake.umami.exemple.com'})

describe("Test UmamiClient negative cases", function() {
  before(function () {
    delete process.env.UMAMI_SERVER;
  });

  it("UmamiClient should not work without server" , async function() {
      expect(function () { new UmamiClient(); } ).to.throw("server is required. ie. set UMAMI_SERVER environment variable or option.");
  });

  it("getSites should not work without authData" , async function() {
      try {
        await testClient.getSites({})
      } catch(error) {
        assert.equal(error, "expect valid auth data to query api")
      }
  });

  it("selectSiteByDomain should not work without siteDatas" , async function() {
      expect(function () { testClient.selectSiteByDomain([]) } ).to.throw("No sites data provided");
  });

  it("selectSiteByDomain should not work without valid siteDatas" , async function() {
      expect(function () { testClient.selectSiteByDomain([{}]) } ).to.throw("Unexpected sites data provided");
  });

  it("getStatsForLast24h should not work without valid siteDatas" , async function() {
      try {
        await testClient.getStatsForLast24h({token:'fake'}, [{}]);
      } catch(error) {
        assert.equal(error, "Unexpected site data provided")
      }
  });

  it("getPageViewsForLast24h should not work without valid siteDatas" , async function() {
      try {
        await testClient.getStatsForLast24h({token:'fake'}, [{}]);
      } catch(error) {
        assert.equal(error, "Unexpected site data provided")
      }
  });

  it("getEventsForLast24h should not work without valid siteDatas" , async function() {
      try {
        await testClient.getEventsForLast24h({token:'fake'}, [{}]);
      } catch(error) {
        assert.equal(error, "Unexpected site data provided")
      }
  });

  it("getMetricsForLast24h should not work without valid siteDatas" , async function() {
      try {
        await testClient.getMetricsForLast24h({token:'fake'}, [{}]);
      } catch(error) {
        assert.equal(error, "Unexpected site data provided")
      }
  });

});