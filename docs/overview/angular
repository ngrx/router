# Angular CLI Configuration
`Angular-CLI` is a cli for making Angular 2 applications. In order to integrate `ngrx/router` into a CLI project, we must install dependencies using NPM and edit the CLI project configuration.

## Dependency installation
Install the dependencies into your CLI project via npm:

```
npm install path-to-regexp isarray query-string strict-uri-encode object-assign
```

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
