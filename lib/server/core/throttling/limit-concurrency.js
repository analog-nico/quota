'use strict';

var _ = require('lodash');


function LimitConcurrency(options, moreAvailableCb) {

    if (_.isUndefined(options.limit)) {
        throw new Error('Please pass the limit parameter to allow limit-concurrency throttling');
    }

    this._limit = options.limit;
    this._used = 0;
    this._moreAvailableCb = moreAvailableCb;

}

LimitConcurrency.prototype.isAvailable = function (resourceAmount, options) {
    return this._used + resourceAmount <= this._limit;
};

LimitConcurrency.prototype.reserve = function (resourceAmount, options) {

    this._used += resourceAmount;

    var self = this;
    return function (feedback) {

        self._used -= resourceAmount;

        if (!_.isUndefined(feedback.limit)) {

            if (!_.isFinite(feedback.limit) || feedback.limit <= 0) {
                throw new Error('Please pass a positive number as the limit parameter');
            }

            self._limit = feedback.limit;

            if (self._used < self._limit) {
                self._moreAvailableCb();
            }

        } else {

            self._moreAvailableCb();

        }

    };

};


module.exports = LimitConcurrency;
