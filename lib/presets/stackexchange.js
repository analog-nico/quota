'use strict';

var Quota = require('../quota.js');
var Rule = require('../rule.js');

var _ = require('lodash');

var generalRuleRPS = null;

/**
 * Quota Preset for StackExchange
 *
 * Quota rules based on: https://api.stackexchange.com/docs/throttle
 * Bitly API docs: https://api.stackexchange.com
 *
 * @param options
 * @returns {Quota}
 */
module.exports = function (options) {

    _.defaults(options, {
        authenticated: true,
        sharedIPAddress: false,
        stickySessions: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        backoff: 'timeout' // TODO: If an application receives a response with the backoff field set, it must wait that many seconds before hitting the same method again.
    });

    // If a single IP is making more than 30 requests a second, new requests will be dropped.
    if (generalRuleRPS === null) {
        generalRuleRPS = new Rule({
            limit: 30,
            window: 1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            systemOfRecord: options.sharedIPAddress ? 'database' : 'self',
            scope: options.sharedIPAddress ? ['ipAddress'] : [],
            resources: ['requests']
        });
    }
    quota.addRule(generalRuleRPS);

    if (options.authenticated) {

        quota.addRule({
            limit: 10000,
            window: 24*60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: ['userId'],
            resources: ['requests']
        });

    } else {

        quota.addRule({
            limit: 10000,
            window: 24*60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            systemOfRecord: options.sharedIPAddress ? 'database' : 'self',
            scope: options.sharedIPAddress ? ['ipAddress'] : [],
            resources: ['requests']
        });

    }

    return quota;

};
