'use strict';

const Manager = require('../Manager');
var _ = require('lodash');

/**
 * Quota Preset for GitHub
 *
 * Quota rules based on: https://developer.github.com/v3/#rate-limiting
 * GitHub API docs: https://developer.github.com/v3/
 *
 * In a cluster environment a local Server can be used if all requests are done
 * on behalf of a user (authenticated requests) and request for a particular
 * user are always done by the same node.js instance.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        authenticated: true,
        forSearchAPI: false
    });

    var manager = new Manager({
        backoff: 'timeout'
    });

    var ruleOptions = {
        throttling: 'window-sliding',
        queueing: 'fifo',
        resource: 'requests'
    };

    if (options.authenticated) {
        ruleOptions.scope = 'userId';
    }

    if (options.forSearchAPI) {

        _.assign(ruleOptions, {
            limit: options.authenticated ? 30 : 10,
            window: 60*1000
        });

    } else {

        _.assign(ruleOptions, {
            limit: options.authenticated ? 5000 : 60,
            window: 60*60*1000
        });

    }

    manager.addRule(ruleOptions);

    return manager;

};
