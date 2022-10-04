import Manual from './manual.js';

const manual = new Manual();

var options = manual.getOptions()
    options.period = '1week';
    options.unit = 'hour';
manual.report(options);