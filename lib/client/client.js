'use strict';

var BPromise = require('bluebird');
var _ = require('lodash');

var Server = require('../server/server.js');


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
            return serverApi.requestQuota(manager, scope, resources, options);
        });

};

/**
 * Finds the Quota Server running the given manager.
 *
 * @param manager Name of the quota manager.
 * @returns {*}
 * @private
 */
Client.prototype._findServerForManager = function (manager) {

    var self = this;

    var promise;

    if (_.includes(_.pluck(this.servers, 'managers'), null)) {

        var tasks = [];
        for ( var i = 0; i < self.servers.length; i+=1 ) {
            tasks.push(self.servers[i].api.getManagers());
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
            throw new Error('No server for manager ' + manager + ' found.');
        }

        return serverApi;

    });

    return promise;

};


module.exports = Client;
