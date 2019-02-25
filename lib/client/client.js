'use strict';

const async = require('async');
const _ = require('lodash');

const Server = require('../server/server');
const errors = require('../common/errors');

class Client {
    constructor(servers) {
        if (_.isUndefined(servers)) {
            throw new Error('Please pass at least one server to connect to.');
        }

        if (!_.isArray(servers)) {
            servers = [servers];
        }

        this.servers = [];
        for (const server of servers) {
            if (server instanceof Server) {
                this.servers.push({
                    type: 'local',
                    api: server,
                    managers: null
                });
            } else {
                throw new TypeError('Type of server ' + server + ' not yet supported.');
            }
        }
    }

    async requestQuota(manager, scope, resources, options) {
        return (await this._findServerForManager(manager))
            ._requestQuota(manager, scope, resources, options);
    }

    /**
     * Finds the Quota Server running the given manager.
     *
     * @param manager Name of the quota manager.
     * @returns {*}
     * @private
     */
    async _findServerForManager(manager, refreshCache) {
        if (refreshCache || _.includes(_.pluck(this.servers, 'managers'), null)) {
            refreshCache = true; // So it won't be done a second time

            await async.forEach(this.servers, async server => {
                server.managers = await server.api._getManagers();
            });
        }

        var serverApi = null;

        for (const server of this.servers) {
            if (_.contains(server.managers, manager)) {
                serverApi = server.api;
                break;
            }
        }

        if (serverApi === null) {
            if (refreshCache) {
                throw new errors.NoManagerError(manager);
            } else {
                return this._findServerForManager(manager, true);
            }
        }

        return serverApi;
    }
}

module.exports = Client;