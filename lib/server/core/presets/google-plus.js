'use strict';

var _ = require('lodash');
var moment = require('moment');

const Manager = require('../Manager');

/**
 * Quota Preset for Google+
 *
 * Quota rules based on: https://developers.google.com/+/web/api/rest/#quota
 * Google+ API docs: https://developers.google.com/+/api/
 *
 * In a cluster environment a local Server can be used if all requests on
 * behalf a particular user are only made by a single node.js instance and the
 * overall daily limits are unlikely to be reached.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    // Note: Daily quotas refresh at midnight PST.
    function getStartOfNextWindow() {
        return moment.utc().startOf('day').add(1, 'day').add(8, 'hours').valueOf();
    }

    var manager = new Manager({
        backoff: 'timeout'
    });

    // Google+ API (Sign-in)

    manager.addRule({
        limit: 20000000,
        throttling: {
            type: 'window-fixed',
            getStartOfNextWindow: getStartOfNextWindow
        },
        resource: 'signInRequests'
    });

    manager.addRule({
        limit: 5,
        window: 1000,
        throttling: 'window-sliding',
        queueing: 'fifo',
        scope: 'userId',
        resource: 'signInRequests'
    });

    // Google+ API - For all other methods.

    manager.addRule({
        limit: 10000,
        throttling: {
            type: 'window-fixed',
            getStartOfNextWindow: getStartOfNextWindow
        },
        resource: 'requests'
    });

    manager.addRule({
        limit: 5,
        window: 1000,
        throttling: 'window-sliding',
        queueing: 'fifo',
        scope: 'userId',
        resource: 'requests'
    });

    return manager;

};
