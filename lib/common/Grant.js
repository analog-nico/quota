'use strict';

const _ = require('lodash');

class Grant {
    constructor(manager, dismissCallbacks) {
        this.manager = manager;
        this.dismissCallbacks = dismissCallbacks;
    }

    /**
     * Dismisses the reserved quota spot to be used again.
     * 
     * @param {{ forRule: { [ruleName: string]: { limit: number } } }} feedback 
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
        for (const { rule, callback } of this.dismissCallbacks) {
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
