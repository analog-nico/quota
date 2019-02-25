'use strict';

const _ = require('lodash');

const Manager = require('../Manager');

/**
 * Quota Preset for Instagram
 *
 * Quota rules based on: https://instagram.com/developer/limits/
 * Instagram API docs: https://instagram.com/developer/
 *
 * In a cluster environment a local Server can be used if all requests are
 * authenticated requests and those made on behalf a particular user are only
 * made by a single node.js instance.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        authenticated: true,
        signedCalls: false
    });

    var manager = new Manager({
        //backoff: 'timeout'
    });

    manager.addRule({
        limit: 5000,
        window: 60*60*1000,
        throttling: 'window-sliding',
        queueing: 'fifo',
        scope: options.authenticated ? ['userId'] : [],
        resource: 'requests'
    });

    if (options.authenticated) {

        manager.addRule({
            limit: options.signedCalls ? 100 : 30,
            window: 60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            scope: ['userId'],
            resource: 'postToEndpointLikes'
        });

        manager.addRule({
            limit: options.signedCalls ? 60 : 15,
            window: 60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            scope: ['userId'],
            resource: 'postToEndpointComments'
        });

        manager.addRule({
            limit: options.signedCalls ? 60 : 20,
            window: 60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            scope: ['userId'],
            resource: 'postToEndpointRelationships'
        });

    }

    return manager;

};
