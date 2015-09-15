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
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        stickySessions: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        backoff: 'exponential' // Reference implementation: https://github.com/google/google-http-java-client/blob/346a896b201a784533fab6f5d0214dc62db21a70/google-http-client/src/main/java/com/google/api/client/util/ExponentialBackOff.java
    });

    quota.addRule({
        throttling: 'on-error',
        queueing: 'fifo',
        systemOfRecord: options.stickySessions ? 'self' : 'database',
        scope: ['userId'],
        resources: ['requests']
    });

    return quota;

};
