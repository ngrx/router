# Webpack Configuration
`Webpack` takes modules with dependencies and generates static assets representing those modules. Webpack has issues loading `@ngrx/router` and `@ngrx/core` from the node_modules folder (similar to `@angular`, `rxjs`, and `@angular2-material`), so their source maps need to be excluded from the preLoaders. 

### Setup

Below is an example of a Webpack config which maps  `@ngrx/router` to its npm package folder along with `@ngrx/core`, an external dependency. If you have an existing Webpack config, just add the following sections to your configuration (`config/webpack.common.js` in the [Angular 2 Webpack Starter](https://github.com/AngularClass/angular2-webpack-starter)).

```js

module.exports = {
  
  ...
  
  module: {
    preLoaders: [
    {
      test: /\.js$/,
      loader: 'source-map-loader',
      exclude: [
        // these packages have problems with their sourcemaps
        helpers.root('node_modules/@ngrx/core'),
        helpers.root('node_modules/@ngrx/router')
      ]
    }
   ]
  }
  
 ...
 
};
```
