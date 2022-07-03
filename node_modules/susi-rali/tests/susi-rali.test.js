import SusiRali from '../lib/SusiRali.js';
import TestHelperJs from './TestHelper.js';
import { strict as assert } from 'assert';
import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
should();

const testHelper = new TestHelperJs();

describe("Test SusiRali pause and restart", function() {

  it("should rate limit, sleep and rate limit again", async function() {

    async function testPromise(batchCount, sleepTimeMs, counterWindows) {
      const start = new Date();
      await testHelper.countEachWindow(start, counterWindows, batchCount*2, susi);

      console.log(`FIRST LAUNCH`)
      for (var i=0;i<batchCount;i++) {
           await susi.limitedCall(() => testHelper.businessCode("First"+i,0))
                     .then((result)=>console.log(">" + result));
      }
      var duration = new Date() - start;
      console.log(`DD duration: ${duration}ms ${testHelper.nbDone} / ${testHelper.nbDoneAll}`);
      await testHelper.sleep(sleepTimeMs);

      console.log(`SECOND LAUNCH`)
      for (var j=0;j<batchCount;j++) {
           await susi.limitedCall(() => testHelper.businessCode("Second"+j,0))
                     .then((result)=>console.log(">" + result));
      }
      var duration = new Date() - start;

      return duration;
    }

    const counterWindows=1000;
    const windowsMs=1000;
    const maxQueryPerWindow=30;
    const debugEnabled=true;

    const nbEntries = 50;
    const sleepTimeMs = 2000;

    testHelper.reset();

    const susi = new SusiRali({windowsMs, maxQueryPerWindow, debugEnabled});
    var duration = await testPromise(nbEntries, sleepTimeMs, counterWindows);

    expect(testHelper.maxQ).to.be.lt(maxQueryPerWindow);
    expect(testHelper.maxP).to.be.lt(maxQueryPerWindow);

    await testHelper.sleep(counterWindows*4);// end of counter must be reached to start next
  });


});
