'use strict';

const Queueing = require('./Queueing');
const Deque = require('double-ended-queue');

class Fifo extends Queueing {
    constructor() {
        super();

        this._deque = new Deque();
    }

    add(item) {
        this._deque.push(item);
    }

    addAgain(item) {
        this._deque.unshift(item);
    }

    next() {
        return this._deque.shift();
    }

    getNumberWaiting() {
        return this._deque.length;
    }
}

module.exports = Fifo;