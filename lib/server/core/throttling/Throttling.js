'use strict';

function unimplemented() {
    throw new Error('unimplemented');
}

class Throttling {
    constructor() {
        unimplemented();
    }

    isAvailable() {
        unimplemented();
    }

    reserve() {
        unimplemented();
    }
}

module.exports = Throttling;
