'use strict';

// Strategies: linear, cutoff, something in between

var _ = require('lodash');


function SlidingWindow(options) {

    if (!_.isUndefined(options.freeSlotsCb) && !_.isFunction(options.freeSlotsCb)) {
        throw new Error('Please pass a function to options.freeSlotsCb');
    }

    this.options = options;

    this.slots = new Array(this.options.limit);
    this.head = null;
    this.tail = null;
    this.isFull = false;

}

SlidingWindow.prototype.isAvailable = function (resourceAmount, options) {
    return !this.isFull;
};

SlidingWindow.prototype.reserve = function (resourceAmount, options) {

    if (this.isFull) {
        throw new Error('Tried to add entry to a full sliding window.');
    }

    if (this.head === null) {
        this.head = 0;
        this.tail = 0;
        setTimeout(this._removeTail.bind(this), this.options.window);
    } else if (this.head === this.options.limit-1) {
        this.head = 0;
        if (this.tail === 1) {
            this.isFull = true;
        }
    } else {
        this.head += 1;
        if (this.head + 1 === this.tail || (this.head === this.options.limit-1 && this.tail === 0)) {
            this.isFull = true;
        }
    }

    this.slots[this.head] = (new Date()).getTime() + this.options.window;

};

SlidingWindow.prototype._removeTail = function () {

    var now = (new Date()).getTime();
    var freedSlots = false;

    while (this.tail !== null && this.slots[this.tail] <= now) {

        this.slots[this.tail] = undefined;
        this.isFull = false;
        freedSlots = true;

        if (this.tail === this.head) {
            this.tail = null;
            this.head = null;
        } else if (this.tail === this.options.limit-1) {
            this.tail = 0;
        } else {
            this.tail += 1;
        }

    }

    if (this.tail !== null) {
        setTimeout(this._removeTail.bind(this), this.slots[this.tail] - now);
    }

    if (freedSlots && this.options.freeSlotsCb) {
        this.options.freeSlotsCb();
    }

};


module.exports = SlidingWindow;
