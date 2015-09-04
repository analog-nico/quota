'use strict';

var Quota = require('../quota.js');
var _ = require('lodash');

/**
 *  Quota Preset for GitHub (https://github.com)
 *
 *  Based on: https://developer.github.com/v3/#rate-limiting
 *  Custom rate limits of the Search API not yet supported.
 *
 * @param options
 */
module.exports = function (options) {

    _.defaults(options, {
        authenticated: true,
        forSearchAPI: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        throttling: 'cutoff',
        backoff: 'timeout'
    });

    if (options.forSearchAPI) {

        quota.addRule({
            slots: options.authenticated ? 30 : 10,
            every: 60*1000,
            //queueing: 'none',
            scopeAttr: [] // TODO: username for authenticated
        });

    } else {

        quota.addRule({
            slots: options.authenticated ? 5000 : 60,
            every: 60*60*1000,
            //queueing: 'none',
            scopeAttr: [] // TODO: username for authenticated
        });

    }

    return quota;

};
