'use strict';

var BPromise = require('bluebird');


function Slot() {

    this._promise = BPromise.resolve();

}

function expose(methodToExpose) {

    Slot.prototype[methodToExpose] = function () {
        return this._promise[methodToExpose].apply(this._promise, arguments);
    };

}

expose('then');
expose('catch');
expose('finally');


module.exports = Slot;
