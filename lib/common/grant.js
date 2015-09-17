'use strict';


function Grant(dismissCallbacks) {
    this._dismissCallbacks = dismissCallbacks;
}

Grant.prototype.dismiss = function (info) {

    for ( var i = 0; i < this._dismissCallbacks.length; i+=1 ) {
        this._dismissCallbacks[i](info);
    }

};


module.exports = Grant;
