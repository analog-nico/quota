'use strict';

const _ = require('lodash');
const BPromise = require('bluebird');

const Rule = require('./Rule');
const Grant = require('../../common/grant');
const errors = require('../../common/errors');

class Manager {
    constructor(options) {
        this.options = options || {};
        this.rules = [];
        this.resources = [];
    }

    /**
     * 
     * @param {object | Rule} ruleOrOptions 
     * @returns {Rule}
     */
    addRule(ruleOrOptions) {
        let rule = ruleOrOptions;

        if (!(ruleOrOptions instanceof Rule)) {
            rule = new Rule(ruleOrOptions);
        }

        this.rules.push(rule);

        const resource = rule._getResource();
        if (resource && !_.contains(this.resources, resource)) {
            this.resources.push(resource);
        }

        return rule;
    }

    /**
     * Request quota
     *
     * @param {object} [scope]
     * @param {(number|object)} [resources]
     * @param {object} [options]
     * @returns {bluebird}
     * @private
     */
    _requestQuota(managerName, scope, resources, options, queuedRequest) {
        if (!_.isUndefined(scope) && !_.isPlainObject(scope)) {
            throw new Error('Please pass either undefined or an object to the scope parameter.');
        }

        if (!_.isUndefined(resources) && !_.isPlainObject(resources) && !_.isFinite(resources)) {
            throw new Error('Please pass either undefined, a number, or an object to the resources parameter.');
        } else if (this.resources.length > 1 && !_.isPlainObject(resources)) {
            throw new Error('Please request quota for a selection of the following resources: ' + this.resources.join(', '));
        }

        if (!_.isUndefined(options) && !_.isPlainObject(options)) {
            throw new Error('Please pass either undefined or an object to the options parameter.');
        }

        var self = this;

        return new BPromise(function (resolve, reject) {

            var filterForResources = _.isPlainObject(resources) ? _.keys(resources) : null;
            var relevantRules;

            if (filterForResources) {

                relevantRules = [];

                for (var r = 0; r < self.rules.length; r += 1) {
                    for (var s = 0; s < filterForResources.length; s += 1) {
                        if (self.rules[r]._limitsResource(filterForResources[s])) {
                            relevantRules.push(self.rules[r]);
                            break;
                        }
                    }
                }

            } else {
                relevantRules = self.rules;
            }

            if (relevantRules.length === 0) {
                reject(new Error('Please request quota for at least one of the following resources: ' + self.resources.join(', ')));
                return;
            }

            function enqueue(rule, queuedRequest) {

                var p = rule._enqueue(managerName, scope, resources, options, queuedRequest);
                if (p === null) {
                    reject(new errors.OutOfQuotaError(managerName));
                } else if (queuedRequest && queuedRequest.valid === false) {
                    // Between the call of queuedRequest.process() and enqueueing the request again the abort timer may have fired!
                    reject(new errors.OutOfQuotaError(managerName));
                } else {
                    p = p.then(function (queuedRequest) {
                        return self._requestQuota(managerName, scope, resources, options, queuedRequest);
                    });
                    resolve(p);
                }

            }

            for (var i = 0; i < relevantRules.length; i += 1) {
                if (!relevantRules[i]._isAvailable(managerName, scope, resources, options, queuedRequest)) {

                    enqueue(relevantRules[i], queuedRequest);

                    if (queuedRequest) {
                        queuedRequest.gotAddedAgainToSameQueue(relevantRules[i] === queuedRequest.previouslyQueuedForRule);
                    }

                    return;

                }
            }

            if (queuedRequest) {
                queuedRequest.gotAddedAgainToSameQueue(false);
            }

            var dismissCallbacks = [];
            for (var k = 0; k < relevantRules.length; k += 1) {
                var cb = relevantRules[k]._reserve(managerName, scope, resources, options);
                if (cb) {
                    dismissCallbacks.push({
                        rule: relevantRules[k],
                        callback: cb
                    });
                }
            }

            resolve(new Grant(self, dismissCallbacks));
        });
    }
}

module.exports = Manager;