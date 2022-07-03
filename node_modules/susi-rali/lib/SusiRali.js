const rateLowerLimitRateMs = 30;

class SusiRali {

  constructor(options) {
    this.windowsMs = 'windowsMs' in options ? options.windowsMs : 1000;
    this.maxQueryPerWindow = 'maxQueryPerWindow' in options ? options.maxQueryPerWindow : 10;
    this.maxProcessingPerWindow = 'maxProcessingPerWindow' in options ? options.maxProcessingPerWindow : this.maxQueryPerWindow;
    this.debugEnabled = 'debugEnabled' in options ? options.debugEnabled : false;
    this.warnEnabled = 'warnEnabled' in options ? options.warnEnabled : false;
    if (this.maxQueryPerWindow < 1) { throw "invalid maxQueryPerWindow - must be greater than 0"; }
    if (this.windowsMs < 100) { throw "invalid windowsMs - must be greater than 100"; }
    //~ internal
    this.maxTicWithoutActivity = 5;
    this.ticEnabled = false;
    this.ticWithoutActivity = 0;
    this.queue = [];
    this.processing = 0;
    this.firstTic = false;
    this.isConsuming = false;
    this.consumePeriod = Math.floor(this.windowsMs / this.maxQueryPerWindow);
    if (this.consumePeriod < rateLowerLimitRateMs) {
      this.warn(`SusiRali reached limitation to process query at rate under ${rateLowerLimitRateMs}ms (${this.consumePeriod})`);
      this.consumePeriod = rateLowerLimitRateMs;
    }
    this.debug(`SusiRali ${this.maxQueryPerWindow}q,${this.maxProcessingPerWindow}p/${this.windowsMs}ms c @${this.consumePeriod}ms`);
  }

  debug(msg) {
    if (!this.debugEnabled) {
      return;
    }
    console.log(msg);
  }

  warn(msg) {
    if (!this.warnEnabled) {
      return;
    }
    console.log(msg);
  }

  debugInline(msg) {
    if (!this.debugEnabled) {
      return;
    }
    process.stdout.write(msg);
  }

  async limitedCall(promiseCallback) {
    var susi = this;
    return new Promise(async function(resolve, reject) {
      await susi.requestPromise()
        .then(() => {
           susi.processing++;
           promiseCallback()
                .then((result) => {
                    resolve(result);
                    susi.processing--;
                })
                .catch((err) => {
                    reject(err);
                    susi.processing--;
                })
       })
       .catch(reject);
    });
  }

  requestPromise() {
    var susi = this;
    return new Promise(async function(resolve, reject) {
      await susi.removeToken(resolve).catch(reject);
    });
  }

  async removeToken(callback) {
    this.debugInline('+');
    this.queue.push(callback);
    if (!this.ticEnabled) {
      this.ticStart();
    }
  }

  async ticStart() {
    this.debug('ticStart');
    this.ticEnabled = true;
    this.ticWithoutActivity = 0;
    this.tic();
  }

  getProcessing() {
    const p = this.processing;
    return p;
  }

  hasQueueContent() {
    return (this.queue.length > 0);
  }

  hasToken() {
    return (this.tokens >= 1);
  }

  hasWorkInProgress() {
    return (this.processing > 0);
  }

  isNewProcessingAllowed() {
    return (this.maxProcessingPerWindow == null || this.processing < this.maxProcessingPerWindow);
  }

  consume(firstConsume = false) {
    if (firstConsume === false  // first consume cant pop because we have no information about previous processing
    && this.hasQueueContent() && this.isNewProcessingAllowed()) {
      this.queue.shift()();
      this.ticWithoutActivity = 0;
      this.debugInline('-');
    }
    if (this.hasQueueContent()) {
      setTimeout(this.consume.bind(this),this.consumePeriod);
    } else {
      this.isConsuming = false;
    }
  }

  tic() {
    const batchWindow = this.maxQueryPerWindow < 10 ? this.windowsMs : Math.ceil(this.windowsMs/10);
    this.debug(`T${this.ticWithoutActivity > 0 ? this.ticWithoutActivity : ""}[p${this.processing}](q${this.queue.length})`);
    if (++this.ticWithoutActivity >= this.maxTicWithoutActivity && this.processing < 1 && !this.hasQueueContent()) {
      this.debug('tic disabled');
      this.ticEnabled = false;
      return;
    }
    if (this.isConsuming === false) {
      this.isConsuming = true;
      this.consume(true);
    }
    setTimeout(this.tic.bind(this), batchWindow);
  }

}

export default SusiRali;
