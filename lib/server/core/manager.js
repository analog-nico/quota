'use strict';

const _ = require('lodash');

const Rule = require('./Rule');
const Grant = require('../../common/Grant');
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

        const resource = rule.getResource();
        if (resource && !_.includes(this.resources, resource)) {
            this.resources.push(resource);
        }

        return rule;
    }

    /**
     * Request quota
     * 
     * @param {string} managerName 
     * @param {{}} scope 
     * @param {{}} resources 
     * @param {{}} options 
     * @param {*} queuedRequest 
     * @returns {Promise<Grant>}
     * @private
     */
    requestQuota(managerName, scope, resources, options, queuedRequest) {
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

        return new Promise((resolve, reject) => {
            const filterForResources = _.isPlainObject(resources) ? _.keys(resources) : null;
            var relevantRules;

            if (filterForResources) {
                relevantRules = [];

                for (const rule of this.rules) {
                    for (const filter of filterForResources) {
                        if (rule.limitsResource(filter)) {
                            relevantRules.push(rule);
                            break;
                        }
                    }
                }
            } else {
                relevantRules = this.rules;
            }

            if (relevantRules.length === 0) {
                return reject(new Error('Please request quota for at least one of the following resources: ' + this.resources.join(', ')));
            }

            const enqueue = (rule, queuedRequest) => {
                const p = rule.enqueue(managerName, scope, resources, options, queuedRequest);
                if (p === null || (queuedRequest && queuedRequest.valid === false)) {
                    // Between the call of queuedRequest.process() and enqueueing the request again the abort timer may have fired!
                    return reject(new errors.OutOfQuotaError(managerName));
                }

                setImmediate(async () => {
                    resolve(this.requestQuota(managerName, scope, resources, options, await p));
                });
            }

            for (const rule of relevantRules) {
                if (!rule.isAvailable(managerName, scope, resources, options, queuedRequest)) {
                    enqueue(rule, queuedRequest);

                    if (queuedRequest) {
                        queuedRequest.gotAddedAgainToSameQueue(rule === queuedRequest.previouslyQueuedForRule);
                    }

                    return;
                }
            }

            if (queuedRequest) {
                queuedRequest.gotAddedAgainToSameQueue(false);
            }

            const dismissCallbacks = [];
            for (const rule of relevantRules) {
                const callback = rule.reserve(managerName, scope, resources, options);
                if (_.isFunction(callback)) {
                    dismissCallbacks.push({
                        rule,
                        callback
                    });
                }
            }

            resolve(new Grant(this, dismissCallbacks));
        });
    }
}

module.exports = Manager;