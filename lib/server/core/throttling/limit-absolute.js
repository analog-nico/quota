'use strict';

var _ = require('lodash');


function LimitAbsolute(options, moreAvailableCb) {
    this._limit = options.limit;
    this._used = _.isFinite(options.used) ? options.used : 0;
}

LimitAbsolute.prototype.isAvailable = function (resourceAmount, options) {
    return this._used + resourceAmount <= this._limit;
};

LimitAbsolute.prototype.reserve = function (resourceAmount, options) {
    this._used += resourceAmount;
};


module.exports = LimitAbsolute;
