'use strict';

var _ = require('lodash');

var Quota = require('./quota.js');


module.exports = function (optionsOrPresetName, optionsForPreset) {

    var presetName = null;
    var options = {};

    if (_.isString(optionsOrPresetName)) {
        presetName = optionsOrPresetName;
        if (_.isPlainObject(options)) {
            options = optionsForPreset;
        }
    } else if (_.isPlainObject(optionsOrPresetName)) {
        options = optionsOrPresetName;
    } else {
        throw new TypeError('Invalid arguments.');
    }

    if (presetName) {

        var presetFile = './presets/' + presetName + '.js';
        // TODO: Error handling

        return require(presetFile)(options);

    }

    return new Quota(options);

};
