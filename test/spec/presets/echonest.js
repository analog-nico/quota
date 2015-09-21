'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


describe('Preset Echonest', function () {

    it('should allow updating the limit', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('echonest');

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.resolve()
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

});
