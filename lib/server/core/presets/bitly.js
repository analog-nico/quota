'use strict';

const Manager = require('../Manager');
var _ = require('lodash');

/**
 * Quota Preset for Bitly
 *
 * Quota rules based on: http://dev.bitly.com/rate_limiting.html
 * Bitly API docs: http://dev.bitly.com/api.html
 *
 * In a cluster environment a local Server can be used if each node.js instance
 * is reached via a different IP address from the internet.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        concurrentRequests: 5,
        sharedIPAddress: false
    });

    var manager = new Manager({
        backoff: 'timeout' // If you are experiencing rate limiting errors, please wait 60 minutes to resume making API calls.
    });

    // five concurrent connections from a single IP address
    var ruleOptions = {
        limit: options.concurrentRequests,
        throttling: 'limit-concurrency',
        queueing: 'fifo',
        resource: 'requests'
    };

    if (options.sharedIPAddress) {
        ruleOptions.scope = 'ipAddress';
    }

    manager.addRule(ruleOptions);

    return manager;

};
