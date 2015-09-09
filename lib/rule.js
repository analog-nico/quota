'use strict';

var _ = require('lodash');

var SlidingWindow = require('./util/sliding-window.js');


function Rule(options) {

    if (!_.isPlainObject(options)) {
        throw new Error('Please pass the options.');
    }

    if (!_.isFinite(options.limit) || options.limit <= 0) {
        throw new Error('Please pass a positive integer to options.limit');
    }

    if (!_.isFinite(options.window) || options.window <= 0) {
        throw new Error('Please pass a positive integer to options.window');
    }

    this.options = options;

    this.slidingWindow = new SlidingWindow({
        slotCount: options.limit,
        freeAfter: options.window,
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
