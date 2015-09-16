'use strict';

var quota = require('../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


describe('Multiple Servers', function () {

    describe('edge cases', function () {

        it('no servers', function () {

            expect(function () {
                return new quota.Client();
            }).to.throw();

        });

        it('requesting quota for unknown manager', function () {

            var quotaManager1 = new quota.Manager();
            quotaManager1.addRule({
                limit: 1,
                throttling: 'limit-absolute'
            });

            var quotaServer1 = new quota.Server();
            quotaServer1.addManager('server1', quotaManager1);

            var quotaManager2 = new quota.Manager();
            quotaManager2.addRule({
                limit: 1,
                throttling: 'limit-absolute'
            });

            var quotaManager3 = new quota.Manager();
            quotaManager3.addRule({
                limit: 1,
                throttling: 'limit-absolute'
            });

            var quotaServer2 = new quota.Server();
            quotaServer2.addManager('server2', quotaManager2);
            quotaServer2.addManager('server3', quotaManager3);

            var quotaClient = new quota.Client([quotaServer1, quotaServer2]);

            return quotaClient.requestQuota('unknown')
                .then(function () {
                    throw new Error('Expected NoManagerError');
                })
                .catch(quota.NoManagerError, function (err) {
                    return; // Expected
                });

        });

    });

    describe('two local servers', function () {

        it('independent', function () {

            var quotaManager1 = new quota.Manager();
            quotaManager1.addRule({
                limit: 1,
                throttling: 'limit-absolute'
            });

            var quotaServer1 = new quota.Server();
            quotaServer1.addManager('server1', quotaManager1);

            var quotaManager2 = new quota.Manager();
            quotaManager2.addRule({
                limit: 1,
                throttling: 'limit-absolute'
            });

            var quotaServer2 = new quota.Server();
            quotaServer2.addManager('server2', quotaManager2);

            var quotaClient = new quota.Client([quotaServer1, quotaServer2]);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('server1');
                })
                .then(function () {
                    return quotaClient.requestQuota('server1')
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });
                })
                .then(function () {
                    return quotaClient.requestQuota('server2');
                })
                .then(function () {
                    return quotaClient.requestQuota('server2')
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });
                });

        });

    });

});
