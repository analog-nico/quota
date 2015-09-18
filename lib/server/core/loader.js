'use strict';

var _ = require('lodash');


function loadPreset(presetName, options) {

    var presetFile = './presets/' + presetName + '.js';
    // TODO: Error handling

    return require(presetFile)(options);

}

function loadThrottlingClass(type) {

    var throttlingFile = './throttling/' + type + '.js';
    // TODO: Error handling

    return require(throttlingFile);

}

function loadQueueingClass(type) {

    var queueingFile = './queueing/' + type + '.js';
    // TODO: Error handling

    return require(queueingFile);

}

module.exports = {
    loadPreset: loadPreset,
    loadThrottlingClass: loadThrottlingClass,
    loadQueueingClass: loadQueueingClass
};
