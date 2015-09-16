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
 * @returns {Manager}
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
            throttling: 'on-error', // The call will be blocked for 30 minutes.
            queueing: 'none',
            systemOfRecord: 'self',
            scope: [],
            resource: 'requests'
        });

    }

    if (options.api === 'marketing') {

        quota.addRule({
            throttling: 'on-error', // The call will be blocked for a minute.
            queueing: 'none',
            systemOfRecord: 'self',
            scope: [],
            resource: 'requests'
        });

        // For each ad set, the budget is only allowed to change 4 times per hour
        quota.addRule({
            limit: 4,
            window: 60*60*1000, // The call will be blocked for a minute.
            throttling: 'window-sliding',
            queueing: 'fifo',
            systemOfRecord: 'database',
            scope: ['adSetId'],
            resource: 'budgetChange'
        });

    }

    return quota;

};
