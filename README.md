# Sass boilerplate with Browserify and Gulp

##### My personal boilerplate for Sass, ES6 and HTML5.

## Features

1. Browserify is used for compiling two js bundles, vendor.js and app.js
2. Bower.json and npm package.json dependencies are required using helper functions and streamed together to form the vendor.js.
3. The entry point app.js is available for requiring additional javascript modules via browserify.
4. A custom Modernizr build has been configured using gulp and merged with the vendor stream.
5. Both vendor and app scripts are referenced at the end of the html body tag to ensure there are no blockers on page load to aid progressive enhancement.
6. To support IE9, app.js has modernizr feature detection, in this case testing for matchMedia and supplying a polyfill, in addition to supplying support for matchMedia.addListeners.
7. Gulp tasks provide linting for both js (eslint) and scss (scsslint) with config options in lint.yml and .eslintrc.json as is babelify used to compile ES6 to ES5. Console.warn has been used to pass linting and highlight successful calls.
8. Production code is copied to /dist including html and json if you're testing local ajax requests.
9. Sourcemaps are produced for non production code. Browserify handles the javascript while gulp maps the scss.
10. Bower config provides a portable Sass with Susy instance and an scss starting point is also provided including a sassDoc.

## Installation

Run <code>bower install && npm install</code>.

Bower code is downloaded to ./app/vendor

## Build & development

Run `gulp watch` for development with browser preview and `gulp --type production` for minified code available in /dist.



#### For IE9:

1. ES6 Promise polyfill.

2. matchMedia and matchMedia.addListener polyfills.
