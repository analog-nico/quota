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

    if (_.isUndefined(options.scope)) {
        options.scope = [];
    } else if (_.isString(options.scope)) {
        options.scope = [ options.scope ];
    } else if (_.isArray(options.scope)) {
        _.forEach(options.scope, function (entry) {
            if (!_.isString(entry) || entry === '') {
                throw new Error('Please pass only strings into the options.scope array.');
            }
        });
    } else {
        throw new Error('Please pass either undefined, a string, or an array to options.scope');
    }

    if (!_.isUndefined(options.resource) && !_.isString(options.resource)) {
        throw new Error('Please pass either undefined or a string to options.resource');
    }

    this.options = options;

    this.throttlingOptions = _.assign(
        {
            limit: options.limit,
            window: options.window
        },
        _.isString(options.throttling) ?
        { type: options.throttling } :
            options.throttling
    );
    this.throttlingModule = loader.loadThrottlingModule(this.throttlingOptions.type);
    this.throttling = {};

}

Rule.prototype.limitsResource = function (resource) {

    if (!this.options.resource) {
        return true;
    }

    return this.options.resource === resource;

};

Rule.prototype.isAvailable = function (scope, resources, options) {
    var resourceAmount = this._getResourceAmount(resources);
    return this._getThrottlingForScope(scope).isAvailable(resourceAmount, options);
};

Rule.prototype.reserve = function (scope, resources, options) {
    var resourceAmount = this._getResourceAmount(resources);
    return this._getThrottlingForScope(scope).reserve(resourceAmount, options);
};

Rule.prototype._formatScope = function (scope) {

    var scopeStrings = [];

    for ( var i = 0; i < this.options.scope.length; i+=1 ) {
        scopeStrings.push(String(scope[this.options.scope[i]]).replace(/\|/g, '||'));
    }

    return scopeStrings.join('|');

};

Rule.prototype._getThrottlingForScope = function (scope) {

    var scopeString = this._formatScope(scope);
    if (!this.throttling[scopeString]) {
        this.throttling[scopeString] = this.throttlingModule(this.throttlingOptions);
    }

    return this.throttling[scopeString];

};

Rule.prototype._getResourceAmount = function (resources) {

    if (_.isUndefined(resources)) {
        return 1;
    } else if (_.isFinite(resources)) {
        return resources;
    }

    var amount;

    if (this.options.resource) {

        amount = resources[this.options.resource];
        if (!_.isFinite(amount)) {
            throw new Error('Please pass a number to resources["' + this.options.resource.replace(/\\/g, '\\\\').replace(/\"/g, '\\"') + '"]');
        }

    } else {

        var resourceNames = _.keys(resources);
        if (resourceNames.length === 0) {
            return 1;
        }

        amount = resources[resourceNames[0]];
        if (!_.isFinite(amount)) {
            throw new Error('Please pass a number to resources["' + resourceNames[0].replace(/\\/g, '\\\\').replace(/\"/g, '\\"') + '"]');
        }

        for ( var i = 1; i < resourceNames.length; i+=1 ) {
            if (resources[resourceNames[i]] !== amount) {
                throw new Error('Please pass the resource parameter to your rules to allow requesting quota for mixed resource amounts');
            }
        }

    }

    return amount;

};

module.exports = Rule;
