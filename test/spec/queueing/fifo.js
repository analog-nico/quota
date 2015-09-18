'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');
var BPromise = require('bluebird');


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

        return BPromise.resolve()
            .then(function () {

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        return grant;
                    });

            })
            .then(function (firstGrant) {

                setTimeout(function () {
                    firstGrant.dismiss();
                });

                return quotaClient.requestQuota('test')
                    .then(function (grant) {
                        grant.dismiss();
                    });

            });

    });

});
