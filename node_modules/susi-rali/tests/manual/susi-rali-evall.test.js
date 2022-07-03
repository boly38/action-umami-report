const assert = require('assert').strict;
const expect = require('chai').expect
const SusiRali = require('../../lib/SusiRali.js');
const TestHelper = require('../TestHelper')();

describe("Test SusiRali parallel", function() {

  it("should rate limit parallel x/x", async function() {

    async function testParallelPromise(batchCount, counterWindows, susi) {
      const start = new Date();
      await TestHelper.countEachWindow(start, counterWindows, batchCount, susi);

      console.log(`PARALLEL LAUNCH`)

      var promises = [];
      for (var k=0;k<batchCount;k++) {
        const businessArg = `parallel${k}`;
        promises.push(
         susi.limitedCall(()=>TestHelper.businessCode(businessArg, 50)).then((result)=>console.log(">" + result))
        );
      }
      await Promise.allSettled(promises).catch(TestHelper._expectNoError);

      const duration = new Date() - start;
      console.log(`parallel duration: ${duration}ms ${TestHelper.nbDone} / ${TestHelper.nbDoneAll}`);

      return duration;
    }

    const debugEnabled=true;
    const nbEntries = 100;
    const testContext = [
      {windowsMs: 200, maxQueryPerWindow:7, maxProcessingPerWindow:9},
      {windowsMs: 200, maxQueryPerWindow:14, maxProcessingPerWindow:4},
      {windowsMs: 200, maxQueryPerWindow:10, maxProcessingPerWindow:15},
      {windowsMs: 1000, maxQueryPerWindow:10, maxProcessingPerWindow:10},
      {windowsMs: 2000, maxQueryPerWindow:50, maxProcessingPerWindow:30},
    ];
    const testResults = [];

    for (const context of testContext) {
      console.log(` *** START ${JSON.stringify(context)}`)
      TestHelper.reset();
      const counterWindows = context.windowsMs;
      const susi = new SusiRali({windowsMs: context.windowsMs, maxQueryPerWindow: context.maxQueryPerWindow,
                                 maxProcessingPerWindow: context.maxProcessingPerWindow, debugEnabled});
      var duration = await testParallelPromise(nbEntries, counterWindows, susi);

      testResults.push({context, consumePeriod: susi.consumePeriod, maxQ: TestHelper.maxQ, maxP:TestHelper.maxP});
      await TestHelper.sleep(counterWindows*4);// end of counter must be reached to start next
    }

    console.log(` *** DONE ${JSON.stringify(testResults, null, 4)}`);
  });


});
