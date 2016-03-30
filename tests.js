Error.stackTraceLimit = Infinity;

require('reflect-metadata');

var testContext = require.context('./spec', true, /\.spec\.ts/);
testContext.keys().forEach(testContext);
