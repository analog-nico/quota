'use strict';

const _ = require('lodash');

const IoApi = require('./IoApi');
const Server = require('../server/Server');
const errors = require('../common/errors');

class Client {
    /**
     * 
     * @param {(string | Server) | (string | Server)[]} servers 
     */
    constructor(servers) {
        if (_.isUndefined(servers)) {
            throw new Error('Please pass at least one server to connect to.');
        }

        if (!_.isArray(servers)) {
            servers = [servers];
        }

        this.servers = [];
        for (const server of servers) {
            this.addServer(server);
        }
    }

    /**
     * 
     * @param {string | Server} server 
     */
    addServer(server) {
        if (_.isUndefined(server)) {
            throw new Error('server cannot be undefined');
        }

        let type, api;

        if (server instanceof Server) {
            type = 'local';
            api = server;
        } else if (_.isString(server)) {
            type = 'io';
            api = new IoApi({
                uri: server
            });
        } else {
            throw new TypeError('Type of server ' + server + ' not yet supported.');
        }

        this.servers.push({
            type,
            api,
            managers: null
        });
    }

    /**
     * Request quota
     * 
     * @param {string} managerName 
     * @param {{ [scopeName: string]: any }} [scope] 
     * @param {{ [resourceName: string]: number }} [resources] 
     * @param {{ maxWait?: number }} [options] 
     * 
     * @returns {Promise<{ dismiss: (feedback?) => void }>}
     */
    async requestQuota(managerName, scope, resources, options) {
        return (await this._findServerForManager(managerName))
            .requestQuota(managerName, scope, resources, options);
    }

    /**
     * Disposes of resources such as open connections
     */
    async dispose() {
        for (const {
                api
            } of this.servers) {
            if (_.isFunction(api.dispose)) {
                await api.dispose();
            }
        }
    }

    /**
     * Finds the Quota Server running the given manager.
     *
     * @param manager Name of the quota manager.
     * @returns {Promise<Server>}
     * @private
     */
    async _findServerForManager(manager, refreshCache) {
        if (refreshCache || this.servers.some(server => !server.managers)) {
            refreshCache = true; // So it won't be done a second time

            for (const server of this.servers) {
                server.managers = await server.api.getManagers();
            }
        }

        var serverApi = null;

        for (const server of this.servers) {
            if (_.includes(server.managers, manager)) {
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