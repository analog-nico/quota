'use strict';

const _ = require('lodash');

class Grant {
    constructor(manager, dismissCallbacks) {
        this.manager = manager;
        this.dismissCallbacks = dismissCallbacks;
    }

    dismiss(feedback) {
        if (feedback && !_.isPlainObject(feedback)) {
            throw new Error('Please pass an object to grant.dismiss(...)');
        }

        // TODO: Call manager for backoff etc.
        for (const dismissCallback of this.dismissCallbacks) {
            var ruleFeedback = {};
            var ruleName = dismissCallback.rule.getName();
            if (ruleName && _.isPlainObject(feedback) && _.isPlainObject(feedback.forRule) && _.isPlainObject(feedback.forRule[ruleName])) {
                ruleFeedback = feedback.forRule[ruleName];
            }

            dismissCallback.callback(ruleFeedback);
        }
    }
}

module.exports = Grant;