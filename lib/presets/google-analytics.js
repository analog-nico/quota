'use strict';

var Quota = require('../quota.js');
var Rule = require('../rule.js');

var generalRuleQPD = null,
    generalRuleQPS = null;

/**
 * Quota Preset for Google Analytics' Reporting and Configuration APIs
 *
 * Quota rules based on: https://developers.google.com/analytics/devguides/reporting/core/v3/limits-quotas
 * Reporting APIs docs: https://developers.google.com/analytics/devguides/reporting/
 * Configuration APIs docs: https://developers.google.com/analytics/devguides/config/
 *
 * @param options
 * @returns {Quota}
 */
module.exports = function (options) {

    // TODO: Note: Daily quotas refresh at midnight PST.

    _.defaults(options, {
        sharedIPAdress: false,
        dailyRequests: 50000,
        dailyWrites: 500
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        //throttling: 'cutoff',
        //backoff: 'timeout'
    });

    // General Quota Limits (All APIs)

    // 50,000 requests per project per day – can be increased
    // TODO: Counter must not start from zero e.g. if server gets started mid day.
    if (generalRuleQPD === null) {
        generalRuleQPD = new Rule({
            slots: dailyRequests,
            every: 24*60*60*1000,
            queueing: 'none',
            groupManager: 'database',
            scopeAttr: [] // TODO: Manage across cluster
        });
    }
    quota.addRule(generalRuleQPD);

    // 10 queries per second (QPS) per IP
    if (generalRuleQPS === null) {

        if (options.sharedIPAdress) {

            generalRuleQPS = new Rule({
                slots: 10,
                every: 1000,
                queueing: 'memory',
                groupManager: 'database',
                scopeAttr: ['ipAddress']
            });

        } else {

            generalRuleQPS = new Rule({
                slots: 10,
                every: 1000,
                queueing: 'memory',
                groupManager: 'none',
                scopeAttr: []
            });

        }

    }
    quota.addRule(generalRuleQPS);

    //quota.addRule({
    //    slots: dailyRequests,
    //    every: 24*60*60*1000,
    //    //queueing: 'none',
    //    scopeAttr: [] // TODO: For write calls
    //});

    return quota;

};
