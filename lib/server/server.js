'use strict';

const _ = require('lodash');

const Manager = require('./core/Manager');
const loader = require('./core/loader');
const errors = require('../common/errors');

class Server {
    _managers = {};

    addManager(managerName, managerOrOptions) {
        if (!_.isString(managerName)) {
            throw new Error('Please pass a string for the managerName parameter');
        } else if (this._managers[managerName]) {
            throw new Error('A manager with the name "' + managerName + '" was already added.');
        }

        if (managerOrOptions instanceof Manager) {
            this._managers[managerName] = managerOrOptions;
        } else if (_.isUndefined(managerOrOptions) || _.isPlainObject(managerOrOptions)) {
            if (managerOrOptions && !_.isUndefined(managerOrOptions.preset) && !_.isString(managerOrOptions.preset)) {
                throw new Error('Please pass either undefined or a string to options.preset');
            }

            this._managers[managerName] = loader.loadPreset(managerOrOptions && managerOrOptions.preset ? managerOrOptions.preset : managerName, managerOrOptions || {});
        } else {
            throw new Error('Please correct the the second parameter you passed to addManager(...)');
        }
    }

    exposeRestAPI(_target) {}

    async _getManagers() {
        return _.keys(this._managers);
    }

    async _requestQuota(managerName, scope, resources, options) {
        const manager = this._managers[manager];
        if (!manager) {
            throw new errors.NoManagerError(managerName);
        }

        return await manager._requestQuota(managerName, scope, resources, options);
    }
}

module.exports = Server;
