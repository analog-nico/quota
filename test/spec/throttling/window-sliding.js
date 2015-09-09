'use strict';

var quota = require('../../../lib/index.js');

var _ = require('lodash');


describe('Throttling, window-sliding', function () {

    it('...', function (done) {

        var q = quota();

        q.addRule({
            limit: 10,
            window: 1000,
            throttling: 'window-sliding'
        });

        var deliveredSlots = 0;

        function slotDelivered() {
            deliveredSlots += 1;
        }

        _.times(11, function () {
            q.requestSlot()
                .then(slotDelivered);
        });

        expect(deliveredSlots).to.eql(0);

        setTimeout(function () {

            expect(deliveredSlots).to.eql(10);

            done();

        });

    });

});
