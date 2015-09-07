'use strict';

var _ = require('lodash');
var BPromise = require('bluebird');

var Rule = require('./rule.js');
var Slot = require('./slot.js');
var errors = require('./util/errors.js');


function Quota(options) {

    this.options = options || {};

    _.defaults(this.options, {
        cancelAfter: 10000,
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

    var freeSlotAvailable = true;

    for ( var i = 0; i < this.rules.length; i += 1 ) {
        if (!this.rules[i].freeSlotAvailable()) {
            freeSlotAvailable = false;
            break;
        }
    }

    if (freeSlotAvailable) {

        for ( var k = 0; k < this.rules.length; k+=1 ) {
            this.rules[k].reserveSlot();
        }

        return new Slot();

    } else {

        return BPromise.reject(new errors.OutOfQuotaError('Queueing not yet implemented.'));

    }

};

module.exports = Quota;
