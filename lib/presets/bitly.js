'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 * Quota Preset for Bitly
 *
 * Quota rules based on: http://dev.bitly.com/rate_limiting.html
 * Bitly API docs: http://dev.bitly.com/api.html
 *
 * @param options
 * @returns {Quota}
 */
module.exports = function (options) {

    _.defaults(options, {
        sharedIPAddress: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        backoff: 'timeout' // If you are experiencing rate limiting errors, please wait 60 minutes to resume making API calls.
    });

    // five concurrent connections from a single IP address
    quota.addRule({
        quota: 5,
        concurrent: true,
        queueing: 'fifo',
        throttling: 'cuttoff',
        systemOfRecord: options.sharedIPAddress ? 'database' : [],
        scope: options.sharedIPAddress ? ['ipAddress'] : [],
        resources: ['requests']
    });

    return quota;

};
