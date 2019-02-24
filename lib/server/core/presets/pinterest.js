'use strict';

const Manager = require('../Manager');
var _ = require('lodash');

/**
 * Quota Preset for Pinterest's API
 *
 * Quota rules based on: https://developers.pinterest.com/docs/api/overview/
 * Pinterest's API docs: https://developers.pinterest.com/docs/getting-started/introduction/
 *
 * In a cluster environment a local Server can be used if all requests made on
 * behalf of a particular user are only made by a single node.js instance.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    var manager = new Manager({
        backoff: 'timeout'
    });

    function addRule(resource) {

        manager.addRule({
            name: resource,
            limit: 1000,
            window: 60*60*1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            scope: 'userId',
            resource: resource
        });

    }

    // Each unique client ID and user ID pair is limited to approximately 1000 calls per endpoint per hour.
    addRule('v1/boards');
    addRule('v1/boards/<board_id>');
    addRule('v1/boards/<board_id>/pins');
    addRule('v1/me');
    addRule('v1/me/boards');
    addRule('v1/me/followers');
    addRule('v1/me/following/boards');
    addRule('v1/me/following/boards/<board_id>');
    addRule('v1/me/following/interests');
    addRule('v1/me/following/interests/<interest_id>');
    addRule('v1/me/following/users');
    addRule('v1/me/following/users/<user_id>');
    addRule('v1/me/likes');
    addRule('v1/me/pins');
    addRule('v1/me/search/boards');
    addRule('v1/me/search/pins');
    addRule('v1/pins');
    addRule('v1/pins/<pin_id>');
    addRule('v1/users/<username_or_id>');

    return manager;

};
