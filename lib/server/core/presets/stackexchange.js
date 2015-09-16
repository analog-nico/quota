'use strict';

var Manager = require('../manager.js');
var Rule = require('../rule.js');

var _ = require('lodash');

var generalRuleRPS = null;

/**
 * Quota Preset for StackExchange
 *
 * Quota rules based on: https://api.stackexchange.com/docs/throttle
 * Bitly API docs: https://api.stackexchange.com
 *
 * In a cluster environment a local Server can be used if each node.js instance
 * is reached via a different IP address from the internet and also if all
 * requests on behalf a particular user are only made by a single node.js
 * instance.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        authenticated: true
    });

    var manager = new Manager({
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
            scope: 'ipAddress',
            resource: 'requests'
        });
    }
    manager.addRule(generalRuleRPS);

    if (options.authenticated) {

        manager.addRule({
            limit: 10000,
            window: 24*60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            scope: 'userId',
            resource: 'requests'
        });

    } else {

        manager.addRule({
            limit: 10000,
            window: 24*60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            scope: 'ipAddress',
            resource: 'requests'
        });

    }

    return manager;

};
