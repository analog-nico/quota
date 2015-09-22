'use strict';

var quota = require('../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


describe('Local Server', function () {

    describe('with a single manager', function () {

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

        it('with 1 rule and scope', function () {

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
                    return quotaClient.requestQuota('test', { id: 1, notRelevant: true });
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

        it('with 1 rule and scope parameter variants', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 2,
                throttling: 'limit-absolute',
                scope: 'id'
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('test', quotaManager);

            var quotaClient = new quota.Client(quotaServer);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('test', undefined);
                })
                .then(function () {
                    return quotaClient.requestQuota('test', { });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: undefined })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                });

        });

        it('with 1 rule and complex scope', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 1,
                throttling: 'limit-absolute',
                scope: ['id', 'id2']
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('test', quotaManager);

            var quotaClient = new quota.Client(quotaServer);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 1, id2: 1 });
                })
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 1, id2: 2 });
                })
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 2, id2: 1 });
                })
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 1 });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 1, id2: 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 1, id2: 2 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 2, id2: 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                });

        });

        it('with 3 rules and complex scope (1)', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 3,
                throttling: 'limit-absolute'
            });
            quotaManager.addRule({
                limit: 3,
                throttling: 'limit-absolute',
                scope: 'id'
            });
            quotaManager.addRule({
                limit: 1, // <-- This one will be out of quota
                throttling: 'limit-absolute',
                scope: ['id', 'id2']
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('test', quotaManager);

            var quotaClient = new quota.Client(quotaServer);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 1, id2: 1 });
                })
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 1, id2: 2 });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 1, id2: 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 1, id2: 2 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                });

        });

        it('with 3 rules and complex scope (2)', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 3,
                throttling: 'limit-absolute'
            });
            quotaManager.addRule({
                limit: 2, // <-- This one will be out of quota
                throttling: 'limit-absolute',
                scope: 'id'
            });
            quotaManager.addRule({
                limit: 2,
                throttling: 'limit-absolute',
                scope: ['id', 'id2']
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('test', quotaManager);

            var quotaClient = new quota.Client(quotaServer);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 1, id2: 1 });
                })
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 1, id2: 2 });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 1, id2: 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 1, id2: 2 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                });

        });

        it('with 3 rules and complex scope (3)', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 2, // <-- This one will be out of quota
                throttling: 'limit-absolute'
            });
            quotaManager.addRule({
                limit: 3,
                throttling: 'limit-absolute',
                scope: 'id'
            });
            quotaManager.addRule({
                limit: 2,
                throttling: 'limit-absolute',
                scope: ['id', 'id2']
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('test', quotaManager);

            var quotaClient = new quota.Client(quotaServer);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 1, id2: 1 });
                })
                .then(function () {
                    return quotaClient.requestQuota('test', { id: 1, id2: 2 });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 1, id2: 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                })
                .then(function () {

                    return quotaClient.requestQuota('test', { id: 1, id2: 2 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                });

        });

        it('with 2 rules and 2 resources', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 1,
                throttling: 'limit-absolute',
                resource: 'resA'
            });
            quotaManager.addRule({
                limit: 3,
                throttling: 'limit-absolute',
                resource: 'resB'
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('test', quotaManager);

            var quotaClient = new quota.Client(quotaServer);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('test', undefined, { 'resA': 1 });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', undefined, { 'resA': 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                })
                .then(function () {
                    return quotaClient.requestQuota('test', undefined, { 'resB': 3 });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', undefined, { 'resB': 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                });

        });

        it('with 2 rules and 2 resources using joint requests', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 2,
                throttling: 'limit-absolute',
                resource: 'resA'
            });
            quotaManager.addRule({
                limit: 5,
                throttling: 'limit-absolute',
                resource: 'resB'
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('test', quotaManager);

            var quotaClient = new quota.Client(quotaServer);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('test', undefined, 1);
                })
                .then(function () {
                    return quotaClient.requestQuota('test', undefined, { 'resA': 1, 'resB': 3 });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', undefined, { 'resA': 1, 'resB': 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                })
                .then(function () {
                    return quotaClient.requestQuota('test', undefined, { 'resB': 1 });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', undefined, { 'resB': 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                });

        });

        it('should limit all resources with a rule that defines none', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 2,
                throttling: 'limit-absolute',
                resource: 'resA'
            });
            quotaManager.addRule({
                limit: 2,
                throttling: 'limit-absolute',
                resource: 'resB'
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
                    return quotaClient.requestQuota('test', undefined, { 'resA': 1 });
                })
                .then(function () {

                    return quotaClient.requestQuota('test', undefined, { 'resA': 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                })
                .then(function () {

                    return quotaClient.requestQuota('test', undefined, { 'resB': 1 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });

                });

        });

        it('should not grant request for unknown resource', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 1,
                throttling: 'limit-absolute',
                resource: 'known'
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('test', quotaManager);

            var quotaClient = new quota.Client(quotaServer);

            return quotaClient.requestQuota('test', undefined, { unknownResource: 1 })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                });

        });

        it('should not grant request for empty resource object', function () {

            var quotaManager = new quota.Manager();
            quotaManager.addRule({
                limit: 1,
                throttling: 'limit-absolute',
                resource: 'known'
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('test', quotaManager);

            var quotaClient = new quota.Client(quotaServer);

            return quotaClient.requestQuota('test', undefined, { })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                });

        });

    });

    describe('with two managers', function () {

        it('should find the right manager', function () {

            var quotaManager1 = new quota.Manager();
            quotaManager1.addRule({
                limit: 1,
                throttling: 'limit-absolute'
            });

            var quotaManager2 = new quota.Manager();
            quotaManager2.addRule({
                limit: 1,
                throttling: 'limit-absolute'
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('man1', quotaManager1);
            quotaServer.addManager('man2', quotaManager2);

            var quotaClient = new quota.Client(quotaServer);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('man1');
                })
                .then(function () {
                    return quotaClient.requestQuota('man1')
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });
                })
                .then(function () {
                    return quotaClient.requestQuota('man2');
                })
                .then(function () {
                    return quotaClient.requestQuota('man2')
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });
                });


        });

        it('should find the right manager even after the first one got used', function () {

            var quotaManager1 = new quota.Manager();
            quotaManager1.addRule({
                limit: 1,
                throttling: 'limit-absolute'
            });

            var quotaServer = new quota.Server();
            quotaServer.addManager('man1', quotaManager1);

            var quotaClient = new quota.Client(quotaServer);

            return BPromise.resolve()
                .then(function () {
                    return quotaClient.requestQuota('man1');
                })
                .then(function () {
                    return quotaClient.requestQuota('man1')
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        });
                })
                .then(function () {

                    var quotaManager2 = new quota.Manager();
                    quotaManager2.addRule({
                        limit: 1,
                        throttling: 'limit-absolute'
                    });

                    quotaServer.addManager('man2', quotaManager2);

                })
                .then(function () {
                    return quotaClient.requestQuota('man2');
                })
                .then(function () {
                    return quotaClient.requestQuota('man2')
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
