'use strict';

const _ = require('lodash');
const BaseGrant = require('./BaseGrant');

class Grant extends BaseGrant {
    constructor(manager, dismissCallbacks) {
        super();

        this.manager = manager;
        this.dismissCallbacks = dismissCallbacks;
    }

    /**
     * @param {{ forRule: { [ruleName: string]: { limit?: number } } }} feedback 
     */
    dismiss(feedback) {
        if (!_.isPlainObject(feedback)) {
            if (feedback) {
                throw new Error('Please pass an object to grant.dismiss(...)');
            }

            feedback = {};
        }

        const {
            forRule = {}
        } = feedback;

        // TODO: Call manager for backoff etc.
        for (const {
                rule,
                callback
            } of this.dismissCallbacks) {
            let ruleFeedback = {};

            const ruleName = rule.getName();
            if (ruleName && forRule[ruleName]) {
                ruleFeedback = feedback.forRule[ruleName];
            }

            callback(ruleFeedback);
        }
    }
}

module.exports = Grant;
