'use strict';

var Deque = require('double-ended-queue');


function Fifo() {
    this._deque = new Deque();
}

Fifo.prototype.add = function (callback) {
    this._deque.push(callback);
};

Fifo.prototype.next = function () {
    return this._deque.shift();
};

Fifo.prototype.getNumberWaiting = function () {
    return this._deque.length;
};

module.exports = Fifo;
