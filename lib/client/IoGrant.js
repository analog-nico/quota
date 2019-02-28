'use strict';

const BaseGrant = require('../common/BaseGrant');

class IoGrant extends BaseGrant {
    constructor(socket, grantId) {
        super();

        this.socket = socket;
        this.grantId = grantId;
    }

    /**
     * @param {{ forRule: { [ruleName: string]: { limit: number } } }} feedback 
     */
    dismiss(feedback) {
        this.socket.emit('quota.dismissGrant', {
            grantId: this.grantId,
            feedback
        });
    }
}

module.exports = IoGrant;