'use strict';

const Deque = require('double-ended-queue');

class Fifo {
    constructor() {
        this._deque = new Deque();
    }

    add(callback) {
        this._deque.push(callback);
    }

    addAgain(callback) {
        this._deque.unshift(callback);
    }

    next() {
        return this._deque.shift();
    }

    getNumberWaiting() {
        return this._deque.length;
    }
}

module.exports = Fifo;