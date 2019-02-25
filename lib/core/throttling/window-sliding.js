'use strict';

// Possible strategies: linear, cutoff, something in between
// Currently implemented strategy: cuttoff
// A more linear strategy can be produced by just dividing the limit and the window by a certain factor.

const _ = require('lodash');
const Throttling = require('./Throttling');

class SlidingWindow extends Throttling {
    constructor(options, moreAvailableCb) {
        super();

        if (_.isUndefined(options.limit)) {
            throw new Error('Please pass the limit parameter to allow window-sliding throttling');
        }

        if (_.isUndefined(options.window)) {
            throw new Error('Please pass the window parameter to allow window-sliding throttling');
        }

        this.limit = options.limit;
        this.window = options.window;
        this.used = _.isFinite(options.used) ? options.used : 0;
        this.moreAvailableCb = moreAvailableCb;
    }

    isAvailable(resourceAmount) {
        return this.used + resourceAmount <= this.limit;
    }

    reserve(resourceAmount) {
        this.used += resourceAmount;

        setTimeout(() => {
            this.used -= resourceAmount;

            if (this.used < this.limit) {
                this.moreAvailableCb();
            }
        }, this.window).unref();

        return feedback => {
            if (feedback && _.isObject(feedback)) {
                const {
                    limit
                } = feedback;

                if (_.isFinite(limit) && limit > 0) {
                    const limitIncreased = limit > this.limit;
                    this.limit = limit;
                    if (limitIncreased) {
                        this.moreAvailableCb();
                    }
                }
            }
        };
    }
}

module.exports = SlidingWindow;