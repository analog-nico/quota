'use strict';

class NoManagerError extends Error {
    constructor(managerName) {
        this.name = 'NoManagerError';
        this.message = 'No manager with the name ' + managerName + ' found';

        Error.captureStackTrace(this);
    }
}

class OutOfQuotaError extends Error {
    constructor(managerName) {
        this.name = 'OutOfQuotaError';
        this.message = 'Ran out of quota for ' + managerName;

        Error.captureStackTrace(this);
    }
}

module.exports = {
    NoManagerError,
    OutOfQuotaError
};