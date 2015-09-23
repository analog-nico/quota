'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


describe('Loading presets', function () {

    it('should allow setting a custom manager name', function () {

        var quotaServer = new quota.Server();
        quotaServer.addManager('bitly1', {
            preset: 'bitly'
        });
        quotaServer.addManager('bitly2', {
            preset: 'bitly'
        });

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.all([
            quotaClient.requestQuota('bitly1', {}, { requests:5 }, { maxWait: 0 }),
            quotaClient.requestQuota('bitly1', {}, { requests:5 }, { maxWait: 0 })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                }),
            quotaClient.requestQuota('bitly2', {}, { requests:5 }, { maxWait: 0 }),
            quotaClient.requestQuota('bitly2', {}, { requests:5 }, { maxWait: 0 })
                .then(function () {
                    throw new Error('Expected OutOfQuotaError');
                })
                .catch(quota.OutOfQuotaError, function (err) {
                    return; // Expected
                })
        ]);

    });

});
