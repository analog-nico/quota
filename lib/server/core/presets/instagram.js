'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 * Quota Preset for Instagram
 *
 * Quota rules based on: https://instagram.com/developer/limits/
 * Instagram API docs: https://instagram.com/developer/
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        authenticated: true,
        signedCalls: false,
        stickySessions: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        //backoff: 'timeout'
    });

    quota.addRule({
        limit: 5000,
        window: 60*60*1000,
        throttling: 'window-sliding',
        queueing: 'fifo',
        systemOfRecord: options.authenticated && options.stickySessions ? 'self' : 'database',
        scope: options.authenticated ? ['userId'] : [],
        resources: ['requests']
    });

    if (options.authenticated) {

        quota.addRule({
            limit: options.signedCalls ? 100 : 30,
            window: 60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: ['userId'],
            resources: ['endpointLikes']
        });

        quota.addRule({
            limit: options.signedCalls ? 60 : 15,
            window: 60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: ['userId'],
            resources: ['endpointComments']
        });

        quota.addRule({
            limit: options.signedCalls ? 60 : 20,
            window: 60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: ['userId'],
            resources: ['endpointRelationships']
        });

    }

    return quota;

};
