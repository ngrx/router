require('core-js');
require('zone.js/dist/zone.js');
require('zone.js/dist/long-stack-trace-zone.js');
require('zone.js/dist/jasmine-patch.js');
require('zone.js/dist/async-test.js');
require('zone.js/dist/fake-async-test.js');

Error.stackTraceLimit = Infinity;

require('reflect-metadata');

const testContext = require.context('./spec', true, /\.spec\.ts/);
testContext.keys().forEach(testContext);

const testing = require('angular2/testing');
const browser = require('angular2/platform/testing/browser');
testing.setBaseTestProviders(
  browser.TEST_BROWSER_PLATFORM_PROVIDERS,
  browser.TEST_BROWSER_APPLICATION_PROVIDERS);
