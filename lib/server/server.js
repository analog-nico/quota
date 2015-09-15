'use strict';

var _ = require('lodash');
var BPromise = require('bluebird');

var Manager = require('./core/manager.js');


function Server() {
    this._managers = {};
}

Server.prototype.addManager = function (managerName, manager) {

    if (this._managers[managerName]) {
        throw new Error('A manager with the name "' + managerName + '" was added already.');
    }

    this._managers[managerName] = manager;

};

Server.prototype.getManagers = function () {
    return BPromise.resolve(_.keys(this._managers));
};

Server.prototype.requestQuota = function (managerName, scope, resources, options) {

    if (!this._managers[managerName]) {
        throw new Error('No manager with the name "' + managerName + '" found.');
    }

    return this._managers[managerName].requestQuota(scope, resources, options);

};

Server.prototype.exposeRestAPI = function (target) {

};

module.exports = Server;
