import Manual from './manual.js';

const manual = new Manual();

var options = manual.getOptions()
    options.period = '1week';
    options.unit = 'day';
manual.report(options);