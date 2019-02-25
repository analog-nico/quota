'use strict';

const _ = require('lodash');

const quota = require('../../../lib');

describe('Throttling WindowSliding', function () {

    it('should validate options.limit', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            window: 1000,
            throttling: 'window-sliding'
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
                expect(err.message).to.eql('Please pass the limit parameter to allow window-sliding throttling');
            });

    });

    it('should validate options.window', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'window-sliding'
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
                expect(err.message).to.eql('Please pass the window parameter to allow window-sliding throttling');
            });

    });

    it('1 request', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            window: 10,
            throttling: 'window-sliding'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test');

            })
            .delay(5)
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            })
            .delay(5)
            .then(function () {

                return quotaClient.requestQuota('test');

            });

    });

    it('2 requests', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 2,
            window: 10,
            throttling: 'window-sliding'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test');

            })
            .delay(5)
            .then(function () {

                return quotaClient.requestQuota('test', undefined, 2)
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('test');

            })
            .delay(5)
            .then(function () {

                return quotaClient.requestQuota('test', undefined, 2)
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            })
            .delay(6)
            .then(function () {

                return quotaClient.requestQuota('test', undefined, 2);

            });

    });

});
