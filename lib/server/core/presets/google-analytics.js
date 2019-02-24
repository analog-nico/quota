'use strict';

var _ = require('lodash');
var moment = require('moment');

var Manager = require('../manager.js');
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
 * In a cluster environment a local Server may be used if the daily project
 * limits of 50,000 read requests in general and 500 write requests for the
 * Management API is unlikely reached, if each node.js instance is reached via
 * a different IP address from the internet, and if all requests made on behalf
 * a particular user are only made by a single node.js instance.
 * The Provisioning API, however, requires a centralized Server.
 *
 * @param options
 * @returns {Manager}
 */
module.exports = function (options) {

    // Note: Daily quotas refresh at midnight PST.
    function getStartOfNextWindow() {
        return moment.utc().startOf('day').add(1, 'day').add(8, 'hours').valueOf();
    }

    _.defaults(options, {
        api: '',
        dailyRequests: 50000,
        dailyWrites: 500,
        queriesPerSecond: 1,
        qpsPerUser: false,
        sharedIPAddress: false
    });

    if (options.api === '') {
        throw new Error('Please pass the options.api parameter when loading the Facebook preset');
    }

    var manager = new Manager({
        backoff: 'timeout'
    });

    // General Quota Limits (All APIs)

    // 50,000 requests per project per day – can be increased
    if (generalRuleQPD === null) {
        generalRuleQPD = new Rule({
            limit: options.dailyRequests,
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: getStartOfNextWindow
            },
            resource: 'requests'
        });
    }
    manager.addRule(generalRuleQPD);

    // 10 queries per second (QPS) per IP
    // By default, it is set to 1 query per second (QPS) and can be adjusted to a maximum value of 10.
    // Adjustment can be done here: https://console.developers.google.com/project?authuser=2
    if (generalRuleQPS === null) {

        var ruleOptions = {
            limit: options.queriesPerSecond,
            window: 1000,
            throttling: 'window-sliding',
            queueing: 'fifo',
            resource: 'requests'
        };

        if (options.qpsPerUser) {
            ruleOptions.scope = 'userId';
        } else if (options.sharedIPAddress) {
            ruleOptions.scope = 'ipAddress';
        }

        generalRuleQPS = new Rule(ruleOptions);

    }
    manager.addRule(generalRuleQPS);

    if (options.api === 'management') {

        // Management API - Write Requests
        // 500 write requests per project per day – can be increased
        manager.addRule({
            limit: options.dailyWrites,
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: getStartOfNextWindow
            },
            resource: 'writeRequests'
        });

        // Management API - Data Import

        // 10 GB per property
        manager.addRule({
            limit: 10 * 1024 * 1024 * 1024,
            throttling: 'limit-absolute',
            scope: ['userId', 'propertyId'],
            resource: 'bytes'
        });

        // 10 GB per data set
        manager.addRule({
            limit: 10 * 1024 * 1024 * 1024,
            throttling: 'limit-absolute',
            scope: ['userId', 'datasetId'],
            resource: 'bytes'
        });

        // 50 Data Sets per property
        manager.addRule({
            limit: 50,
            throttling: 'limit-absolute',
            scope: ['userId', 'propertyId'],
            resource: 'datasets'
        });

        // 50 upload operations per property per day
        manager.addRule({
            limit: 50,
            getStartOfNextWindow: getStartOfNextWindow,
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: getStartOfNextWindow
            },
            scope: ['userId', 'propertyId'],
            resource: 'writeRequests'
        });

        // 100 MB per date (ga:date) per data set
        manager.addRule({
            limit: 100 * 1024 * 1024,
            throttling: 'limit-absolute',
            scope: ['userId', 'datasetId', 'date'],
            resource: 'bytes'
        });

        // Management API - Unsampled Reports
        // 100 unsampled reports per day per property
        manager.addRule({
            limit: 100,
            getStartOfNextWindow: getStartOfNextWindow,
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: getStartOfNextWindow
            },
            scope: ['userId', 'propertyId'],
            resource: 'unsampledReports'
        });

    }

    if (options.api === 'provisioning') {

        // Provisioning API - Write Requests
        // 50 requests per project per day
        manager.addRule({
            limit: 50,
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: getStartOfNextWindow
            },
            resource: 'writeRequests'
        });

    }

    if (options.api === 'core-reporting' || options.api === 'real-time-reporting') {

        // Core Reporting API and Real Time Reporting API

        // 10,000 requests per view (profile) per day
        manager.addRule({
            limit: 10000,
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: getStartOfNextWindow
            },
            scope: 'viewId',
            resource: 'requests'
        });

        // 10 concurrent requests per view (profile)
        manager.addRule({
            limit: 10,
            throttling: 'limit-concurrency',
            queueing: 'fifo',
            scope: 'viewId',
            resource: 'requests'
        });

    }

    if (options.api === 'mcf-reporting') {

        // Multi-channel Funnel Reporting API

        // 10 concurrent requests per view (profile)
        manager.addRule({
            limit: 10,
            throttling: 'limit-concurrency',
            queueing: 'fifo',
            scope: 'viewId',
            resource: 'requests'
        });

    }

    return manager;

};
