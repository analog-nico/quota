'use strict';


function Unlimited(options, moreAvailableCb) {

}

Unlimited.prototype.isAvailable = function (resourceAmount, options) {
    return true;
};

Unlimited.prototype.reserve = function (resourceAmount, options) {

};


module.exports = Unlimited;
