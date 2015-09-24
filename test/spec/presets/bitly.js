'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


describe('Preset Bitly', function () {

    it('should allow 5 concurrent requests', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('bitly');

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.all([
            quotaClient.requestQuota('bitly', undefined, undefined, { maxWait: 0 }),
            quotaClient.requestQuota('bitly', undefined, undefined, { maxWait: 0 }),
            quotaClient.requestQuota('bitly', undefined, undefined, { maxWait: 0 }),
            quotaClient.requestQuota('bitly', undefined, undefined, { maxWait: 0 }),
            quotaClient.requestQuota('bitly', undefined, undefined, { maxWait: 0 }),
            quotaClient.requestQuota('bitly', undefined, undefined, { maxWait: 0 })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                })
        ]);

    });

});
