'use strict';

const _ = require('lodash');
const Throttling = require('./Throttling');

class LimitConcurrency extends Throttling {
    constructor(options, moreAvailableCb) {
        super();

        if (!_.isObject(options)) {
            throw new Error('options needs to be an object');
        }

        if (_.isUndefined(options.limit)) {
            throw new Error('Please pass the limit parameter to allow limit-concurrency throttling');
        }

        this.used = 0;
        this.limit = options.limit;
        this.moreAvailableCb = moreAvailableCb;
    }

    isAvailable(resourceAmount) {
        return this.used + resourceAmount <= this.limit;
    }

    reserve(resourceAmount) {
        this.used += resourceAmount;

        return feedback => {
            this.used -= resourceAmount;

            if (_.isObject(feedback)) {
                const {
                    limit
                } = feedback;

                if (!_.isFinite(limit) || limit <= 0) {
                    throw new Error('Please pass a positive number as the limit parameter');
                }

                this.limit = limit;
                if (this.used < limit) {
                    this.moreAvailableCb();
                }
            } else {
                this.moreAvailableCb();
            }
        };
    }
}

module.exports = LimitConcurrency;