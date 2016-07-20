/**
 * jquery module
 * Require() the es6-promise-polyfill
 * Require() vendor jquery
 * Sample XHR and return a new promise.
 */

let Promise = require('es6-promise-polyfill').Promise;

let $ = require('jquery');

let json;
const jsonRequestUrl = 'ajax/test.json';

$(document).ready(function () {
  console.warn('success: require()d jquery module');

  function get(url) {
    // Return a new promise.
    var promise = new Promise(function(resolve, reject) {

      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('GET', url);

      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(req.responseText);
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function() {
        reject(Error('Network Error'));
      };

      // Make the request
      req.send();
    });
    return promise;
  }

  // Use it!
  get(jsonRequestUrl).then(function(responseText) {
    console.warn('success', responseText);
    json = JSON.parse(responseText);
  }, function(error) {
    console.error('Failed!', error);
    $('main').append('<p class="error">Data has failed to load - ' + error + '</p>');
  });

});
