'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');


describe('Throttling LimitConcurrency', function () {

    it('should validate options.limit', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            throttling: 'limit-concurrency'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return quotaClient.requestQuota('test')
            .then(function () {
                throw new Error('Expected an Error');
            })
            .catch(quota.OutOfQuotaError, function (err) {
                throw new Error('Did not expect an OutOfQuotaError');
            })
            .catch(function (err) {
                expect(err.message).to.eql('Please pass the limit parameter to allow limit-concurrency throttling');
            });

    });

    it('1 request', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-concurrency'
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

        return Promise.resolve()
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

    it('should allow increasing the limit', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            name: 'main',
            limit: 1,
            throttling: 'limit-concurrency',
            queueing: 'fifo'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        var _grant;

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        _grant = grant;
                    });

            })
            .then(function () {

                setTimeout(function () {
                    _grant.dismiss({
                        forRule: {
                            main: {
                                limit: 2
                            }
                        }
                    });
                }, 5);

                return quotaClient.requestQuota('test');

            })
            .then(function () {

                return quotaClient.requestQuota('test');

            })
            .then(function () {

                return quotaClient.requestQuota('test', undefined, undefined, { maxWait: 0 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

    it('should allow decreasing the limit', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            name: 'main',
            limit: 2,
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
                        grant.dismiss({
                            forRule: {
                                main: {
                                    limit: 1
                                }
                            }
                        });
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('test', undefined, 2, { maxWait: 0 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

});
