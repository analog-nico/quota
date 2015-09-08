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
 * @returns {Quota}
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
        quota: 20000000,
        every: 24*60*60*1000,
        queueing: 'none',
        throttling: 'cuttoff',
        systemOfRecord: 'database',
        scope: [],
        resources: ['signInRequests']
    });

    quota.addRule({
        quota: 5,
        every: 1000,
        queueing: 'fifo',
        throttling: 'cuttoff',
        systemOfRecord: options.stickySessions ? 'self' : 'database',
        scope: ['userId'],
        resources: ['signInRequests']
    });

    // Google+ API - For all other methods.

    quota.addRule({
        quota: 10000,
        every: 24*60*60*1000,
        queueing: 'none',
        throttling: 'cuttoff',
        systemOfRecord: 'database',
        scope: [],
        resources: ['requests']
    });

    quota.addRule({
        quota: 5,
        every: 1000,
        queueing: 'fifo',
        throttling: 'cuttoff',
        systemOfRecord: options.stickySessions ? 'self' : 'database',
        scope: ['userId'],
        resources: ['requests']
    });

    return quota;

};
