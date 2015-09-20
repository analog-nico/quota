'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


describe('Throttling Unlimited', function () {

    it('2 requests', function () {

        var quotaManager = new quota.Manager();
        quotaManager.addRule({
            throttling: 'unlimited'
        });

        var quotaServer = new quota.Server();
        quotaServer.addManager('test', quotaManager);

        var quotaClient = new quota.Client(quotaServer);

        return BPromise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test');

            })
            .then(function () {

                return quotaClient.requestQuota('test');

            });

    });

});
