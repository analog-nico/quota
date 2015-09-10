'use strict';

var _ = require('lodash');


function loadThrottling(options) {

    var throttlingFile = './throttling/' + options.type + '.js';
    // TODO: Error handling

    return require(throttlingFile)(options);

}

module.exports = {
    loadThrottling: loadThrottling
};
