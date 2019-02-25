'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');


describe('Preset Pinterest', function () {

    it('should grant 1000 requests per endpoint', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('pinterest');

        var quotaClient = new quota.Client(quotaServer);

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('pinterest', { userId: 1 }, { 'v1/me': 1000 });

            })
            .then(function () {

                return quotaClient.requestQuota('pinterest', { userId: 1 }, { 'v1/me': 1 }, { maxWait: 0 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('pinterest', { userId: 1 }, { 'v1/me/boards': 1000 });

            })
            .then(function () {

                return quotaClient.requestQuota('pinterest', { userId: 1 }, { 'v1/me/boards': 1 }, { maxWait: 0 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

    it('should allow updating the limit', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('pinterest');

        var quotaClient = new quota.Client(quotaServer);

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('pinterest', { userId: 1 }, { 'v1/me': 1 })
                    .then(function (grant) {
                        grant.dismiss({
                            forRule: {
                                'v1/me': {
                                    limit: 2
                                }
                            }
                        });
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('pinterest', { userId: 1 }, { 'v1/me': 1 });

            })
            .then(function () {

                return quotaClient.requestQuota('pinterest', { userId: 1 }, { 'v1/me': 1 }, { maxWait: 0 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

});
