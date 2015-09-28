'use strict';

// Possible strategies: linear, cutoff, something in between
// Currently implemented strategy: cuttoff
// A more linear strategy can be produced by just dividing the limit and the window by a certain factor.

var _ = require('lodash');


function SlidingWindow(options, moreAvailableCb) {

    if (_.isUndefined(options.limit)) {
        throw new Error('Please pass the limit parameter to allow window-sliding throttling');
    }

    if (_.isUndefined(options.window)) {
        throw new Error('Please pass the window parameter to allow window-sliding throttling');
    }

    this._limit = options.limit;
    this._window = options.window;
    this._used = 0;
    this._moreAvailableCb = moreAvailableCb;

}

SlidingWindow.prototype.isAvailable = function (resourceAmount, options) {
    return this._used + resourceAmount <= this._limit;
};

SlidingWindow.prototype.reserve = function (resourceAmount, options) {

    this._used += resourceAmount;

    setTimeout(this._freeUsageFn(resourceAmount), this._window).unref();

    var self = this;
    return function (feedback) {

        if (!_.isUndefined(feedback.limit)) {

            if (!_.isFinite(feedback.limit) || feedback.limit <= 0) {
                throw new Error('Please pass a positive number as the limit parameter');
            }

            var limitIncreased = feedback.limit > self._limit;

            self._limit = feedback.limit;

            if (limitIncreased) {
                self._moreAvailableCb();
            }

        }

    };

};

SlidingWindow.prototype._freeUsageFn = function (resourceAmount) {
    var self = this;
    return function () {

        self._used -= resourceAmount;

        if (self._used < self._limit) {
            self._moreAvailableCb();
        }

    };
};


module.exports = SlidingWindow;
