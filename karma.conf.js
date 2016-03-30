module.exports = function(karma) {
  'use strict';

  karma.set({
    basePath: __dirname,

    frameworks: ['jasmine'],

    files: [
      {pattern: 'node_modules/zone.js/dist/zone.js', watched: false},
      {pattern: 'node_modules/zone.js/dist/long-stack-trace-zone.js', watched: false},
      {pattern: 'node_modules/zone.js/dist/jasmine-patch.js', watched: false},
      'tests.js'
    ],

    exclude: [],

    preprocessors: {
      'tests.js': ['webpack', 'sourcemap']
    },

    reporters: ['progress'],

    browsers: ['Chrome'],

    port: 9018,
    runnerPort: 9101,
    colors: true,
    logLevel: karma.LOG_INFO,
    autoWatch: true,
    singleRun: false,

    webpack: {
      resolve: {
        root: __dirname,
        extensions: ['', '.ts', '.js']
      },
      module: {
        loaders: [
          {
            test: /\.ts?$/,
            exclude: /(node_modules)/,
            loader: 'ts-loader'
          }
        ]
      }
    }
  });
};
