(async function () {
    'use strict';

    const io = require('socket.io')(3030);
    const quota = require('../lib');

    const server = new quota.Server();
    const manager = new quota.Manager();
    manager.addRule(new quota.Rule({
        limit: 1,
        window: 1000,
        throttling: 'window-sliding',
        queueing: 'fifo',
        resource: 'requests'
    }));
    server.addManager('ga', manager);
    server.attachIo(io);

    const client = new quota.Client('http://localhost:3030');
    const start = Date.now();
    for (let i = 0; i < 2; ++i) {
        const grant = await client.requestQuota('ga', {
            viewId: 1234
        }, {
            requests: 1
        }, {
            maxWait: Infinity
        });
        grant.dismiss();

        const diff = Date.now() - start;
        switch(i) {
            case 1:
                if(diff > 1000) {
                    console.log('test successful');
                }
            break;
        }
    }

    client.dispose();
    io.close();
})()