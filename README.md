# Quota

Sophisticated, general-purpose quota management

[![Build Status](https://travis-ci.org/analog-nico/quota.svg?branch=master)](https://travis-ci.org/analog-nico/quota) [![Coverage Status](https://coveralls.io/repos/analog-nico/quota/badge.png)](https://coveralls.io/r/analog-nico/quota?branch=master) [![Dependency Status](https://david-dm.org/analog-nico/quota.svg)](https://david-dm.org/analog-nico/quota)

## Installation

[![NPM Stats](https://nodei.co/npm/quota.png?downloads=true)](https://npmjs.org/package/quota)

This is a module for node.js and is installed via npm:

``` bash
npm install quota --save
```

## Use Cases for This Library

Whereever you need to respect or enforce quota limits this library can help:
- You can respect the quota limits if you **e.g. call the Twitter API**. For Twitter and many other well-known API providers this library ships presets that mirror the quota limits of the API provider. This way your code will know if quota is left or how long to wait until more quota gets available without calling the provider's API that would respond with an error. Internal queueing, prioritizing, and backoff mechanisms allow using the available quota to a maximum extend without risking being categorized as abusive by the API provider.
- You can enforce quota limits **e.g. for your own API that you provide** using custom API call rate limits - simple to very sophisticated - or even **e.g. in office applications that limit the number of pages to print each month**.

## Examples

### Quota for 1 API on a single node.js instance

``` js
var quota = require('quota');

// Create and configure the quota server which manages the quota usage.
var quotaServer = new quota.Server();
quotaServer.addQuotaManager('github'); // This is loading one of many presets.

// Create a client connected to the server locally - so no overhead involved.
var quotaClient = new quota.Client(quotaServer);

// Requesting quota for a single GitHub API call on behalf of the analog-nico user.
quotaClient.requestQuota('github', { userId: 'analog-nico' })
	.then(function (grant) {
		// The quota request was granted. Call the GitHub API now.
	})
	.catch(quota.OutOfQuotaError, function (err) {
		// The quota request was denied. E.g. notify the user to try again later.
	})
	.catch(function (err) {
		// Due to technical reasons the quota request was neither granted nor denied. E.g. notify the admins.
	});
```

### Quota for multiple APIs on a single node.js instance

``` js
var quota = require('quota');

// Create and configure the quota server which manages the quota usage.
var quotaServer = new quota.Server();
quotaServer.addQuotaManager('twitter'); // This is loading one of many presets.
quotaServer.addQuotaManager('xyzApi', { /* options that define custom quota limits */ });

// Create a client connected to the server locally - so no overhead involved.
var quotaClient = new quota.Client(quotaServer);

// You may now request the quota from each manager as needed.
quotaClient.requestQuota('twitter', /* ... */ ).then(function (grant) { /* ... */ });
quotaClient.requestQuota('xyzApi', /* ... */ ).then(function (grant) { /* ... */ });
```

### Quota management in a cluster environment (multiple node.js instances)

E.g. the Google Analytics API puts a limit on the overall requests per day. If you have a cluster environment with e.g. 10-20 dynamically scaled node.js instances which all do Google Analytics API calls the quota has to be managed by a single, centralized Quota server. Therefore the Quota Client supports the connection to a remote Quota Server.

Choose one node.js instance to run the Quota Server:

``` js
var quota = require('quota');
var express = require('express');

var quotaServer = new quota.Server();
quotaServer.addQuotaManager('google-analytics'); // This is loading one of many presets.

// Expose the server via a REST API
var app = express();
quotaServer.exposeRestAPI(app);

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Connect your Quota Clients to http://%s:%s', host, port);
});
```

Use the following code on all node.js instances that want to request quota:

``` js
var quota = require('quota');

// Create a client connected to the remote server.
var quotaClient = new quota.Client(process.env.QUOTA_SERVER_URL);

// You may now request the quota as always.
quotaClient.requestQuota('google-analytics', /* ... */ ).then(function (grant) { /* ... */ });
```

### Quota management in a cluster environment with local and remote Quota Servers

If the quota management is done by a remote Quota Server some overhead is introduced by the Client's REST API calls to the Server. By deploying all node.js instances in the same datacenter this overhead is minimal but can be further reduced by only running those Quota Managers on the remote Quota Server that require centralized management. All other Quota Managers can be moved to a local Quota Server:

``` js
var quota = require('quota');

// Create and configure the local Quota Server.
var quotaServer = new quota.Server();
quotaServer.addQuotaManager('bitly'); // Bitly puts independent limits on each IP address. So local management is sufficient.

// Create a client connected to both the local and the remote Server.
var quotaClient = new quota.Client([ quotaServer, process.env.QUOTA_SERVER_URL ]);

// When requesting quota the Client automatically finds the right Quota Server.
quotaClient.requestQuota('google-analytics', /* ... */ ).then(function (grant) { /* ... */ });
quotaClient.requestQuota('bitly', /* ... */ ).then(function (grant) { /* ... */ });
```

## Contributing

To set up your development environment for Quota:

1. Clone this repo to your desktop,
2. in the shell `cd` to the main folder,
3. hit `npm install`,
4. hit `npm install gulp -g` if you haven't installed gulp globally yet, and
5. run `gulp dev`. (Or run `node ./node_modules/.bin/gulp dev` if you don't want to install gulp globally.)

`gulp dev` watches all source files and if you save some changes it will lint the code and execute all tests. The test coverage report can be viewed from `./coverage/lcov-report/index.html`.

If you want to debug a test you should use `gulp test-without-coverage` to run all tests without obscuring the code by the test coverage instrumentation.

## Change History

Not yet released.

## License (ISC)

In case you never heard about the [ISC license](http://en.wikipedia.org/wiki/ISC_license) it is functionally equivalent to the MIT license.

See the [LICENSE file](LICENSE) for details.
