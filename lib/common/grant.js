'use strict';

var _ = require('lodash');


function Grant(manager, dismissCallbacks) {
    this._manager = manager;
    this._dismissCallbacks = dismissCallbacks;
}

Grant.prototype.dismiss = function (feedback) {

    if (!_.isUndefined(feedback) && !_.isPlainObject(feedback)) {
        throw new Error('Please pass either undefined or an object to grant.dismiss(...)');
    }

    // TODO: Call manager for backoff etc.

    for ( var i = 0; i < this._dismissCallbacks.length; i+=1 ) {

        var ruleFeedback = {};
        var ruleName = this._dismissCallbacks[i].rule.getName();
        if (ruleName && _.isPlainObject(feedback) && _.isPlainObject(feedback.forRule) && _.isPlainObject(feedback.forRule[ruleName])) {
            ruleFeedback = feedback.forRule[ruleName];
        }

        this._dismissCallbacks[i].callback(ruleFeedback);

    }

};


module.exports = Grant;
