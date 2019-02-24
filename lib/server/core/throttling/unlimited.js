'use strict';

const Throttling = require('./Throttling');

class Unlimited extends Throttling {
    constructor() {}

    isAvailable() {
        return true;
    }

    reserve() {}
}

module.exports = Unlimited;
