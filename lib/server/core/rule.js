'use strict';

var _ = require('lodash');

var loader = require('./loader.js');


function Rule(options) {

    if (!_.isPlainObject(options)) {
        throw new Error('Please pass the rule options.');
    }

    if (!_.isUndefined(options.limit) && (!_.isFinite(options.limit) || options.limit <= 0)) {
        throw new Error('Please pass a positive integer to options.limit');
    }

    if (!_.isUndefined(options.window) && (!_.isFinite(options.window) || options.window <= 0)) {
        throw new Error('Please pass a positive integer to options.window');
    }

    if (!_.isString(options.throttling) && !_.isPlainObject(options.throttling)) {
        throw new Error('Please pass either a string or an object to options.throttling');
    } else if (_.isPlainObject(options.throttling) && !_.isString(options.throttling.type)) {
        throw new Error('Please pass the name of the throttling module to options.throttling.type');
    }

    if (!_.isUndefined(options.queueing) && !_.isString(options.queueing) && !_.isPlainObject(options.queueing)) {
        throw new Error('Please pass either undefined, a string, or an object to options.queueing');
    } else if (_.isPlainObject(options.queueing) && !_.isString(options.queueing.type)) {
        throw new Error('Please pass the name of the queueing module to options.queueing.type');
    }

    if (!_.isUndefined(options.systemOfRecord) && !_.isString(options.systemOfRecord) && !_.isPlainObject(options.systemOfRecord)) {
        throw new Error('Please pass either undefined, a string, or an object to options.systemOfRecord');
    } else if (_.isPlainObject(options.systemOfRecord) && !_.isString(options.systemOfRecord.type)) {
        throw new Error('Please pass the name of the systemOfRecord module to options.systemOfRecord.type');
    }

    if (!_.isUndefined(options.scope) && !_.isArray(options.scope)) {
        throw new Error('Please pass either undefined or an array to options.scope');
    } else if (_.isArray(options.scope)) {
        _.forEach(options.scope, function (entry) {
            if (!_.isString(entry) || entry === '') {
                throw new Error('Please pass only strings into the options.scope array.');
            }
        });
    }

    if (!_.isUndefined(options.resources) && !_.isArray(options.resources)) {
        throw new Error('Please pass either undefined or an array to options.resources');
    } else if (_.isArray(options.scope)) {
        _.forEach(options.resources, function (entry) {
            if (!_.isString(entry) || entry === '') {
                throw new Error('Please pass only strings into the options.resources array.');
            }
        });
    }

    this.options = options;

    this.throttling = loader.loadThrottling(_.assign(
        {
            limit: options.limit,
            window: options.window
        },
        _.isString(options.throttling) ?
            { type: options.throttling } :
            options.throttling
    ));

}

Rule.prototype.freeSlotAvailable = function () {
    return this.throttling.freeSlotAvailable();
};

Rule.prototype.reserveSlot = function () {
    return this.throttling.reserveSlot();
};

module.exports = Rule;
