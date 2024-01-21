import UmamiClient from '../src/UmamiClient.js';
import {env} from 'node:process';

import {strict as assert} from 'assert';
import {expect, should} from 'chai';

should();

const testClient = new UmamiClient({server: 'https://fake.umami.exemple.com'});

const validSiteData = {
    id: 'uuu44-4444-6666',
    name: 'test-site-data',
    domain: 'www.example.com',
    createdAt: '2022-02-17T12:57:43.805Z'
};

describe("Test UmamiClient negative cases", () => {
    before(function () {
        env.UMAMI_SERVER = "";
    });

    it("UmamiClient should not work without server", async () => {
        expect(function () {
            new UmamiClient();
        }).to.throw("server is required. ie. set UMAMI_SERVER environment variable or option.");
    });

    it("getSites should not work without authData", async () => {
        try {
            await testClient.getSites({});
        } catch (error) {
            assert.equal(error, "expect valid auth data to query api");
        }
    });

    it("selectSiteByDomain should not work without siteDatas", async () => {
        expect(function () {
            testClient.selectSiteByDomain([]);
        }).to.throw("No sites data provided");
    });

    it("selectSiteByDomain should not work without valid siteDatas", async () => {
        expect(function () {
            testClient.selectSiteByDomain([{}]);
        }).to.throw("Unexpected sites data provided");
    });

    it("getStats should not work without valid period", async () => {
        try {
            await testClient.getStats({token: 'fake'}, validSiteData, 'SEVEN DAYS');
        } catch (error) {
            expect(error).to.have.string('Unexpected period provided');
            expect(error).to.have.string('Accepted values are');
            expect(error).to.have.string('24h');
            expect(error).to.have.string('1w');
        }
    });

    it("getStats should not work without valid siteData", async () => {
        try {
            await testClient.getStats({token: 'fake'}, {});
        } catch (error) {
            assert.equal(error, "Unexpected site data provided");
        }
    });

    it("getPageViews should not work without valid siteData", async () => {
        try {
            await testClient.getStats({token: 'fake'}, {});
        } catch (error) {
            assert.equal(error, "Unexpected site data provided");
        }
    });

    it("getEvents should not work without valid siteData", async () => {
        try {
            await testClient.getEvents({token: 'fake'}, {});
        } catch (error) {
            assert.equal(error, "Unexpected site data provided");
        }
    });

    it("getMetrics should not work without valid siteData", async () => {
        try {
            await testClient.getMetrics({token: 'fake'}, {});
        } catch (error) {
            assert.equal(error, "Unexpected site data provided");
        }
    });

});