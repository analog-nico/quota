'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 * Quota Preset for GitHub
 *
 * Quota rules based on: https://developer.github.com/v3/#rate-limiting
 * GitHub API docs: https://developer.github.com/v3/
 *
 * @param options
 * @returns {Quota}
 */
module.exports = function (options) {

    _.defaults(options, {
        authenticated: true,
        forSearchAPI: false,
        stickySessions: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        throttling: 'cutoff',
        backoff: 'timeout'
    });

    var ruleOptions = {
        queueing: 'linear',
        scopeAttr: ['userId']
    };

    if (options.forSearchAPI) {

        _.assign(ruleOptions, {
            slots: options.authenticated ? 30 : 10,
            every: 60*1000
        });

    } else {

        _.assign(ruleOptions, {
            slots: options.authenticated ? 5000 : 60,
            every: 60*60*1000
        });

    }

    if (!stickySessions) {

        _.assign(ruleOptions, {
            scopeManager: 'database'
        });

    }

    quota.addRule(ruleOptions);

    return quota;

};
