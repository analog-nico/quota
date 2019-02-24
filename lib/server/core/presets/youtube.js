'use strict';

var _ = require('lodash');
var moment = require('moment');

const Manager = require('../Manager');


/**
 * Quota Preset for YouTube Analytics API
 *
 * Quota rules based on: https://developers.google.com/youtube/analytics/v1/quota
 * As well as the information provided in the Google Developer Console
 *
 * YouTube Analytics API docs: https://developers.google.com/youtube/analytics/
 *
 * YouTube Data API and YouTube Reporting API not yet supported.
 *
 * In a cluster environment a local Server can be used if all requests on
 * behalf a particular user are only made by a single node.js instance.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    // Note: Daily quotas refresh at midnight PST.
    function getStartOfNextWindow() {
        return moment.utc().startOf('day').add(1, 'day').add(8, 'hours').valueOf();
    }

    _.defaults(options, {
        requestsPerSecondPerUser: 12
    });

    var manager = new Manager({
        backoff: 'exponential' // Reference implementation: https://github.com/google/google-http-java-client/blob/346a896b201a784533fab6f5d0214dc62db21a70/google-http-client/src/main/java/com/google/api/client/util/ExponentialBackOff.java
    });

    manager.addRule({
        limit: 100000,
        throttling: {
            type: 'window-fixed',
            getStartOfNextWindow: getStartOfNextWindow
        },
        resource: 'requests'
    });

    manager.addRule({
        limit: options.requestsPerSecondPerUser,
        window: 1000,
        throttling: 'window-sliding',
        queueing: 'fifo',
        scope: 'userId',
        resource: 'requests'
    });

    return manager;

};
