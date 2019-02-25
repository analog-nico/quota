'use strict';

function unimplemented() {
    throw new Error('unimplemented');
}

class Throttling {
    isAvailable() {
        unimplemented();
    }

    reserve() {
        unimplemented();
    }
}

module.exports = Throttling;
