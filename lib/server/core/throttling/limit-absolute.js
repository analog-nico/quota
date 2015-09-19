'use strict';

var _ = require('lodash');


function LimitAbsolute(options, moreAvailableCb) {

    if (_.isUndefined(options.limit)) {
        throw new Error('Please pass the limit parameter to allow limit-absolute throttling');
    }

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
