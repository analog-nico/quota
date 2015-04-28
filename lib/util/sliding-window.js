'use strict';

var _ = require('lodash');


function SlidingWindow(options) {

    if (!_.isPlainObject(options)) {
        throw new Error('Please pass the options.');
    }

    if (!_.isFinite(options.slotCount) || options.slotCount <= 0) {
        throw new Error('Please pass a positive integer to options.slotCount');
    }

    if (!_.isFinite(options.freeAfter) || options.freeAfter <= 0) {
        throw new Error('Please pass a positive integer to options.freeAfter');
    }

    if (!_.isFunction(options.freeSlotsCb)) {
        throw new Error('Please pass a callback to options.freeSlotsCb');
    }

    this.options = options;

    this.slots = new Array(this.options.slotCount);
    this.head = null;
    this.tail = null;
    this.isFull = false;

}

SlidingWindow.prototype.freeSlotAvailable = function () {
    return !this.isFull;
};

SlidingWindow.prototype.reserveSlot = function () {

    if (this.isFull) {
        throw new Error('Tried to add entry to a full sliding window.');
    }

    if (this.head === null) {
        this.head = 0;
        this.tail = 0;
        setTimeout(this._removeTail, this.options.freeAfter);
    } else if (this.head === this.options.slotCount-1) {
        this.head = 0;
        if (this.tail === 1) {
            this.isFull = true;
        }
    } else {
        this.head += 1;
        if (this.head + 1 === this.tail || (this.head === this.options.slotCount-1 && this.tail === 0)) {
            this.isFull = true;
        }
    }

    this.slots[this.head] = (new Date()).getTime() + this.options.freeAfter;

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
        } else if (this.tail === this.options.slotCount-1) {
            this.tail = 0;
        } else {
            this.tail += 1;
        }

    }

    if (this.tail !== null) {
        setTimeout(this._removeTail, this.slots[this.tail] - now);
    }

    if (freedSlots) {
        this.options.freeSlotsCb();
    }

};

module.exports = SlidingWindow;
