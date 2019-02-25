'use strict';

const _ = require('lodash');

function loadPreset(presetName, options) {
    // TODO: Error handling
    return require(`./presets/${presetName}`)(options);
}

function loadThrottlingClass(type) {
    // TODO: Error handling
    return require(`./throttling/${type}`);
}

function loadQueueingClass(type) {
    // TODO: Error handling
    return require(`./queueing/${type}`);
}

module.exports = {
    loadPreset,
    loadThrottlingClass,
    loadQueueingClass
};
