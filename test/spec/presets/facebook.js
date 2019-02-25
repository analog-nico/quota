'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');


describe('Preset Facebook', function () {

    it('should grant unlimited quota for the Graph API', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('facebook');

        var quotaClient = new quota.Client(quotaServer);

        return Promise.all([
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook'),
            quotaClient.requestQuota('facebook')
        ]);

    });

    it('should grant unlimited quota for requests to the marketing API', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('facebook', { api: 'marketing' });

        var quotaClient = new quota.Client(quotaServer);

        return Promise.all([
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 }),
            quotaClient.requestQuota('facebook', {}, { requests: 999 })
        ]);

    });

    it('should grant 4 budgetChange requests to the Marketing API', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('facebook', { api: 'marketing' });

        var quotaClient = new quota.Client(quotaServer);

        return Promise.all([
            quotaClient.requestQuota('facebook', { adSetId: 1 }, { budgetChange: 1 }),
            quotaClient.requestQuota('facebook', { adSetId: 1 }, { budgetChange: 1 }),
            quotaClient.requestQuota('facebook', { adSetId: 1 }, { budgetChange: 1 }),
            quotaClient.requestQuota('facebook', { adSetId: 1 }, { budgetChange: 1 }),
            quotaClient.requestQuota('facebook', { adSetId: 1 }, { budgetChange: 1 }, { maxWait: 0 })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                })
        ]);

    });

});
