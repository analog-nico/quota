'use strict';

var BPromise = require('bluebird');
var _ = require('lodash');

var Server = require('./server/server.js');


function Client(servers) {

    this.servers = [];

    if (!_.isUndefined(servers)) {

        if (!_.isArray(servers)) {
            servers = [servers];
        }

        for ( var i = 0; i < servers.length; i+=1 ) {

            if (servers[i] instanceof Server) {
                this.servers.push({
                    type: 'local',
                    api: servers[i].api,
                    managers: null
                });
            } else {
                throw new Error('Type of server not yet supported.');
            }

        }

    }

}

Client.prototype.requestQuota = function (manager, scope, resources, options) {

    return this.findServerForManager(manager)
        .then(function (serverApi) {
            return serverApi.requestQuota(manager, scope, resources, options);
        });

};

Client.prototype.findServerForManager = function (manager) {

    var self = this;

    var promise = BPromise.resolve();

    if (_.includes(_.pluck(this.servers, 'managers'), null)) {

        var tasks = [];
        for ( var i = 0; i < this.tasks.length; i+=1 ) {
            tasks.push(this.servers[i].getManagers());
        }

        promise = promise.all(tasks)
            .then(function (managersList) {

                for ( var i = 0; i < managersList.length; i+=1 ) {
                    self.servers[i].managers = managersList[i];
                }

            });

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
