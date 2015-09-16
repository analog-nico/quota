'use strict';


function NoManagerError(managerName) {

    this.name = 'NoManagerError';
    this.message = 'No manager with the name ' + managerName + ' found';

    Error.captureStackTrace(this);

}
NoManagerError.prototype = Object.create(Error.prototype);
NoManagerError.prototype.constructor = NoManagerError;

function OutOfQuotaError(managerName) {

    this.name = 'OutOfQuotaError';
    this.message = 'Ran out of quota for ' + managerName;

    Error.captureStackTrace(this);

}
OutOfQuotaError.prototype = Object.create(Error.prototype);
OutOfQuotaError.prototype.constructor = OutOfQuotaError;


module.exports = {
    NoManagerError: NoManagerError,
    OutOfQuotaError: OutOfQuotaError
};
