'use strict';

var Manager = require('../manager.js');
var _ = require('lodash');

/**
 * Quota Preset for YouTube
 *
 * Quota rules based on: https://developers.google.com/youtube/analytics/v1/quota
 * YouTube Analytics API docs: https://developers.google.com/youtube/analytics/
 *
 * YoutTube Data API not yet supported.
 *
 * In a cluster environment a local Server can be used if all requests on
 * behalf a particular user are only made by a single node.js instance.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    var manager = new Manager({
        backoff: 'exponential' // Reference implementation: https://github.com/google/google-http-java-client/blob/346a896b201a784533fab6f5d0214dc62db21a70/google-http-client/src/main/java/com/google/api/client/util/ExponentialBackOff.java
    });

    manager.addRule({
        throttling: 'unlimited',
        queueing: 'fifo',
        scope: 'userId',
        resource: 'requests'
    });

    return manager;

};
