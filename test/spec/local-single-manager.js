'use strict';

var quota = require('../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


describe('Local single manager', function () {

    it('with 1 rule', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-absolute'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test');

            })
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

    it('with 2 rules', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 2,
            throttling: 'limit-absolute'
        });
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-absolute'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test');

            })
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

    it('with scope', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-absolute',
            scope: 'id'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.resolve()
            .then(function () {
                return quotaClient.requestQuota('test', { id: 1 });
            })
            .then(function () {
                return quotaClient.requestQuota('test', { id: 2 });
            })
            .then(function () {

                return quotaClient.requestQuota('test', { id: 1 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('test', { id: 2 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

});
