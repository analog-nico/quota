'use strict';

var _ = require('lodash');


function LimitAbsolute(options, moreAvailableCb) {

    if (_.isUndefined(options.limit)) {
        throw new Error('Please pass the limit parameter to allow limit-absolute throttling');
    }

    this._limit = options.limit;
    this._used = _.isFinite(options.used) ? options.used : 0;
    this._moreAvailableCb = moreAvailableCb;

}

LimitAbsolute.prototype.isAvailable = function (resourceAmount, options) {
    return this._used + resourceAmount <= this._limit;
};

LimitAbsolute.prototype.reserve = function (resourceAmount, options) {

    this._used += resourceAmount;

    var self = this;
    return function (feedback) {

        if (!_.isUndefined(feedback.limit)) {

            if (!_.isFinite(feedback.limit) || feedback.limit <= 0) {
                throw new Error('Please pass a positive number as the limit parameter');
            }

            var limitIncreased = feedback.limit > self._limit;

            self._limit = feedback.limit;

            if (limitIncreased && self._used < self._limit) {
                self._moreAvailableCb();
            }

        }

    };

};


module.exports = LimitAbsolute;
