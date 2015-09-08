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
 * @returns {Quota}
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
        quota: 5000,
        every: 60*60*1000,
        queueing: 'fifo',
        throttling: 'linear',
        systemOfRecord: options.authenticated && options.stickySessions ? 'self' : 'database',
        scope: options.authenticated ? ['userId'] : [],
        resources: ['requests']
    });

    if (options.authenticated) {

        quota.addRule({
            quota: options.signedCalls ? 100 : 30,
            every: 60*60*1000,
            queueing: 'fifo',
            throttling: 'linear',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: ['userId'],
            resources: ['endpointLikes']
        });

        quota.addRule({
            quota: options.signedCalls ? 60 : 15,
            every: 60*60*1000,
            queueing: 'fifo',
            throttling: 'linear',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: ['userId'],
            resources: ['endpointComments']
        });

        quota.addRule({
            quota: options.signedCalls ? 60 : 20,
            every: 60*60*1000,
            queueing: 'fifo',
            throttling: 'linear',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: ['userId'],
            resources: ['endpointRelationships']
        });

    }

    return quota;

};
