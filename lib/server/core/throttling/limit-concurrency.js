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
        self._moreAvailableCb();
    };

};


module.exports = LimitConcurrency;
