'use strict';

var _ = require('lodash');


function loadPreset(presetName, options) {

    var presetFile = './presets/' + presetName + '.js';
    // TODO: Error handling

    return require(presetFile)(options);

}

function loadThrottling(options) {

    var throttlingFile = './throttling/' + options.type + '.js';
    // TODO: Error handling

    return require(throttlingFile)(options);

}

module.exports = {
    loadPreset: loadPreset,
    loadThrottling: loadThrottling
};
