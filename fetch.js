import Manual from './manual.js';

const manual = new Manual();

var options = manual.getOptions()
    options.period = '1month';
    options.unit = 'day';
manual.fetch(options);