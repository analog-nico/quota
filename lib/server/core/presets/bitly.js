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
 * @returns {Manager}
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
        limit: 5,
        throttling: 'limit-concurrency',
        queueing: 'fifo',
        systemOfRecord: options.sharedIPAddress ? 'database' : 'self',
        scope: options.sharedIPAddress ? ['ipAddress'] : [],
        resource: 'requests'
    });

    return quota;

};
