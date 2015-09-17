'use strict';

// Possible strategies: linear, cutoff, something in between
// Currently implemented strategy: cuttoff
// A more linear strategy can be produced by just dividing the limit and the window by a certain factor.

var _ = require('lodash');


function SlidingWindow(options) {

    if (_.isUndefined(options.window)) {
        throw new Error('Please pass the window parameter to allow sliding window throttling');
    }

    this._limit = options.limit;
    this._window = options.window;
    this._used = 0;

}

SlidingWindow.prototype.isAvailable = function (resourceAmount, options) {
    return this._used + resourceAmount <= this._limit;
};

SlidingWindow.prototype.reserve = function (resourceAmount, options) {

    this._used += resourceAmount;

    setTimeout(this._freeUsageFn(resourceAmount), this._window);

};

SlidingWindow.prototype._freeUsageFn = function (resourceAmount) {
    var self = this;
    return function () {
        self._used -= resourceAmount;
    };
};


module.exports = SlidingWindow;
