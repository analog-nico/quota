'use strict';

const socketIoClient = require('socket.io-client');

const BaseServer = require('../server/BaseServer');
const IoGrant = require('./IoGrant');

class IoApi extends BaseServer {
    constructor({
        uri = 'http://localhost'
    }) {
        super();

        const socket = socketIoClient.connect(uri);
        socket.on('disconnect', reason => {
            if (reason === 'io server disconnect') {
                socket.connect(uri);
            }
        });

        this.socket = socket;
    }

    addManager() {
        throw new Error('IoApi is readonly and managers cannot be added');
    }

    getManagers() {
        return this._request('quota.getManagers', ({
            resolve
        }, managers) => {
            resolve(managers);
        });
    }

    requestQuota(managerName, scope, resources, options) {
        return this._request('quota.request', ({
            resolve
        }, grantId) => {
            resolve(new IoGrant(this.socket, grantId));
        }, {
            managerName,
            scope,
            resources,
            options
        });
    }

    dispose() {
        this.socket.close();
    }

    /**
     * 
     * @param {string} requestName 
     * @param {({ resolve, reject }, ...args) => any} cb 
     * @param  {...any} args 
     */
    _request(requestName, cb, ...args) {
        return new Promise((resolve, reject) => {
            this.socket.emit(requestName, ...args, (e, ...args) => {
                if (e) {
                    return reject(e);
                }

                cb({
                    resolve,
                    reject
                }, ...args);
            });
        });
    }
}

module.exports = IoApi;