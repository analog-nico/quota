'use strict';

// Possible strategies: cutoff, linear-remaining, twice-average-remaining
// Currently implemented strategy: cuttoff
// A more linear strategy can be produced by just dividing the limit by a certain factor and returning shorter intervals with getStartOfNextWindow.

var _ = require('lodash');


function FixedWindow(options, moreAvailableCb) {

    if (_.isUndefined(options.limit)) {
        throw new Error('Please pass the limit parameter to allow window-fixed throttling');
    }

    if (!_.isFunction(options.getStartOfNextWindow)) {
        throw new Error('Please pass a function as the getStartOfNextWindow parameter to allow window-fixed throttling');
    }

    this._limit = options.limit;
    this._used = _.isFinite(options.used) ? options.used : 0;
    this._moreAvailableCb = moreAvailableCb;
    this._getStartOfNextWindow = options.getStartOfNextWindow;

    this._prepareNextWindow();

}

FixedWindow.prototype.isAvailable = function (resourceAmount, options) {
    return this._used + resourceAmount <= this._limit;
};

FixedWindow.prototype.reserve = function (resourceAmount, options) {

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

FixedWindow.prototype._prepareNextWindow = function () {

    var time = this._getStartOfNextWindow();

    var self = this;
    setTimeout(function () {
        self._used = 0;
        self._prepareNextWindow();
        self._moreAvailableCb();
    }, time - (new Date()).getTime()).unref();

};


module.exports = FixedWindow;
