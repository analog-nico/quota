'use strict';

class NoManagerError extends Error {
    constructor(managerName) {
        super(`No manager with the name ${managerName} found`);
        this.name = 'NoManagerError';
    }
}

class OutOfQuotaError extends Error {
    constructor(managerName) {
        super(`Ran out of quota for ${managerName}`);
        this.name = 'OutOfQuotaError';
    }
}

module.exports = {
    NoManagerError,
    OutOfQuotaError
};