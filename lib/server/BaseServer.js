'use strict';

const {
    unimplemented
} = require('../common/utils');

class BaseServer {
    dispose() {}

    async getManagers() {
        unimplemented();
    }

    async requestQuota() {
        unimplemented();
    }
}

module.exports = BaseServer;