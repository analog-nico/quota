'use strict';

var Manager = require('../manager.js');
var _ = require('lodash');

/**
 * Quota Preset for The Echonest
 *
 * Quota rules based on: http://developer.echonest.com/docs/v4#rate-limits
 * The Echonest API docs: http://developer.echonest.com/docs/v4
 *
 * In a cluster environment a local Server cannot be used unless the limit is
 * reduced (to 120 / number of node.js instances) so that an overall request
 * rate that exceeds the limit is unlikely.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    _.defaults(options, {
        limit: 120
    });

    var manager = new Manager({
        backoff: 'timeout'
    });

    manager.addRule({
        name: 'main',
        limit: options.limit,
        window: 60*1000,
        throttling: 'window-sliding',
        queueing: 'fifo',
        resource: 'requests'
    });

    return manager;

};
