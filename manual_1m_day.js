import Manual from './manual.js';

const manual = new Manual();

let options = manual.getOptions()
    options.period = '1month';
    options.unit = 'day';
manual.report(options)
    .then(console.log)
    .catch(console.error);