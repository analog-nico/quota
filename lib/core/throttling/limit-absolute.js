'use strict';

const _ = require('lodash');
const Throttling = require('./Throttling');

class LimitAbsolute extends Throttling {
    constructor(options, moreAvailableCb) {
        super();

        if (_.isUndefined(options.limit)) {
            throw new Error('Please pass the limit parameter to allow limit-absolute throttling');
        }

        this.used = _.isFinite(options.used) ? options.used : 0;
        this.limit = options.limit;
        this.moreAvailableCb = moreAvailableCb;
    }

    isAvailable(resourceAmount) {
        return this.used + resourceAmount <= this.limit;
    }

    reserve(resourceAmount) {
        this._used += resourceAmount;

        return feedback => {
            if (_.isObject(feedback)) {
                const {
                    limit
                } = feedback;

                if (!_.isFinite(limit) || limit <= 0) {
                    throw new Error('Please pass a positive number as the limit parameter');
                }

                const limitIncreased = limit > this.limit;
                this.limit = limit;

                if (limitIncreased && this.used < limit) {
                    this.moreAvailableCb();
                }
            }
        };
    }
}

module.exports = LimitAbsolute;