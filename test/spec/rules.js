'use strict';

var quota = require('../../lib/index.js');

var _ = require('lodash');


describe('Rules', function () {

    describe('with node instance scope', function () {

        it('cutoff throttling, no backoff', function (done) {

            var q = quota({
                cancelAfter: 1000,
                backoff: 'none'
            });

            q.addRule({
                limit: 10,
                window: 1000,
                throttling: 'window-fixed',
                queueing: 'none',
                scope: []
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

                //clock.tick(998);
                //
                //expect(deliveredSlots).to.eql(10);
                //
                //clock.tick(1);
                //
                //expect(deliveredSlots).to.eql(11);
                //
                //clock.tick(100);
                //
                //q.requestSlot()
                //    .then(function () {
                //        done();
                //    });

            });

        });

    });

});
