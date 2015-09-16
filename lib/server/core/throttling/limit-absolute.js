'use strict';

var _ = require('lodash');


function LimitAbsolute(options) {

    this.options = options;

    this.used = 0;

}

LimitAbsolute.prototype.isAvailable = function (resources, options) {
    return this.used < this.options.limit;
};

LimitAbsolute.prototype.reserve = function (resources, options) {

    this.used += 1;

};


module.exports = function (options) {

    return new LimitAbsolute(options);

};
