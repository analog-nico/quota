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
 * @returns {Quota}
 */
module.exports = function (options) {

    // TODO: Note: Daily quotas refresh at midnight PST.

    _.defaults(options, {
        sharedIPAdress: false,
        dailyRequests: 50000,
        dailyWrites: 500,
        queriesPerSecond: 1,
        api: '',
        stickySessions: false
    });

    var quota = new Quota({
        //cancelAfter: 1000,
        //throttling: 'cutoff',
        //backoff: 'timeout'
    });

    // General Quota Limits (All APIs)

    // 50,000 requests per project per day – can be increased
    if (generalRuleQPD === null) {
        generalRuleQPD = new Rule({
            quota: options.dailyRequests,
            every: 24*60*60*1000,
            queueing: 'none',
            systemOfRecord: 'database',
            scope: [],
            resources: ['requests']
        });
    }
    quota.addRule(generalRuleQPD);

    // 10 queries per second (QPS) per IP
    // By default, it is set to 1 query per second (QPS) and can be adjusted to a maximum value of 10.
    // Adjustment can be done here: https://console.developers.google.com/project?authuser=2
    if (generalRuleQPS === null) {

        if (options.sharedIPAdress) {

            generalRuleQPS = new Rule({
                quota: options.queriesPerSecond,
                every: 1000,
                queueing: 'memory',
                systemOfRecord: 'database',
                scope: ['userId', 'ipAddress'],
                resources: ['requests']
            });

        } else {

            generalRuleQPS = new Rule({
                quota: options.queriesPerSecond,
                every: 1000,
                queueing: 'memory',
                systemOfRecord: options.stickySessions ? 'self' : 'database',
                scope: ['userId'],
                resources: ['requests']
            });

        }

    }
    quota.addRule(generalRuleQPS);

    if (options.api === 'management') {

        // Management API - Write Requests
        // 500 write requests per project per day – can be increased
        quota.addRule({
            quota: options.dailyWrites,
            every: 24*60*60*1000,
            queueing: 'none',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: [],
            resources: ['writeRequests']
        });

        // Management API - Data Import

        // 10 GB per property
        quota.addRule({
            quota: 10*1024*1024*1024,
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'propertyId'],
            resources: ['bytes']
        });

        // 10 GB per data set
        quota.addRule({
            quota: 10*1024*1024*1024,
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'datasetId'],
            resources: ['bytes']
        });

        // 50 Data Sets per property
        quota.addRule({
            quota: 50,
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'propertyId'],
            resources: ['datasets']
        });

        // 50 upload operations per property per day
        quota.addRule({
            quota: 50,
            every: 24*60*60*1000,
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'propertyId'],
            resources: ['writeRequests']
        });

        // 100 MB per date (ga:date) per data set
        quota.addRule({
            quota: 100*1024*1024,
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['userId', 'datasetId', 'date'],
            resources: ['bytes']
        });

        // Management API - Unsampled Reports
        // 100 unsampled reports per day per property
        quota.addRule({
            quota: 100,
            every: 24*60*60*1000,
            queueing: 'none',
            systemOfRecord: options.stickySessions ? 'self' : 'database',
            scope: ['userId', 'propertyId'],
            resources: ['unsampledReports']
        });

    }

    if (options.api === 'provisioning') {

        // Provisioning API - Write Requests
        // 50 requests per project per day
        quota.addRule({
            quota: 50,
            every: 24*60*60*1000,
            queueing: 'none',
            systemOfRecord: 'database',
            scope: [],
            resources: ['writeRequests']
        });

    }

    if (options.api === 'core-reporting' || options.api === 'real-time-reporting') {

        // Core Reporting API and Real Time Reporting API

        // 10,000 requests per view (profile) per day
        quota.addRule({
            quota: 10000,
            every: 24*60*60*1000,
            queueing: 'none',
            systemOfRecord: 'database',
            scope: ['viewId'],
            resources: ['requests']
        });

        // 10 concurrent requests per view (profile)
        quota.addRule({
            quota: 10,
            concurrent: true,
            queueing: 'memory',
            systemOfRecord: 'database',
            scope: ['viewId'],
            resources: ['requests']
        });

    }

    if (options.api === 'mcf-reporting') {

        // Multi-channel Funnel Reporting API

        // 10 concurrent requests per view (profile)
        quota.addRule({
            quota: 10,
            concurrent: true,
            queueing: 'memory',
            systemOfRecord: 'database',
            scope: ['viewId'],
            resources: ['requests']
        });

    }

    return quota;

};