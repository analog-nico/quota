'use strict';

const _ = require('lodash');
const BPromise = require('bluebird');

const Manager = require('./core/manager.js');
const loader = require('./core/loader.js');
const errors = require('../common/errors.js');

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

    _getManagers() {
        return BPromise.resolve(_.keys(this._managers));
    }

    _requestQuota(managerName, scope, resources, options) {
        if (!this._managers[managerName]) {
            throw new errors.NoManagerError(managerName);
        }

        return this._managers[managerName]._requestQuota(managerName, scope, resources, options);
    }
}

module.exports = Server;
