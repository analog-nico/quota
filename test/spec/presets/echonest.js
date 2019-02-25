'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');


describe('Preset Echonest', function () {

    it('should allow updating the limit', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('echonest');

        var quotaClient = new quota.Client(quotaServer);

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('echonest')
                    .then(function (grant) {
                        grant.dismiss({
                            forRule: {
                                main: {
                                    limit: 2
                                }
                            }
                        });
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('echonest')
                    .then(function (grant) {
                        grant.dismiss();
                    });

            })
            .then(function () {

                return quotaClient.requestQuota('echonest', undefined, undefined, { maxWait: 0 })
                    .then(function () {
                        throw new Error('Expected OutOfQuotaError');
                    })
                    .catch(quota.OutOfQuotaError, function (err) {
                        return; // Expected
                    });

            });

    });

    it('should grant more requests if limit is increased', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('echonest');

        var quotaClient = new quota.Client(quotaServer);

        return Promise.resolve()
            .then(function () {

                return quotaClient.requestQuota('echonest')
                    .then(function (grant) {
                        grant.dismiss({
                            forRule: {
                                main: {
                                    limit: 2
                                }
                            }
                        });
                    });

            })
            .then(function () {

                return Promise.all([
                    quotaClient.requestQuota('echonest')
                        .then(function (grant) {
                            grant.dismiss({
                                forRule: {
                                    main: {
                                        limit: 3
                                    }
                                }
                            });
                        }),
                    quotaClient.requestQuota('echonest')
                        .then(function (grant) {
                            grant.dismiss();
                        })
                ]);

            });

    });

});
