'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 * Quota Preset for The Echonest
 *
 * Quota rules based on: http://developer.echonest.com/docs/v4#rate-limits
 * The Echonest API docs: http://developer.echonest.com/docs/v4
 *
 * @param options
 * @returns {Quota}
 */
module.exports = function (options) {

    var quota = new Quota({
        //cancelAfter: 1000,
        backoff: 'timeout'
    });

    quota.addRule({
        quota: 120,
        every: 60*1000,
        queueing: 'fifo',
        throttling: 'linear',
        systemOfRecord: 'database',
        scope: [],
        resources: ['requests']
    });

    return quota;

};
