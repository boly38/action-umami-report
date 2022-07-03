import SusiRali from '../lib/SusiRali.js';
import TestHelperJs from './TestHelper.js';
import { strict as assert } from 'assert';
import chai from 'chai';
const should = chai.should;
const expect = chai.expect;
should();

const testHelper = new TestHelperJs();

const debugEnabled=true;
const warnEnabled=true;

describe("Test SusiRali parallel", function() {

  it("should rate limit parallel long queries 7/200", async function() {

    async function testParallelPromise(batchCount, counterWindows) {
      const start = new Date();
      await testHelper.countEachWindow(start, counterWindows, batchCount, susi);

      console.log(`PARALLEL LAUNCH`)

      var promises = [];
      for (var k=0;k<batchCount;k++) {
        const businessArg = `parallel${k}`;
        promises.push(
         susi.limitedCall(()=>testHelper.businessCode(businessArg, 200)).then((result)=>console.log(">" + result))
        );
      }
      await Promise.allSettled(promises).catch(testHelper._expectNoError);

      const duration = new Date() - start;
      console.log(`parallel duration: ${duration}ms ${testHelper.nbDone} / ${testHelper.nbDoneAll}`);

      return duration;
    }

    const counterWindows=200;
    const windowsMs=200;
    const maxQueryPerWindow=7;
    const maxProcessingPerWindow=9;
    const nbEntries = 100;

    testHelper.reset();

    const susi = new SusiRali({windowsMs, maxQueryPerWindow, maxProcessingPerWindow, debugEnabled, warnEnabled});
    var duration = await testParallelPromise(nbEntries, counterWindows);

    expect(testHelper.maxQ).to.be.lte(maxQueryPerWindow);
    expect(testHelper.maxP).to.be.lte(maxProcessingPerWindow);
    await testHelper.sleep(counterWindows*4);// end of counter must be reached to start next
  });


  it("should rate limit parallel long queries 10/1000", async function() {

    async function testParallelPromise(batchCount, counterWindows) {
      const start = new Date();
      await testHelper.countEachWindow(start, counterWindows, batchCount, susi);

      console.log(`PARALLEL LAUNCH`)

      var promises = [];
      for (var k=0;k<batchCount;k++) {
        const businessArg = `parallel${k}`;
        promises.push(
         susi.limitedCall(()=>testHelper.businessCode(businessArg, 200)).then((result)=>console.log(">" + result))
        );
      }
      await Promise.allSettled(promises).catch(testHelper._expectNoError);

      const duration = new Date() - start;
      console.log(`parallel duration: ${duration}ms ${testHelper.nbDone} / ${testHelper.nbDoneAll}`);

      return duration;
    }

    const counterWindows=1000;
    const windowsMs=1000;
    const maxQueryPerWindow=10;
    const maxProcessingPerWindow=10;
    const nbEntries = 20;

    testHelper.reset();

    const susi = new SusiRali({windowsMs, maxQueryPerWindow, maxProcessingPerWindow, debugEnabled, warnEnabled});
    var duration = await testParallelPromise(nbEntries, counterWindows);

    expect(testHelper.maxQ).to.be.lte(maxQueryPerWindow);
    expect(testHelper.maxP).to.be.lte(maxProcessingPerWindow);
    await testHelper.sleep(counterWindows*4);// end of counter must be reached to start next
  });

});
