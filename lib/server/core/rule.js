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

    if (_.isString(options.resources)) {
        options.resources = [ options.resources ];
    }

    if (!_.isUndefined(options.resources) && !_.isArray(options.resources)) {
        throw new Error('Please pass either undefined, a string, or an array to options.resources');
    } else if (_.isArray(options.scope)) {
        _.forEach(options.resources, function (entry) {
            if (!_.isString(entry) || entry === '') {
                throw new Error('Please pass only strings into the options.resources array.');
            }
        });
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

    if (!this.options.resources) {
        return true;
    }

    return _.contains(this.options.resources, resource);

};

Rule.prototype.isAvailable = function (scope, resources, options) {
    return this._getThrottlingForScope(scope).isAvailable(resources, options);
};

Rule.prototype.reserve = function (scope, resources, options) {
    return this._getThrottlingForScope(scope).reserve(resources, options);
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

module.exports = Rule;
