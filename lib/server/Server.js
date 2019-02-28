'use strict';

const _ = require('lodash');
const uuidv1 = require('uuid/v1');

const BaseServer = require('./BaseServer');
const Manager = require('../core/Manager');
const loader = require('../core/loader');
const errors = require('../common/errors');

class Server extends BaseServer {
    constructor() {
        super();

        this.managers = {};
    }

    addManager(managerName, managerOrOptions) {
        const { managers } = this;

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
            if (_.isPlainObject(manager)) {
                for (const name of _.keys(manager)) {
                    const _manager = manager[name];
                    if (name === 'general') {
                        this.addManager(managerName, _manager);
                    }

                    this.addManager(`${managerName}-${name}`, _manager);
                }
            } else {
                this.addManager(managerName, manager);
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
        if(!_.isPlainObject(this.ioGrants)) {
            this.ioGrants = {};
        }

        const { ioGrants } = this;

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
                    const grantId = uuidv1();
                    ioGrants[grantId] = await this.requestQuota(managerName, scope, resources, options);
                    cb(null, grantId);
                } catch (e) {
                    cb(e.message);
                }
            });

            socket.on('quota.dismissGrant', ({
                grantId,
                feedback
            }) => {
                const grant = ioGrants[grantId];
                if (grant) {
                    grant.dismiss(feedback);
                    ioGrants[grantId] = undefined;
                }
            });
        });
    }
}

module.exports = Server;