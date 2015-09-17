'use strict';

var _ = require('lodash');


function LimitConcurrency(options) {
    this._limit = options.limit;
    this._used = 0;
}

LimitConcurrency.prototype.isAvailable = function (resourceAmount, options) {
    return this._used + resourceAmount <= this._limit;
};

LimitConcurrency.prototype.reserve = function (resourceAmount, options) {

    this._used += resourceAmount;

    var self = this;
    return function () {
        self._used -= resourceAmount;
    };

};


module.exports = LimitConcurrency;
