'use strict';

var _ = require('lodash');


function loadPreset(presetName, options) {

    var presetFile = './presets/' + presetName + '.js';
    // TODO: Error handling

    return require(presetFile)(options);

}

function loadThrottlingModule(type) {

    var throttlingFile = './throttling/' + type + '.js';
    // TODO: Error handling

    return require(throttlingFile);

}

module.exports = {
    loadPreset: loadPreset,
    loadThrottlingModule: loadThrottlingModule
};
