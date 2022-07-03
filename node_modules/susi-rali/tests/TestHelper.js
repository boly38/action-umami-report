class TestHelper {

  reset() {
    this.nbDoneAll = 0;
    this.nbDone = 0;

    this.maxQ = 0;// max query start per window
    this.maxP = 0;// max processing at a time
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  businessCode(extra, waitFactorMs=1000) {
    this.nbDone++;
    this.nbDoneAll++;
    // console.log(`${nbDone} : businessCode(${extra})`);
    return new Promise((resolve) => {
      this.sleep(this.getRandomInt(4)*waitFactorMs).then(() => resolve(`R[${extra}]`));
    });
  }

  async countEachWindow(start, counterWindows, maxSend, susi) {
    const duration = new Date() - start;
    const p = susi.getProcessing();
    if (this.nbDoneAll > 0) {
      console.log(`duration: ${duration}ms => ${this.nbDone} / ${this.nbDoneAll}..${maxSend} - ${p} processing`)
      this.maxQ = Math.max(this.nbDone, this.maxQ);
      this.maxP = Math.max(p, this.maxP);
      this.nbDone = 0;
    }
    if (this.nbDoneAll !== maxSend && duration < 60000) {
      setTimeout(this.countEachWindow.bind(this), counterWindows, start, counterWindows, maxSend, susi);
    } else {
      console.log(`countEachWindow done ${maxSend}`)
    }
  }

  _expectNoError(err) {
    console.trace()
    expect.fail(err);
  }
}

export default TestHelper;