'use strict';

const {
    unimplemented
} = require('./utils');

class BaseGrant {
    /**
     * Dismisses the reserved quota spot to be used again.
     * 
     * @param {{ forRule: { [ruleName: string]: { limit: number } } }} feedback 
     */
    dismiss(feedback) {
        unimplemented();
    }
}

module.exports = BaseGrant;
