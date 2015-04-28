'use strict';

var util = require('util');


function OutOfQuotaError(message) {

    this.name = 'OutOfQuotaError';
    this.message = util.format.apply(undefined, arguments);

    Error.captureStackTrace(this);

}
OutOfQuotaError.prototype = Object.create(Error.prototype);
OutOfQuotaError.prototype.constructor = OutOfQuotaError;


module.exports = {
    OutOfQuotaError: OutOfQuotaError
};
