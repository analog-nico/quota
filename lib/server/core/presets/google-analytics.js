'use strict';

var _ = require('lodash');

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
 * @returns {Manager}
 */
module.exports = function (options) {

    // TODO: Note: Daily quotas refresh at midnight PST.

    _.defaults(options, {
        sharedIPAddress: false,
        dailyRequests: 50000,
        dailyWrites: 500,
        queriesPerSecond: 1,
        api: '',
        stickySessions: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        backoff: 'timeout'
    });

    // General Quota Limits (All APIs)

    // 50,000 requests per project per day – can be increased
    if (generalRuleQPD === null) {
        generalRuleQPD = new Rule({
            limit: options.dailyRequests,
            window: 24*60*60*1000,
            throttling: 'window-fixed',
            queueing: 'none',
            systemOfRecord: 'database',
            scope: [],
            resource: 'requests'
        });
    }
    quota.addRule(generalRuleQPD);

    // 10 queries per second (QPS) per IP
    // By default, it is set to 1 query per second (QPS) and can be adjusted to a maximum value of 10.
    // Adjustment can be done here: https://console.developers.google.com/project?authuser=2
    if (generalRuleQPS === null) {

        if (options.sharedIPAddress) {

            generalRuleQPS = new Rule({
                limit: options.queriesPerSecond,
                window: 1000,
                throttling: 'window-sliding',
                queueing: 'fifo',
                systemOfRecord: 'database',
                scope: ['userId', 'ipAddress'],
                resource: 'requests'
            });

        } else {

            generalRuleQPS = new Rule({
                limit: options.queriesPerSecond,
                window: 1000,
                throttling: 'window-sliding',
                queueing: 'fifo',
                systemOfRecord: options.stickySessions ? 'self' : 'database',
                scope: ['userId'],
                resource: 'requests'
            });

        }

    }
    quota.addRule(generalRuleQPS);

    if (options.api === 'management') {

        // Management API - Write Requests
        // 500 write requests per project per day – can be increased
        quota.addRule({
            limit: options.dailyWrites,
            window: 24*60*60*1000,
            throttling: 'window-fixed',
            queueing: 'none',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: [],
            resource: 'writeRequests'
        });

        // Management API - Data Import

        // 10 GB per property
        quota.addRule({
            limit: 10*1024*1024*1024,
            throttling: 'limit-absolute',
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'propertyId'],
            resource: 'bytes'
        });

        // 10 GB per data set
        quota.addRule({
            limit: 10*1024*1024*1024,
            throttling: 'limit-absolute',
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'datasetId'],
            resource: 'bytes'
        });

        // 50 Data Sets per property
        quota.addRule({
            limit: 50,
            throttling: 'limit-absolute',
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'propertyId'],
            resource: 'datasets'
        });

        // 50 upload operations per property per day
        quota.addRule({
            limit: 50,
            window: 24*60*60*1000,
            throttling: 'window-fixed',
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'propertyId'],
            resource: 'writeRequests'
        });

        // 100 MB per date (ga:date) per data set
        quota.addRule({
            limit: 100*1024*1024,
            throttling: 'limit-absolute',
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'datasetId', 'date'],
            resource: 'bytes'
        });

        // Management API - Unsampled Reports
        // 100 unsampled reports per day per property
        quota.addRule({
            limit: 100,
            window: 24*60*60*1000,
            throttling: 'window-fixed',
            queueing: 'none',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: ['userId', 'propertyId'],
            resource: 'unsampledReports'
        });

    }

    if (options.api === 'provisioning') {

        // Provisioning API - Write Requests
        // 50 requests per project per day
        quota.addRule({
            limit: 50,
            window: 24*60*60*1000,
            throttling: 'window-fixed',
            queueing: 'none',
            systemOfRecord: 'database',
            scope: [],
            resource: 'writeRequests'
        });

    }

    if (options.api === 'core-reporting' || options.api === 'real-time-reporting') {

        // Core Reporting API and Real Time Reporting API

        // 10,000 requests per view (profile) per day
        quota.addRule({
            limit: 10000,
            window: 24*60*60*1000,
            throttling: 'window-fixed',
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['viewId'],
            resource: 'requests'
        });

        // 10 concurrent requests per view (profile)
        quota.addRule({
            limit: 10,
            throttling: 'limit-concurrency',
            queueing: 'fifo',
            systemOfRecord: 'database',
            scope: ['viewId'],
            resource: 'requests'
        });

    }

    if (options.api === 'mcf-reporting') {

        // Multi-channel Funnel Reporting API

        // 10 concurrent requests per view (profile)
        quota.addRule({
            limit: 10,
            throttling: 'limit-concurrency',
            queueing: 'fifo',
            systemOfRecord: 'database',
            scope: ['viewId'],
            resource: 'requests'
        });

    }

    return quota;

};
