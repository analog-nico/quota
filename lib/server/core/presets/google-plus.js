'use strict';

var Manager = require('../manager.js');
var _ = require('lodash');

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

    // TODO: Note: Daily quotas refresh at midnight PST.

    _.defaults(options, {
        stickySessions: false
    });

    var manager = new Manager({
        backoff: 'timeout'
    });

    // Google+ API (Sign-in)

    manager.addRule({
        limit: 20000000,
        window: 24*60*60*1000,
        throttling: 'window-fixed',
        queueing: 'none',
        resource: 'signInRequests'
    });

    manager.addRule({
        limit: 5,
        window: 1000,
        throttling: 'window-fixed',
        queueing: 'fifo',
        scope: 'userId',
        resource: 'signInRequests'
    });

    // Google+ API - For all other methods.

    manager.addRule({
        limit: 10000,
        window: 24*60*60*1000,
        throttling: 'window-fixed',
        queueing: 'none',
        resource: 'requests'
    });

    manager.addRule({
        limit: 5,
        window: 1000,
        throttling: 'window-fixed',
        queueing: 'fifo',
        scope: 'userId',
        resource: 'requests'
    });

    return manager;

};
