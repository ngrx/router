require('zone.js/dist/zone.js');
require('zone.js/dist/long-stack-trace-zone.js');
require('zone.js/dist/jasmine-patch.js');
Error.stackTraceLimit = Infinity;

require('reflect-metadata');

var testContext = require.context('./spec', true, /\.spec\.ts/);
testContext.keys().forEach(testContext);

var testing = require('angular2/testing');
var browser = require('angular2/platform/testing/browser');
testing.setBaseTestProviders(
  browser.TEST_BROWSER_PLATFORM_PROVIDERS,
  browser.TEST_BROWSER_APPLICATION_PROVIDERS);
