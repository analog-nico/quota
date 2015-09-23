'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


describe('Preset Google Analytics', function () {

    it('should allow 1 query per second', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('google-analytics', {
            api: 'core-reporting'
        });

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.all([
            quotaClient.requestQuota('google-analytics', { viewId: 123 }, undefined, { maxWait: 0 }),
            quotaClient.requestQuota('google-analytics', { viewId: 123 }, undefined, { maxWait: 0 })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                })
        ]);

    });

});
