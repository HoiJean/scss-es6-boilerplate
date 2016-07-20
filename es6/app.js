/**
 * app.js
 * Includes a modernizr test for matchMedia
 * Require() the matchMedia polyfills if modernizr test is negative
 * Require() the jquery module
 * Includes an es6 module import.
 */

if (Modernizr.matchmedia) {
  // test matched
} else {
  // polyfill IE9
  require('../app/vendor/matchMedia/matchMedia.js');
  require('../app/vendor/matchMedia/matchMedia.addListener');
}

require('./modules/jquery-module');

import foo from './modules/foo';

// logs foo
foo();
