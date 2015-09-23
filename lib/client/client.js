'use strict';

var BPromise = require('bluebird');
var _ = require('lodash');

var Server = require('../server/server.js');
var errors = require('../common/errors.js');


function Client(servers) {

    if (_.isUndefined(servers)) {
        throw new Error('Please pass at least one server to connect to.');
    }

    this.servers = [];

    if (!_.isArray(servers)) {
        servers = [servers];
    }

    for ( var i = 0; i < servers.length; i+=1 ) {

        if (servers[i] instanceof Server) {

            this.servers.push({
                type: 'local',
                api: servers[i],
                managers: null
            });

        } else {
            throw new TypeError('Type of server ' + servers[i] + ' not yet supported.');
        }

    }

}

Client.prototype.requestQuota = function (manager, scope, resources, options) {

    return this._findServerForManager(manager)
        .then(function (serverApi) {
            return serverApi._requestQuota(manager, scope, resources, options);
        });

};

/**
 * Finds the Quota Server running the given manager.
 *
 * @param manager Name of the quota manager.
 * @returns {*}
 * @private
 */
Client.prototype._findServerForManager = function (manager, refreshCache) {

    var self = this;

    var promise;

    if (refreshCache || _.includes(_.pluck(this.servers, 'managers'), null)) {

        refreshCache = true; // So it won't be done a second time

        var tasks = [];
        for ( var i = 0; i < self.servers.length; i+=1 ) {
            tasks.push(self.servers[i].api._getManagers());
        }

        promise = BPromise.all(tasks)
            .then(function (managersList) {

                for ( var i = 0; i < managersList.length; i+=1 ) {
                    self.servers[i].managers = managersList[i];
                }

            });

    } else {
        promise = BPromise.resolve();
    }

    promise = promise.then(function () {

        var serverApi = null;

        for ( var i = 0; i < self.servers.length; i+=1 ) {
            if (_.contains(self.servers[i].managers, manager)) {
                serverApi = self.servers[i].api;
                break;
            }
        }

        if (serverApi === null) {
            if (refreshCache) {
                throw new errors.NoManagerError(manager);
            } else {
                return self._findServerForManager(manager, true);
            }
        }

        return serverApi;

    });

    return promise;

};


module.exports = Client;
