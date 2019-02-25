'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');


describe('Queueing Fifo', function () {

    it('1 request', function () {

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
            throttling: 'limit-concurrency',
            queueing: 'fifo'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        var grant1, grant2, counter = 0;

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        grant1 = grant;
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        grant2 = grant;
                    });

            })
            .then(function (firstGrant) {

                setTimeout(function () {
                    grant1.dismiss();
                }, 10);

                return Promise.all([
                    quotaClient.requestQuota('test')
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(1);
                            grant.dismiss();
                        }),
                    quotaClient.requestQuota('test')
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(2);
                            grant.dismiss();
                        })
                ]);

            })
            .then(function () {
                grant2.dismiss();
            });

    });

    it('waiting again for second resource', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-concurrency',
            queueing: 'fifo',
            resource: 'res1'
        });
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-concurrency',
            queueing: 'fifo',
            resource: 'res2'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        var grant1, grant2, counter = 0;

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test', undefined, { res1: 1 })
                    .then(function (grant) {
                        grant1 = grant;
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('test', undefined, { res2: 1 })
                    .then(function (grant) {
                        grant2 = grant;
                    });

            })
            .then(function (firstGrant) {

                setTimeout(function () {
                    counter += 1;
                    grant1.dismiss();
                }, 10);

                setTimeout(function () {
                    counter += 1;
                    grant2.dismiss();
                }, 20);

                return Promise.all([
                    quotaClient.requestQuota('test', undefined, { res1: 1, res2: 1 })
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(4);
                            grant.dismiss();
                        }),
                    quotaClient.requestQuota('test', undefined, { res1: 1 })
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(2);
                            grant.dismiss();
                        })
                ]);

            });

    });

    it('no overtaking', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: 'limit-concurrency',
            queueing: 'fifo'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        var grant1, counter = 0;

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test', undefined, 0.5)
                    .then(function (grant) {
                        grant1 = grant;
                    });

            })
            .then(function () {

                setTimeout(function () {
                    counter += 1;
                    grant1.dismiss();
                }, 10);

                return Promise.all([
                    quotaClient.requestQuota('test', undefined, 1)
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(2);
                            grant.dismiss();
                        }),
                    quotaClient.requestQuota('test', undefined, 0.5)
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(3);
                            grant.dismiss();
                        })
                ]);

            });

    });

    it('no overtaking when not enough available at first', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 3,
            throttling: 'limit-concurrency',
            queueing: 'fifo'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        var counter = 0;

        return Promise.all([
            quotaClient.requestQuota('test'),
            quotaClient.requestQuota('test'),
            quotaClient.requestQuota('test')
        ])
            .spread(function (grant1, grant2, grant3) {

                setTimeout(function () {
                    counter += 1;
                    grant1.dismiss();
                });

                setTimeout(function () {
                    counter += 1;
                    grant2.dismiss();
                }, 5);

                setTimeout(function () {
                    counter += 1;
                    grant2.dismiss();
                }, 10);

                return Promise.all([
                    quotaClient.requestQuota('test', undefined, 2, { maxWait: 10 })
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(3);
                            grant.dismiss();
                        }),
                    quotaClient.requestQuota('test', undefined, 1, { maxWait: 10 })
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(4);
                            grant.dismiss();
                        })
                ]);

            });

    });

    it('granting as many as possible when more available', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 2,
            throttling: 'limit-concurrency',
            queueing: 'fifo'
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

                setTimeout(function () {
                    firstGrant.dismiss();
                });

                return Promise.all([
                    quotaClient.requestQuota('test', undefined, undefined, { maxWait: 10 }),
                    quotaClient.requestQuota('test', undefined, undefined, { maxWait: 10 }),
                    quotaClient.requestQuota('test', undefined, undefined, { maxWait: 10 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        })
                ]);

            });

    });

    it('granting second in line after first in line timed out', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 2,
            throttling: 'limit-concurrency',
            queueing: 'fifo'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        var grant1, counter = 0;

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        grant1 = grant;
                    });

            })
            .then(function () {

                setTimeout(function () {
                    counter += 1;
                    grant1.dismiss();
                }, 10);

                return Promise.all([
                    quotaClient.requestQuota('test', undefined, 2, { maxWait: 5 })
                        .then(function () {
                            throw new Error('Expected OutOfQuotaError');
                        })
                        .catch(quota.OutOfQuotaError, function (err) {
                            return; // Expected
                        }),
                    quotaClient.requestQuota('test')
                        .then(function (grant) {
                            counter += 1;
                            expect(counter).to.eql(1);
                            grant.dismiss();
                        })
                ]);

            });

    });

});
