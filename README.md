# Quota

Sophisticated, general-purpose quota management

[![Build Status](https://travis-ci.org/analog-nico/quota.svg?branch=master)](https://travis-ci.org/analog-nico/quota) [![Coverage Status](https://coveralls.io/repos/analog-nico/quota/badge.png)](https://coveralls.io/r/analog-nico/quota?branch=master) [![Dependency Status](https://david-dm.org/analog-nico/quota.svg)](https://david-dm.org/analog-nico/quota)

## Installation

[![NPM Stats](https://nodei.co/npm/quota.png?downloads=true)](https://npmjs.org/package/quota)

This is a module for node.js and io.js and is installed via npm:

``` bash
npm install quota --save
```

## Getting Started

Description forthcoming.

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

Not yet realeased.

## License (ISC)

In case you never heard about the [ISC license](http://en.wikipedia.org/wiki/ISC_license) it is functionally equivalent to the MIT license.

See the [LICENSE file](LICENSE) for details.
