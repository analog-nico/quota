'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 * Quota Preset for YouTube
 *
 * Quota rules based on: https://developers.google.com/youtube/analytics/v1/quota
 * YouTube Analytics API docs: https://developers.google.com/youtube/analytics/
 *
 * YoutTube Data API not yet supported.
 *
 * @param options
 * @returns {Quota}
 */
module.exports = function (options) {

    _.defaults(options, {
        stickySessions: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        backoff: 'exponential'
    });

    quota.addRule({
        quota: Infinity,
        queueing: 'fifo', // <-- !!!
        throttling: 'cuttoff',
        systemOfRecord: options.stickySessions ? 'self' : 'database',
        scope: ['userId'],
        resources: ['requests']
    });

    return quota;

};
