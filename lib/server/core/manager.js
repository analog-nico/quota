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
 * @returns {*}
 */
Manager.prototype.requestQuota = function (scope, resources, options) {

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

        for ( var i = 0; i < self.rules.length; i += 1 ) {

            if (filterForResources) {
                var ruleRelevant = false;
                for ( var m = 0; m < filterForResources.length; m+=1 ) {
                    if (!self.rules[i].limitsResource(filterForResources[m])) {
                        ruleRelevant = true;
                        break;
                    }
                }
                if (!ruleRelevant) {
                    break;
                }
            }

            if (!self.rules[i].isAvailable(scope, resources, options)) {
                isAvailable = false;
                break;
            }

        }

        if (isAvailable) {

            for ( var k = 0; k < self.rules.length; k+=1 ) {
                self.rules[k].reserve(scope, resources, options);
            }

            resolve(new Slot());

        } else {

            reject(new errors.OutOfQuotaError());

        }

    });

};

module.exports = Manager;
