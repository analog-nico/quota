'use strict';

var _ = require('lodash');

var SlidingWindow = require('./util/sliding-window.js');


function Rule(options) {

    if (!_.isPlainObject(options)) {
        throw new Error('Please pass the options.');
    }

    if (!_.isFinite(options.slots) || options.slots <= 0) {
        throw new Error('Please pass a positive integer to options.slots');
    }

    if (!_.isFinite(options.every) || options.every <= 0) {
        throw new Error('Please pass a positive integer to options.every');
    }

    this.options = options;

    this.slidingWindow = new SlidingWindow({
        slotCount: options.slots,
        freeAfter: options.every,
        freeSlotsCb: function () {}
    });

}

Rule.prototype.freeSlotAvailable = function () {
    return this.slidingWindow.freeSlotAvailable();
};

Rule.prototype.reserveSlot = function () {
    return this.slidingWindow.reserveSlot();
};

module.exports = Rule;
