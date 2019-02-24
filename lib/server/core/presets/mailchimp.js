'use strict';

const Manager = require('../Manager');
var _ = require('lodash');

/**
 * Quota Preset for MailChimp
 *
 * Quota rules based on: http://kb.mailchimp.com/api/article/about-connectivity-and-timeouts
 * MailChimp API docs: http://kb.mailchimp.com/api
 *
 * In a cluster environment a local Server can be used if all requests on
 * behalf a particular user are only made by a single node.js instance.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        concurrentRequests: 10
    });

    var manager = new Manager({
        //backoff: 'timeout'
    });

    // Each user account is permitted up to 10 simultaneous connections
    manager.addRule({
        limit: options.concurrentRequests,
        throttling: 'limit-concurrency',
        queueing: 'fifo',
        scope: 'userId',
        resource: 'requests'
    });

    return manager;

};
