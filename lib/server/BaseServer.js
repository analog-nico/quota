'use strict';

function unimplemented() {
    throw new Error('unimplemented');
}

class BaseServer {
    addManager() {
        unimplemented();
    }

    async getManagers() {
        unimplemented();
    }

    async requestQuota() {
        unimplemented();
    }
}

module.exports = BaseServer;