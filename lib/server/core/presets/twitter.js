'use strict';

var Manager = require('../manager.js');
var _ = require('lodash');

/**
 * Quota Preset for Twitter's Public API
 *
 * Quota rules based on: https://dev.twitter.com/rest/public/rate-limiting
 * Twitter's Public API docs: https://dev.twitter.com/rest/public
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
        authenticated: true
    });

    var manager = new Manager({
        backoff: 'timeout' // TODO: Timeout to value in X-Rate-Limit-Reset
    });

    function addRule(resource, authQuota, noAuthQuota) {

        manager.addRule({
            limit: options.authenticated ? authQuota : noAuthQuota,
            window: 15*60*1000,
            throttling: 'window-fixed', // TODO: Consider feeding back of X-Rate-Limit-Reset
            queueing: 'fifo',
            scope: 'userId',
            resource: resource
        });

    }

    // According to https://dev.twitter.com/rest/public/rate-limits
    addRule('application/rate_limit_status', 180, 180);
    addRule('favorites/list', 15, 15);
    addRule('followers/ids', 15, 15);
    addRule('followers/list', 15, 30);
    addRule('friends/ids', 15, 15);
    addRule('friends/list', 15, 30);
    addRule('friendships/show', 180, 15);
    addRule('help/configuration', 15, 15);
    addRule('help/languages', 15, 15);
    addRule('help/privacy', 15, 15);
    addRule('help/tos', 15, 15);
    addRule('lists/list', 15, 15);
    addRule('lists/members', 180, 15);
    addRule('lists/members/show', 15, 15);
    addRule('lists/memberships', 15, 15);
    addRule('lists/ownerships', 15, 15);
    addRule('lists/show', 15, 15);
    addRule('lists/statuses', 180, 180);
    addRule('lists/subscribers', 180, 15);
    addRule('lists/subscribers/show', 15, 15);
    addRule('lists/subscriptions', 15, 15);
    addRule('search/tweets', 180, 450);
    addRule('statuses/lookup', 180, 60);
    addRule('statuses/oembed', 180, 180);
    addRule('statuses/retweeters/ids', 15, 60);
    addRule('statuses/retweets/:id', 15, 60);
    addRule('statuses/show/:id', 180, 180);
    addRule('statuses/user_timeline', 180, 300);
    addRule('trends/available', 15, 15);
    addRule('trends/closest', 15, 15);
    addRule('trends/place', 15, 15);
    addRule('users/lookup', 180, 60);
    addRule('users/show', 180, 180);
    addRule('users/suggestions', 15, 15);
    addRule('users/suggestions/:slug', 15, 15);
    addRule('users/suggestions/:slug/members', 15, 15);

    return manager;

};
