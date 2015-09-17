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
 * In a cluster environment a local Server may be used if no budget change
 * Marketing API calls are made. However, if all node.js instances shall
 * backoff if the Facebook API sends an out of quota response to one of them
 * then a centralized Server is needed for all API calls.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        api: 'graph'
    });

    var quota = new Quota({
        backoff: 'timeout'
    });

    if (options.api === 'graph') {

        quota.addRule({
            throttling: 'on-error', // The call will be blocked for 30 minutes.
            resource: 'requests'
        });

    }

    if (options.api === 'marketing') {

        quota.addRule({
            throttling: 'on-error', // The call will be blocked for a minute.
            resource: 'requests'
        });

        // For each ad set, the budget is only allowed to change 4 times per hour
        quota.addRule({
            limit: 4,
            window: 60*60*1000, // The call will be blocked for a minute.
            throttling: 'window-sliding',
            queueing: 'fifo',
            scope: 'adSetId',
            resource: 'budgetChange'
        });

    }

    return quota;

};
