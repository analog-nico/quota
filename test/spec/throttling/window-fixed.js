'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');


describe('Throttling WindowFixed', function () {

    it('should validate options.limit', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            getStartOfNextWindow: _.noop(),
            throttling: 'window-fixed'
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
                expect(err.message).to.eql('Please pass the limit parameter to allow window-fixed throttling');
            });

    });

    it('should validate options.getStartOfNextWindow', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: 'wrong'
            }
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
                expect(err.message).to.eql('Please pass a function as the getStartOfNextWindow parameter to allow window-fixed throttling');
            });

    });

    it('should start a new window', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            limit: 1,
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: function () {
                    return (new Date()).getTime() + 10;
                }
            }
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        grant.dismiss();
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            })
            .delay(10)
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

    it('should allow increasing the limit', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            name: 'main',
            limit: 1,
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: function () {
                    return (new Date()).getTime() + 10000;
                }
            },
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
                                limit: 3
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
            throttling: {
                type: 'window-fixed',
                getStartOfNextWindow: function () {
                    return (new Date()).getTime() + 10000;
                }
            },
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

                return quotaClient.requestQuota('test', undefined, undefined, { maxWait: 0 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

});
