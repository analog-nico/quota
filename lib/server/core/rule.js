'use strict';

var _ = require('lodash');
var BPromise = require('bluebird');

var loader = require('./loader.js');
var errors = require('../../common/errors.js');


function Rule(options) {

    if (!_.isPlainObject(options)) {
        throw new Error('Please pass the rule options.');
    }

    if (!_.isUndefined(options.name) && !_.isString(options.name)) {
        throw new Error('Please pass either undefined or a string to options.name');
    }

    if (!_.isUndefined(options.limit) && (!_.isFinite(options.limit) || options.limit <= 0)) {
        throw new Error('Please pass a positive integer to options.limit');
    }

    if (!_.isUndefined(options.window) && (!_.isFinite(options.window) || options.window <= 0)) {
        throw new Error('Please pass a positive number to options.window');
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

    this._throttlingOptions = _.assign(
        {
            limit: options.limit,
            window: options.window
        },
        _.isString(options.throttling) ?
        { type: options.throttling } :
            options.throttling
    );
    this._Throttling = loader.loadThrottlingClass(this._throttlingOptions.type);
    this._throttling = {};

    if (!_.isUndefined(options.queueing)) {

        this._queueingOptions =
            _.isString(options.queueing) ?
            { type: options.queueing } :
                options.queueing;

        this._Queueing = loader.loadQueueingClass(this._queueingOptions.type);

    }

}

Rule.prototype.getName = function () {
    return this.options.name;
};

Rule.prototype._getResource = function () {
    return this.options.resource;
};

Rule.prototype.limitsResource = function (resource) {

    if (!this.options.resource) {
        return true;
    }

    return this.options.resource === resource;

};

Rule.prototype.isAvailable = function (managerName, scope, resources, options, queuedRequest) {

    var scopeBundle = this._getBundleForScope(managerName, scope);

    if (!_.isUndefined(this._Queueing) && !queuedRequest) {
        if (scopeBundle.queueing.getNumberWaiting() > 0) {
            return false;
        }
    }

    var resourceAmount = this._getResourceAmount(resources);
    return scopeBundle.throttling.isAvailable(resourceAmount, options);

};

Rule.prototype.enqueue = function (managerName, scope, resources, options, queuedRequest) {

    if (_.isUndefined(this._Queueing)) {
        return null;
    }

    var self = this;
    return new BPromise(function (resolve, reject) {

        var queueingOp;

        if (!queuedRequest) {

            queueingOp = 'add';

            queuedRequest = {
                valid: true
            };

            if (options && _.isFinite(options.maxWait)) {
                setTimeout(function () {
                    queuedRequest.abort();
                }, options.maxWait);
            }

        } else {

            queueingOp = self === queuedRequest.previouslyQueuedForRule ? 'addAgain': 'add';

        }

        queuedRequest.process = function () {
            return new BPromise(function (resolveToProcessMore) {
                queuedRequest.gotAddedAgainToSameQueue = resolveToProcessMore;
                queuedRequest.previouslyQueuedForRule = self;
                resolve(queuedRequest);
            });
        };
        queuedRequest.abort = function () {
            queuedRequest.valid = false;
            reject(new errors.OutOfQuotaError(managerName));
            self._getBundleForScope(managerName, scope).moreAvailable();
        };

        self._getBundleForScope(managerName, scope).queueing[queueingOp](queuedRequest);

    });

};

Rule.prototype.reserve = function (managerName, scope, resources, options) {
    var resourceAmount = this._getResourceAmount(resources);
    return this._getBundleForScope(managerName, scope).throttling.reserve(resourceAmount, options);
};

Rule.prototype._formatScope = function (scope) {

    var scopeStrings = [];

    for ( var i = 0; i < this.options.scope.length; i+=1 ) {

        if (!scope || _.isUndefined(scope[this.options.scope[i]])) {
            throw new Error('Please pass a value for the "' + this.options.scope[i] + '" scope with your quota request');
        }

        scopeStrings.push(String(scope[this.options.scope[i]]).replace(/\|/g, '||'));

    }

    return scopeStrings.join('|');

};

Rule.prototype._getBundleForScope = function (managerName, scope) {

    var scopeString = this._formatScope(scope);
    if (!this._throttling[scopeString]) {

        var scopeBundle = {
            moreAvailable: _.noop
        };

        if (!_.isUndefined(this._Queueing)) {
            scopeBundle.queueing = new this._Queueing(this._queueingOptions);
            scopeBundle.moreAvailable = function () {

                if (scopeBundle.queueing.getNumberWaiting() === 0) {
                    return;
                }

                function processMore(gotAddedAgainToSameQueue) {
                    if (!gotAddedAgainToSameQueue) {
                        scopeBundle.moreAvailable();
                    }
                }

                while (true) {

                    var queuedRequest = scopeBundle.queueing.next();
                    if (_.isUndefined(queuedRequest)) {
                        return;
                    }

                    if (!queuedRequest.valid) {
                        continue;
                    }

                    queuedRequest.process().then(processMore);
                    break;

                }

            };
        }

        scopeBundle.throttling = new this._Throttling(this._throttlingOptions, scopeBundle.moreAvailable);

        this._throttling[scopeString] = scopeBundle;

    }

    return this._throttling[scopeString];

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
