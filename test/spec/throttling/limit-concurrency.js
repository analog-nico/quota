'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


describe('Throttling LimitConcurrency', function () {

    it('1 request', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-concurrency'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        return grant;
                    });

            })
            .then(function (firstGrant) {

                return quotaClient.requestQuota('test')
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    })
                    .then(function () {
                        return firstGrant;
                    });

            })
            .then(function (firstGrant) {

                firstGrant.dismiss();

            })
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        grant.dismiss();
                    });

            });

    });

    it('2 requests', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 2,
            throttling: 'limit-concurrency'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test', undefined, 2)
                    .then(function (grant) {
                        return grant;
                    });

            })
            .then(function (firstGrant) {

                return quotaClient.requestQuota('test')
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    })
                    .then(function () {
                        return firstGrant;
                    });

            })
            .then(function (firstGrant) {

                firstGrant.dismiss();

            })
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        return grant;
                    });

            })
            .then(function (secondGrant) {

                return quotaClient.requestQuota('test', undefined, 2)
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    })
                    .then(function () {
                        return secondGrant;
                    });

            })
            .then(function (secondGrant) {

                return quotaClient.requestQuota('test')
                    .then(function (thirdGrant) {
                        secondGrant.dismiss();
                        thirdGrant.dismiss();
                    });

            });

    });

});
