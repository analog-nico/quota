'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');


describe('Preset Twitter', function () {

    it('should grant quota for individual endpoints and each user', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('twitter');

        var quotaClient = new quota.Client(quotaServer);

        return Promise.all([
            quotaClient.requestQuota('twitter', { userId: 1 }, { 'account/settings': 15 }, { maxWait: 0 }),
            quotaClient.requestQuota('twitter', { userId: 1 }, { 'account/settings': 15 }, { maxWait: 0 })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                }),
            quotaClient.requestQuota('twitter', { userId: 2 }, { 'account/settings': 15 }, { maxWait: 0 }),
            quotaClient.requestQuota('twitter', { userId: 2 }, { 'account/settings': 15 }, { maxWait: 0 })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                }),
            quotaClient.requestQuota('twitter', { userId: 1 }, { 'account/verify_credentials': 15 }, { maxWait: 0 }),
            quotaClient.requestQuota('twitter', { userId: 1 }, { 'account/verify_credentials': 15 }, { maxWait: 0 })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                })
        ]);

    });

});
