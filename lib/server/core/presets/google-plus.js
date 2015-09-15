'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 * Quota Preset for Google+
 *
 * Quota rules based on: https://developers.google.com/+/web/api/rest/#quota
 * Google+ API docs: https://developers.google.com/+/api/
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    // TODO: Note: Daily quotas refresh at midnight PST.

    _.defaults(options, {
        stickySessions: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        backoff: 'timeout'
    });

    // Google+ API (Sign-in)

    quota.addRule({
        limit: 20000000,
        window: 24*60*60*1000,
        throttling: 'window-fixed',
        queueing: 'none',
        systemOfRecord: 'database',
        scope: [],
        resources: ['signInRequests']
    });

    quota.addRule({
        limit: 5,
        window: 1000,
        throttling: 'window-fixed',
        queueing: 'fifo',
        systemOfRecord: options.stickySessions ? 'self' : 'database',
        scope: ['userId'],
        resources: ['signInRequests']
    });

    // Google+ API - For all other methods.

    quota.addRule({
        limit: 10000,
        window: 24*60*60*1000,
        throttling: 'window-fixed',
        queueing: 'none',
        systemOfRecord: 'database',
        scope: [],
        resources: ['requests']
    });

    quota.addRule({
        limit: 5,
        window: 1000,
        throttling: 'window-fixed',
        queueing: 'fifo',
        systemOfRecord: options.stickySessions ? 'self' : 'database',
        scope: ['userId'],
        resources: ['requests']
    });

    return quota;

};
