# Angular CLI Configuration
`Angular-CLI` is a cli for making Angular 2 applications. In order to integrate `ngrx/router` into a CLI project, we must install the ngrx/router and it's dependencies using NPM and edit the CLI project configuratio so that the CLI project understands where to find it.

## Installation
`npm install @ngrx/router @ngrx/core --save`

## Setup
The `angular-cli-build.js` and `system-config.ts` files must be updated for the CLI project to know where to find `ngrx/router`.

### angular-cli-build.js
The `vendorNpmFiles` array in the `angular-cli-build.js` file must be updated to include the ngrx/router and it's dependencies.

```js
    vendorNpmFiles: [
      'systemjs/dist/system-polyfills.js',
      'systemjs/dist/system.src.js',
      'zone.js/dist/**/*.+(js|js.map)',
      'es6-shim/es6-shim.js',
      'reflect-metadata/**/*.+(js|js.map)',
      'rxjs/**/*.+(js|js.map)',
      '@angular/**/*.+(js|js.map)',

      /* ngrx/router begin */
      '@ngrx/**/*.+(js|js.map)',
      'path-to-regexp/*.+(js|js.map)',
      'isarray/*.+(js|js.map)',
      'query-string/*.+(js|js.map)',
      'strict-uri-encode/*.+(js|js.map)',
      'object-assign/*.+(js|js.map)'
      /* ngrx/router end */
    ]
```

### system-config.ts
The `map` and `packages` constants must be updated in the `system-config.ts` file.

```js
/** Map relative paths to URLs. */
const map: any = {
  /* ngrx/router begin */ 
  '@ngrx': 'vendor/@ngrx',
  'path-to-regexp": "vendor/path-to-regexp',
  'isarray': 'vendor/isarray',
  'query-string': 'vendor/query-string',
  'strict-uri-encode': 'vendor/strict-uri-encode',
  'object-assign': 'vendor/object-assign'
  /* ngrx/router end */ 
};

/** User packages configuration. */
const packages: any = {
  /* ngrx/router begin */ 
  '@ngrx/core': { main: 'index' },
  '@ngrx/router': { main: 'index' },
  'path-to-regexp': { main: 'index' },
  'isarray': { main: 'index' },
  'query-string': { main: 'index' },
  'strict-uri-encode': { main: 'index' },
  'object-assign': { main: 'index' }
  /* ngrx/router end */
};
```
