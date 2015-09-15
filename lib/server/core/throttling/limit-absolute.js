'use strict';

var _ = require('lodash');

var errors = require('../../../common/errors.js');


function LimitAbsolute(options) {

    this.options = options;

    this.used = 0;

}

LimitAbsolute.prototype.freeSlotAvailable = function () {
    return this.used < this.options.limit;
};

LimitAbsolute.prototype.reserveSlot = function () {

    if (!this.freeSlotAvailable()) {
        throw new errors.OutOfQuotaError();
    }

    this.used += 1;

};


module.exports = function (options) {

    return new LimitAbsolute(options);

};
