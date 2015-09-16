'use strict';

var _ = require('lodash');
var BPromise = require('bluebird');

var Rule = require('./rule.js');
var Slot = require('./slot.js');
var errors = require('../../common/errors.js');


function Manager(options) {

    this.options = options || {};

    _.defaults(this.options, {
        cancelAfter: 10000,
        backoff: 'none'
    });

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

        var isAvailable = true;
        var filterForResources = _.isPlainObject(resources) ? _.keys(resources) : null;
        var ruleRelevant;

        for ( var i = 0; i < self.rules.length; i += 1 ) {

            if (filterForResources) {
                ruleRelevant = false;
                for ( var m = 0; m < filterForResources.length; m+=1 ) {
                    if (self.rules[i].limitsResource(filterForResources[m])) {
                        ruleRelevant = true;
                        break;
                    }
                }
                if (!ruleRelevant) {
                    continue;
                }
            }

            if (!self.rules[i].isAvailable(scope, resources, options)) {
                isAvailable = false;
                break;
            }

        }

        if (isAvailable) {

            for ( var k = 0; k < self.rules.length; k+=1 ) {

                if (filterForResources) {
                    ruleRelevant = false;
                    for ( var p = 0; p < filterForResources.length; p+=1 ) {
                        if (self.rules[k].limitsResource(filterForResources[p])) {
                            ruleRelevant = true;
                            break;
                        }
                    }
                    if (!ruleRelevant) {
                        continue;
                    }
                }

                self.rules[k].reserve(scope, resources, options);

            }

            resolve(new Slot());

        } else {

            reject(new errors.OutOfQuotaError(managerName));

        }

    });

};

module.exports = Manager;
