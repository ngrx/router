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

# Angular CLI Configuration
`Angular-CLI` is a cli for making Angular 2 applications. In order to integrate `ngrx/router` into a CLI project, it must be added to the CLI project configuration.

## Setup

The `system-config.ts` and `angular-cli-build.js` files must be updated for `ngrx/router`.

### system-config.ts

The `map` and `packages` sections must be updated in the `system-config.ts` file.

```js
/** Map relative paths to URLs. */
const map: any = {
  '@ngrx': 'vendor/@ngrx',
  "path-to-regexp": "vendor/path-to-regexp",
  'isarray': 'vendor/isarray',
  'query-string': 'vendor/query-string',
  "strict-uri-encode": "vendor/strict-uri-encode",
  "object-assign": "vendor/object-assign"
};

/** User packages configuration. */
const packages: any = {
  "@ngrx/core": { main: 'index' },
  "@ngrx/router": { main: 'index' },
  "path-to-regexp": { main: 'index' },
  "isarray": { main: 'index' },
  "query-string": { main: 'index' },
  "strict-uri-encode": { main: 'index' },
  "object-assign": { main: 'index' }
};
```

### angular-cli-build.js

The `ngrx` scope and `ngrx/router` dependencies must also be added to the `vendorNpmFiles` section.

```js
'@ngrx/**/*.+(js|js.map)',
'path-to-regexp/*.+(js|js.map)',
'isarray/*.+(js|js.map)',
'query-string/*.+(js|js.map)',
'strict-uri-encode/*.+(js|js.map)',
'object-assign/*.+(js|js.map)'
```
