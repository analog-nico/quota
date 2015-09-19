'use strict';


function Grant(dismissCallbacks) {
    this._dismissCallbacks = dismissCallbacks;
}

Grant.prototype.dismiss = function (feedback) {

    for ( var i = 0; i < this._dismissCallbacks.length; i+=1 ) {
        this._dismissCallbacks[i](feedback);
    }

};


module.exports = Grant;
