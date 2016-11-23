# SystemJS Configuration
`SystemJS` is a universal dynamic module loader for loading various module formats in the browser and NodeJS. Using `@ngrx/router` with SystemJS as a dynamic module loader requires a bit more setup due to external dependencies.

### Setup

Below is an example of a SystemJS config which maps  `@ngrx/router` to its npm package folder along with its external dependencies including `@ngrx/core`, `path-to-regexp`, `isarray`, `query-string`, `strict-uri-encode` and `object-assign`. If you have an existing SystemJS config, just add `@ngrx/router` sections to your configuration.

```js

System.config({
  map: {
    // @ngrx/core
    '@ngrx/core': 'node_modules/@ngrx/core',

    // @ngrx/router
    '@ngrx/router': 'node_modules/@ngrx/router',

    // @ngrx/router dependencies
    'path-to-regexp': 'node_modules/path-to-regexp',
    'isarray': 'node_modules/isarray',
    'query-string': 'node_modules/query-string',
    'strict-uri-encode': 'node_modules/strict-uri-encode',
    'object-assign': 'node_modules/object-assign'
  },
  //packages defines our app package
  packages: {    
    // @ngrx/core package
    '@ngrx/core': {
      main: 'index.js',
      defaultExtension: 'js'
    },

    // @ngrx/router package
    '@ngrx/router': {
      main: 'index.js',
      defaultExtension: 'js'
    },

    // @ngrx/router dependencies
    'path-to-regexp': {
      main: 'index.js',
      defaultExtension: 'js'
    },  
    'isarray': {
      main: 'index.js',
      defaultExtension: 'js'
    },  
    'query-string': {
      main: 'index.js',
      defaultExtension: 'js'
    },  
    'strict-uri-encode': {
      main: 'index.js',
      defaultExtension: 'js'
    },  
    'object-assign': {
      main: 'index.js',
      defaultExtension: 'js'
    }
  }
});
```
Also in angular-cli-build.js need to add  '@ngrx/**/*.js'

```
var Angular2App = require('angular-cli/lib/broccoli/angular2-app');

module.exports = function(defaults) {
  return new Angular2App(defaults, {
   sassCompiler: {
      includePaths: [
        'src/app/styles'
      ]
    },
    vendorNpmFiles: [
      'systemjs/dist/system-polyfills.js',
      'systemjs/dist/system.src.js',
      'zone.js/dist/*.js',
      'es6-shim/es6-shim.js',
      'reflect-metadata/*.js',
      'rxjs/**/*.js',
      '@angular/**/*.js',
      '@angular2-material/**/*.js',
      'moment/moment.js',
      '@ngrx/**/*.js'
    ]
  });
};

