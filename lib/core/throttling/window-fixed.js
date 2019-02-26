'use strict';

// Possible strategies: cutoff, linear-remaining, twice-average-remaining
// Currently implemented strategy: cuttoff
// A more linear strategy can be produced by just dividing the limit by a certain factor and returning shorter intervals with getStartOfNextWindow.

const _ = require('lodash');
const Throttling = require('./Throttling');

class FixedWindow extends Throttling {
    constructor(options, moreAvailableCb) {
        super();

        if (_.isUndefined(options.limit)) {
            throw new Error('Please pass the limit parameter to allow window-fixed throttling');
        }

        if (!_.isFunction(options.getStartOfNextWindow)) {
            throw new Error('Please pass a function as the getStartOfNextWindow parameter to allow window-fixed throttling');
        }

        this.limit = options.limit;
        this.used = _.isFinite(options.used) ? options.used : 0;
        this.moreAvailableCb = moreAvailableCb;
        this.getStartOfNextWindow = options.getStartOfNextWindow;

        this._prepareNextWindow();
    }

    isAvailable(resourceAmount) {
        return this.used + resourceAmount <= this.limit;
    }

    reserve(resourceAmount) {
        this.used += resourceAmount;

        return feedback => {
            if (_.isObject(feedback)) {
                const {
                    limit
                } = feedback;

                if (typeof limit !== 'undefined') {
                    if (!_.isFinite(limit) || limit <= 0) {
                        throw new Error('Please pass a positive number as the limit parameter');
                    }

                    const limitIncreased = limit > this.limit;
                    this.limit = limit;
                    if (limitIncreased) {
                        this.moreAvailableCb();
                    }
                }
            }
        };
    }

    _prepareNextWindow() {
        const later = this.getStartOfNextWindow();
        const now = (new Date()).getTime();

        setTimeout(() => {
            this.used = 0;
            this._prepareNextWindow();
            this.moreAvailableCb();
        }, later - now).unref();
    }
}

module.exports = FixedWindow;
