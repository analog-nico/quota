'use strict';

var _ = require('lodash');
var BPromise = require('bluebird');

var Rule = require('./rule.js');


function Quota(options) {

    this.options = options || {};

    _.defaults(this.options, {
        cancelAfter: 10000,
        throttling: 'cutoff',
        backoff: 'none'
    });

    this.rules = [];

}

Quota.prototype.addRule = function (options) {

    var rule = new Rule(options);

    this.rules.push(rule);

    return rule;

};

Quota.prototype.requestSlot = function () {

};

module.exports = Quota;
