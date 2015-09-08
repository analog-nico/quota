'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 * Quota Preset for Facebook
 *
 * Quota rules based on: https://developers.facebook.com/docs/marketing-api/api-rate-limiting
 * Graph API docs: https://developers.facebook.com/docs/graph-api
 * Pages API (part of Graph API) docs: https://developers.facebook.com/docs/pages
 * Marketing API docs: https://developers.facebook.com/docs/marketing-apis
 *
 * @param options
 * @returns {Quota}
 */
module.exports = function (options) {

    _.defaults(options, {
        api: 'graph'
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        backoff: 'timeout'
    });

    if (options.api === 'graph') {

        quota.addRule({
            quota: Infinity,
            every: 30*60*1000, // The call will be blocked for 30 minutes.
            queueing: 'none',
            throttling: 'linear',
            systemOfRecord: 'self',
            scope: [],
            resources: ['requests']
        });

    }

    if (options.api === 'marketing') {

        quota.addRule({
            quota: Infinity,
            every: 60*1000, // The call will be blocked for a minute.
            queueing: 'none',
            throttling: 'linear',
            systemOfRecord: 'self',
            scope: [],
            resources: ['requests']
        });

        // For each ad set, the budget is only allowed to change 4 times per hour
        quota.addRule({
            quota: 4,
            every: 60*60*1000, // The call will be blocked for a minute.
            queueing: 'fifo',
            throttling: 'linear',
            systemOfRecord: 'database',
            scope: ['adSetId'],
            resources: ['budgetChange']
        });

    }

    return quota;

};
