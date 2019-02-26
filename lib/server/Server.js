'use strict';

const _ = require('lodash');
const uuidv1 = require('uuid/v1');
const socketIo = require('socket.io');

const BaseServer = require('./BaseServer');
const Manager = require('../core/Manager');
const loader = require('../core/loader');
const errors = require('../common/errors');

class Server extends BaseServer {
    constructor() {
        super();

        this.managers = {};
        this.grants = [];
    }

    /**
     * Adds the selected manager to the Server. If a preset is set
     * or options is not specified, a preset is loaded.
     * 
     * @param {string} managerName 
     * @param {Manager | { preset: String }} managerOrOptions 
     */
    addManager(managerName, managerOrOptions) {
        const managers = this.managers;

        if (!_.isString(managerName)) {
            throw new Error('Please pass a string for the managerName parameter');
        } else if (managers[managerName]) {
            throw new Error(`A manager with the name ${managerName} was already added`);
        }

        if (managerOrOptions instanceof Manager) {
            managers[managerName] = managerOrOptions;
        } else if (_.isUndefined(managerOrOptions) || _.isPlainObject(managerOrOptions)) {
            if (managerOrOptions && !_.isUndefined(managerOrOptions.preset) && !_.isString(managerOrOptions.preset)) {
                throw new Error('Please pass either undefined or a string to options.preset');
            }

            // preset name can, and in theory, should be different than the manager name
            const presetName = (managerOrOptions && managerOrOptions.preset) ?
                managerOrOptions.preset :
                managerName;

            const manager = loader.loadPreset(presetName, managerOrOptions || {});

            // support multiple managers for one preset
            if (!(manager instanceof Manager) && _.isPlainObject(manager)) {
                for (const name of _.keys(manager)) {
                    const _manager = manager[name];
                    if (name === 'general') {
                        managers[managerName] = _manager;
                    }

                    this.addManager(`${managerName}-${name}`, _manager);
                }
            } else {
                managers[managerName] = manager;
            }
        } else {
            throw new Error('Please correct the the second parameter you passed to addManager(...)');
        }
    }

    async getManagers() {
        return _.keys(this.managers);
    }

    async requestQuota(managerName, scope, resources, options) {
        const manager = this.managers[managerName];
        if (!manager) {
            throw new errors.NoManagerError(managerName);
        }

        return await manager.requestQuota(managerName, scope, resources, options);
    }

    attachIo(io) {
        io.on('connection', socket => {
            socket.on('quota.getManagers', async cb => {
                try {
                    cb(null, await this.getManagers());
                } catch (e) {
                    cb(e.message);
                }
            });

            socket.on('quota.request', async ({
                managerName,
                scope,
                resources,
                options
            }, cb) => {
                try {
                    const id = uuidv1();

                    this.grants[id] = await this.requestQuota(managerName, scope, resources, options);
                    cb(null, id);
                } catch (e) {
                    cb(e.message);
                }
            });

            socket.on('quota.dismissGrant', ({
                id,
                feedback
            }) => {
                const grant = this.grants[id];
                if (grant) {
                    grant.dismiss(feedback);
                    this.grants[id] = undefined;
                    delete this.grants[id];
                }
            });
        });
    }
}

module.exports = Server;
