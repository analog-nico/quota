'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 * Quota Preset for MailChimp
 *
 * Quota rules based on: http://kb.mailchimp.com/api/article/about-connectivity-and-timeouts
 * MailChimp API docs: http://kb.mailchimp.com/api
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        stickySessions: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        //backoff: 'timeout'
    });

    // Each user account is permitted up to 10 simultaneous connections
    quota.addRule({
        limit: 10,
        throttling: 'limit-concurrency',
        queueing: 'fifo',
        systemOfRecord: options.stickySessions ? 'self' : 'database',
        scope: ['userId'],
        resources: ['requests']
    });

    return quota;

};
