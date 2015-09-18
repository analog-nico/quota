'use strict';

var _ = require('lodash');
var BPromise = require('bluebird');

var Rule = require('./rule.js');
var Grant = require('../../common/grant.js');
var errors = require('../../common/errors.js');


function Manager(options) {

    this.options = options || {};

    this.rules = [];

}

Manager.prototype.addRule = function (ruleOrOptions) {

    var rule = ruleOrOptions;

    if (ruleOrOptions instanceof Rule === false) {
        rule = new Rule(ruleOrOptions);
    }

    this.rules.push(rule);

    return rule;

};

/**
 * Request quota
 *
 * @param {object} [scope]
 * @param {(number|object)} [resources]
 * @param {object} [options]
 * @returns {bluebird}
 * @private
 */
Manager.prototype._requestQuota = function (managerName, scope, resources, options) {

    if (!_.isUndefined(scope) && !_.isPlainObject(scope)) {
        throw new Error('Please pass either undefined or an object to the scope parameter.');
    }

    if (!_.isUndefined(resources) && !_.isPlainObject(resources) && !_.isFinite(resources)) {
        throw new Error('Please pass either undefined, a number, or an object to the resources parameter.');
    }

    var self = this;

    return new BPromise(function (resolve, reject) {

        var filterForResources = _.isPlainObject(resources) ? _.keys(resources) : null;
        var relevantRules;

        if (filterForResources) {

            relevantRules = [];

            for ( var r = 0; r < self.rules.length; r+=1 ) {
                for ( var s = 0; s < filterForResources.length; s+=1 ) {
                    if (self.rules[r].limitsResource(filterForResources[s])) {
                        relevantRules.push(self.rules[r]);
                        break;
                    }
                }
            }

        } else {
            relevantRules = self.rules;
        }

        function enqueue(rule) {

            var p = rule.enqueue(scope, resources, options);
            if (p === null) {
                reject(new errors.OutOfQuotaError(managerName));
            } else {
                p = p.then(function () {
                    return self._requestQuota(managerName, scope, resources, options);
                });
                resolve(p);
            }

        }

        for ( var i = 0; i < relevantRules.length; i += 1 ) {
            if (!relevantRules[i].isAvailable(scope, resources, options)) {

                enqueue(relevantRules[i]);
                return;

            }
        }

        var dismissCallbacks = [];
        for ( var k = 0; k < relevantRules.length; k+=1 ) {
            var cb = relevantRules[k].reserve(scope, resources, options);
            if (cb) {
                dismissCallbacks.push(cb);
            }
        }

        resolve(new Grant(dismissCallbacks));

    });

};

module.exports = Manager;
