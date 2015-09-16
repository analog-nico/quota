'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 * Quota Preset for The Echonest
 *
 * Quota rules based on: http://developer.echonest.com/docs/v4#rate-limits
 * The Echonest API docs: http://developer.echonest.com/docs/v4
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    var quota = new Quota({
        //cancelAfter: 1000,
        backoff: 'timeout'
    });

    quota.addRule({
        limit: 120,
        window: 60*1000,
        throttling: 'window-sliding',
        queueing: 'fifo',
        systemOfRecord: 'database',
        scope: [],
        resource: 'requests'
    });

    return quota;

};
