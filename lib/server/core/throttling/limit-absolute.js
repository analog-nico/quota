'use strict';

var _ = require('lodash');


function LimitAbsolute(options) {

    this.options = options;

    this.used = 0;

}

LimitAbsolute.prototype.isAvailable = function (resourceAmount, options) {
    return this.used + resourceAmount <= this.options.limit;
};

LimitAbsolute.prototype.reserve = function (resourceAmount, options) {
    this.used += resourceAmount;
};


module.exports = LimitAbsolute;
