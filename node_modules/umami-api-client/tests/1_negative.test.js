import UmamiClient from '../src/UmamiClient.js';

import chai from 'chai';
const should = chai.should;
const expect = chai.expect;

describe("Test UmamiClient negative cases", function() {
  before(function () {
    delete process.env.UMAMI_SERVER;
  });

  it("should not work without server" , async function() {
      expect(function () { new UmamiClient(); } ).to.throw("server is required. ie. set UMAMI_SERVER environment variable or option.");
  });

});