'use strict';

const Throttling = require('./Throttling');

class Unlimited extends Throttling {
    constructor() {
        super();
    }

    isAvailable() {
        return true;
    }

    reserve() {}
}

module.exports = Unlimited;