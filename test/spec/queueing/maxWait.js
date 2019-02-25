'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');


describe('Queueing with maxWait', function () {

    it('timing out', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-concurrency',
            queueing: 'fifo'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        return grant;
                    });

            })
            .then(function (firstGrant) {

                setTimeout(function () {
                    firstGrant.dismiss();
                }, 10);

                return quotaClient.requestQuota('test', undefined, undefined, { maxWait: 0 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

    it('timing out (multiple)', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-concurrency',
            queueing: 'fifo'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        return grant;
                    });

            })
            .then(function (firstGrant) {

                setTimeout(function () {
                    firstGrant.dismiss();
                }, 10);

                return Promise.all([
                    quotaClient.requestQuota('test', undefined, undefined, { maxWait: 0 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        }),
                    quotaClient.requestQuota('test', undefined, undefined, { maxWait: 5 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        }),
                    quotaClient.requestQuota('test', undefined, undefined, { maxWait: 10 })
                        .then(function (grant) {
                            // Expected
                            grant.dismiss();
                        })
                ]);

            });

    });

    it('timing out at the right time', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-concurrency',
            queueing: 'fifo'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        var counter = 0;

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        return grant;
                    });

            })
            .then(function (firstGrant) {

                setTimeout(function () {
                    counter += 1;
                }, 5);

                setTimeout(function () {
                    counter += 1;
                    firstGrant.dismiss();
                }, 10);

                return Promise.all([
                    quotaClient.requestQuota('test', undefined, undefined, { maxWait: 0 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            counter += 1;
                            expect(counter).to.eql(1);
                        }),
                    quotaClient.requestQuota('test', undefined, undefined, { maxWait: 5 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            counter += 1;
                            expect(counter).to.eql(3);
                        }),
                    quotaClient.requestQuota('test', undefined, undefined, { maxWait: 10 })
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(5);
                            grant.dismiss();
                        })
                ]);

            });

    });

});
