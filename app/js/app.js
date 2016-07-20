(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/*! matchMedia() polyfill addListener/removeListener extension. Author & copyright (c) 2012: Scott Jehl. Dual MIT/BSD license */
(function () {
    // Bail out for browsers that have addListener support
    if (window.matchMedia && window.matchMedia('all').addListener) {
        return false;
    }

    var localMatchMedia = window.matchMedia,
        hasMediaQueries = localMatchMedia('only all').matches,
        isListening = false,
        timeoutID = 0,
        // setTimeout for debouncing 'handleChange'
    queries = [],
        // Contains each 'mql' and associated 'listeners' if 'addListener' is used
    handleChange = function handleChange(evt) {
        // Debounce
        clearTimeout(timeoutID);

        timeoutID = setTimeout(function () {
            for (var i = 0, il = queries.length; i < il; i++) {
                var mql = queries[i].mql,
                    listeners = queries[i].listeners || [],
                    matches = localMatchMedia(mql.media).matches;

                // Update mql.matches value and call listeners
                // Fire listeners only if transitioning to or from matched state
                if (matches !== mql.matches) {
                    mql.matches = matches;

                    for (var j = 0, jl = listeners.length; j < jl; j++) {
                        listeners[j].call(window, mql);
                    }
                }
            }
        }, 30);
    };

    window.matchMedia = function (media) {
        var mql = localMatchMedia(media),
            listeners = [],
            index = 0;

        mql.addListener = function (listener) {
            // Changes would not occur to css media type so return now (Affects IE <= 8)
            if (!hasMediaQueries) {
                return;
            }

            // Set up 'resize' listener for browsers that support CSS3 media queries (Not for IE <= 8)
            // There should only ever be 1 resize listener running for performance
            if (!isListening) {
                isListening = true;
                window.addEventListener('resize', handleChange, true);
            }

            // Push object only if it has not been pushed already
            if (index === 0) {
                index = queries.push({
                    mql: mql,
                    listeners: listeners
                });
            }

            listeners.push(listener);
        };

        mql.removeListener = function (listener) {
            for (var i = 0, il = listeners.length; i < il; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                }
            }
        };

        return mql;
    };
})();

},{}],2:[function(require,module,exports){
'use strict';

/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = function () {
    "use strict";

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
        var style = document.createElement('style'),
            script = document.getElementsByTagName('script')[0],
            info = null;

        style.type = 'text/css';
        style.id = 'matchmediajs-test';

        script.parentNode.insertBefore(style, script);

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
            matchMedium: function matchMedium(media) {
                var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }

                // Test if media query is true or false
                return info.width === '1px';
            }
        };
    }

    return function (media) {
        return {
            matches: styleMedia.matchMedium(media || 'all'),
            media: media || 'all'
        };
    };
}());

},{}],3:[function(require,module,exports){
'use strict';

var _foo = require('./modules/foo');

var _foo2 = _interopRequireDefault(_foo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

// logs foo
(0, _foo2.default)();

},{"../app/vendor/matchMedia/matchMedia.addListener":1,"../app/vendor/matchMedia/matchMedia.js":2,"./modules/foo":4,"./modules/jquery-module":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  console.warn('success: imported es6 module');
};

},{}],5:[function(require,module,exports){
'use strict';

/**
 * jquery module
 * Require() the es6-promise-polyfill
 * Require() vendor jquery
 * Sample XHR and return a new promise.
 */

var Promise = require('es6-promise-polyfill').Promise;

var $ = require('jquery');

var json = void 0;
var jsonRequestUrl = 'ajax/test.json';

$(document).ready(function () {
  console.warn('success: require()d jquery module');

  function get(url) {
    // Return a new promise.
    var promise = new Promise(function (resolve, reject) {

      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('GET', url);

      req.onload = function () {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(req.responseText);
        } else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function () {
        reject(Error('Network Error'));
      };

      // Make the request
      req.send();
    });
    return promise;
  }

  // Use it!
  get(jsonRequestUrl).then(function (responseText) {
    console.warn('success', responseText);
    json = JSON.parse(responseText);
  }, function (error) {
    console.error('Failed!', error);
    $('main').append('<p class="error">Data has failed to load - ' + error + '</p>');
  });
});

},{"es6-promise-polyfill":"es6-promise-polyfill","jquery":"jquery"}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvdmVuZG9yL21hdGNoTWVkaWEvbWF0Y2hNZWRpYS5hZGRMaXN0ZW5lci5qcyIsImFwcC92ZW5kb3IvbWF0Y2hNZWRpYS9tYXRjaE1lZGlhLmpzIiwiZXM2L2FwcC5qcyIsImVzNi9tb2R1bGVzL2Zvby5qcyIsImVzNi9tb2R1bGVzL2pxdWVyeS1tb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0MsYUFBVTtBQUNQO0FBQ0EsUUFBSSxPQUFPLFVBQVAsSUFBcUIsT0FBTyxVQUFQLENBQWtCLEtBQWxCLEVBQXlCLFdBQWxELEVBQStEO0FBQzNELGVBQU8sS0FBUDtBQUNIOztBQUVELFFBQUksa0JBQWtCLE9BQU8sVUFBN0I7QUFBQSxRQUNJLGtCQUFrQixnQkFBZ0IsVUFBaEIsRUFBNEIsT0FEbEQ7QUFBQSxRQUVJLGNBQWtCLEtBRnRCO0FBQUEsUUFHSSxZQUFrQixDQUh0QjtBQUFBLFFBRzRCO0FBQ3hCLGNBQWtCLEVBSnRCO0FBQUEsUUFJNEI7QUFDeEIsbUJBQWtCLFNBQWxCLFlBQWtCLENBQVMsR0FBVCxFQUFjO0FBQzVCO0FBQ0EscUJBQWEsU0FBYjs7QUFFQSxvQkFBWSxXQUFXLFlBQVc7QUFDOUIsaUJBQUssSUFBSSxJQUFJLENBQVIsRUFBVyxLQUFLLFFBQVEsTUFBN0IsRUFBcUMsSUFBSSxFQUF6QyxFQUE2QyxHQUE3QyxFQUFrRDtBQUM5QyxvQkFBSSxNQUFjLFFBQVEsQ0FBUixFQUFXLEdBQTdCO0FBQUEsb0JBQ0ksWUFBYyxRQUFRLENBQVIsRUFBVyxTQUFYLElBQXdCLEVBRDFDO0FBQUEsb0JBRUksVUFBYyxnQkFBZ0IsSUFBSSxLQUFwQixFQUEyQixPQUY3Qzs7QUFJQTtBQUNBO0FBQ0Esb0JBQUksWUFBWSxJQUFJLE9BQXBCLEVBQTZCO0FBQ3pCLHdCQUFJLE9BQUosR0FBYyxPQUFkOztBQUVBLHlCQUFLLElBQUksSUFB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TyxLQUFLLEtBQUwsQ0FBVyxZQUFYLENBQVA7QUFDRCxHQUhELEVBR0csVUFBUyxLQUFULEVBQWdCO0FBQ2pCLFlBQVEsS0FBUixDQUFjLFNBQWQsRUFBeUIsS0FBekI7QUFDQSxNQUFFLE1BQUYsRUFBVSxNQUFWLENBQWlCLGdEQUFnRCxLQUFoRCxHQUF3RCxNQUF6RTtBQUNELEdBTkQ7QUFRRCxDQTdDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiEgbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIGFkZExpc3RlbmVyL3JlbW92ZUxpc3RlbmVyIGV4dGVuc2lvbi4gQXV0aG9yICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLiBEdWFsIE1JVC9CU0QgbGljZW5zZSAqL1xuKGZ1bmN0aW9uKCl7XG4gICAgLy8gQmFpbCBvdXQgZm9yIGJyb3dzZXJzIHRoYXQgaGF2ZSBhZGRMaXN0ZW5lciBzdXBwb3J0XG4gICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhICYmIHdpbmRvdy5tYXRjaE1lZGlhKCdhbGwnKS5hZGRMaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGxvY2FsTWF0Y2hNZWRpYSA9IHdpbmRvdy5tYXRjaE1lZGlhLFxuICAgICAgICBoYXNNZWRpYVF1ZXJpZXMgPSBsb2NhbE1hdGNoTWVkaWEoJ29ubHkgYWxsJykubWF0Y2hlcyxcbiAgICAgICAgaXNMaXN0ZW5pbmcgICAgID0gZmFsc2UsXG4gICAgICAgIHRpbWVvdXRJRCAgICAgICA9IDAsICAgIC8vIHNldFRpbWVvdXQgZm9yIGRlYm91bmNpbmcgJ2hhbmRsZUNoYW5nZSdcbiAgICAgICAgcXVlcmllcyAgICAgICAgID0gW10sICAgLy8gQ29udGFpbnMgZWFjaCAnbXFsJyBhbmQgYXNzb2NpYXRlZCAnbGlzdGVuZXJzJyBpZiAnYWRkTGlzdGVuZXInIGlzIHVzZWRcbiAgICAgICAgaGFuZGxlQ2hhbmdlICAgID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICAvLyBEZWJvdW5jZVxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJRCk7XG5cbiAgICAgICAgICAgIHRpbWVvdXRJRCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gcXVlcmllcy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtcWwgICAgICAgICA9IHF1ZXJpZXNbaV0ubXFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzICAgPSBxdWVyaWVzW2ldLmxpc3RlbmVycyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMgICAgID0gbG9jYWxNYXRjaE1lZGlhKG1xbC5tZWRpYSkubWF0Y2hlcztcblxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgbXFsLm1hdGNoZXMgdmFsdWUgYW5kIGNhbGwgbGlzdGVuZXJzXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcmUgbGlzdGVuZXJzIG9ubHkgaWYgdHJhbnNpdGlvbmluZyB0byBvciBmcm9tIG1hdGNoZWQgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMgIT09IG1xbC5tYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtcWwubWF0Y2hlcyA9IG1hdGNoZXM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBqbCA9IGxpc3RlbmVycy5sZW5ndGg7IGogPCBqbDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzW2pdLmNhbGwod2luZG93LCBtcWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMzApO1xuICAgICAgICB9O1xuXG4gICAgd2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbihtZWRpYSkge1xuICAgICAgICB2YXIgbXFsICAgICAgICAgPSBsb2NhbE1hdGNoTWVkaWEobWVkaWEpLFxuICAgICAgICAgICAgbGlzdGVuZXJzICAgPSBbXSxcbiAgICAgICAgICAgIGluZGV4ICAgICAgID0gMDtcblxuICAgICAgICBtcWwuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgICAgICAgICAgLy8gQ2hhbmdlcyB3b3VsZCBub3Qgb2NjdXIgdG8gY3NzIG1lZGlhIHR5cGUgc28gcmV0dXJuIG5vdyAoQWZmZWN0cyBJRSA8PSA4KVxuICAgICAgICAgICAgaWYgKCFoYXNNZWRpYVF1ZXJpZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNldCB1cCAncmVzaXplJyBsaXN0ZW5lciBmb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IENTUzMgbWVkaWEgcXVlcmllcyAoTm90IGZvciBJRSA8PSA4KVxuICAgICAgICAgICAgLy8gVGhlcmUgc2hvdWxkIG9ubHkgZXZlciBiZSAxIHJlc2l6ZSBsaXN0ZW5lciBydW5uaW5nIGZvciBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgaWYgKCFpc0xpc3RlbmluZykge1xuICAgICAgICAgICAgICAgIGlzTGlzdGVuaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlQ2hhbmdlLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHVzaCBvYmplY3Qgb25seSBpZiBpdCBoYXMgbm90IGJlZW4gcHVzaGVkIGFscmVhZHlcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gcXVlcmllcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbXFsICAgICAgICAgOiBtcWwsXG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycyAgIDogbGlzdGVuZXJzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgfTtcblxuICAgICAgICBtcWwucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGlsOyBpKyspe1xuICAgICAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNbaV0gPT09IGxpc3RlbmVyKXtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG1xbDtcbiAgICB9O1xufSgpKTtcbiIsIi8qISBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlICovXG5cbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgICB2YXIgc3R5bGVNZWRpYSA9ICh3aW5kb3cuc3R5bGVNZWRpYSB8fCB3aW5kb3cubWVkaWEpO1xuXG4gICAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICAgIGlmICghc3R5bGVNZWRpYSkge1xuICAgICAgICB2YXIgc3R5bGUgICAgICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgICAgICAgICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgICAgICAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICAgICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuICAgICAgICBzdHlsZS5pZCAgICA9ICdtYXRjaG1lZGlhanMtdGVzdCc7XG5cbiAgICAgICAgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgIGluZm8gPSAoJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdykgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgICAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgICAgICAgbWF0Y2hNZWRpdW06IGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSAnQG1lZGlhICcgKyBtZWRpYSArICd7ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfSc7XG5cbiAgICAgICAgICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgICAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgICAgICB9O1xuICAgIH07XG59KCkpO1xuIiwiLyoqXG4gKiBhcHAuanNcbiAqIEluY2x1ZGVzIGEgbW9kZXJuaXpyIHRlc3QgZm9yIG1hdGNoTWVkaWFcbiAqIFJlcXVpcmUoKSB0aGUgbWF0Y2hNZWRpYSBwb2x5ZmlsbHMgaWYgbW9kZXJuaXpyIHRlc3QgaXMgbmVnYXRpdmVcbiAqIFJlcXVpcmUoKSB0aGUganF1ZXJ5IG1vZHVsZVxuICogSW5jbHVkZXMgYW4gZXM2IG1vZHVsZSBpbXBvcnQuXG4gKi9cblxuaWYgKE1vZGVybml6ci5tYXRjaG1lZGlhKSB7XG4gIC8vIHRlc3QgbWF0Y2hlZFxufSBlbHNlIHtcbiAgLy8gcG9seWZpbGwgSUU5XG4gIHJlcXVpcmUoJy4uL2FwcC92ZW5kb3IvbWF0Y2hNZWRpYS9tYXRjaE1lZGlhLmpzJyk7XG4gIHJlcXVpcmUoJy4uL2FwcC92ZW5kb3IvbWF0Y2hNZWRpYS9tYXRjaE1lZGlhLmFkZExpc3RlbmVyJyk7XG59XG5cbnJlcXVpcmUoJy4vbW9kdWxlcy9qcXVlcnktbW9kdWxlJyk7XG5cbmltcG9ydCBmb28gZnJvbSAnLi9tb2R1bGVzL2Zvbyc7XG5cbi8vIGxvZ3MgZm9vXG5mb28oKTtcbiIsIi8vIG1vZHVsZXMvZm9vLmpzXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLndhcm4oJ3N1Y2Nlc3M6IGltcG9ydGVkIGVzNiBtb2R1bGUnKTtcbn1cbiIsIi8qKlxuICoganF1ZXJ5IG1vZHVsZVxuICogUmVxdWlyZSgpIHRoZSBlczYtcHJvbWlzZS1wb2x5ZmlsbFxuICogUmVxdWlyZSgpIHZlbmRvciBqcXVlcnlcbiAqIFNhbXBsZSBYSFIgYW5kIHJldHVybiBhIG5ldyBwcm9taXNlLlxuICovXG5cbmxldCBQcm9taXNlID0gcmVxdWlyZSgnZXM2LXByb21pc2UtcG9seWZpbGwnKS5Qcm9taXNlO1xuXG5sZXQgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5sZXQganNvbjtcbmNvbnN0IGpzb25SZXF1ZXN0VXJsID0gJ2FqYXgvdGVzdC5qc29uJztcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLndhcm4oJ3N1Y2Nlc3M6IHJlcXVpcmUoKWQganF1ZXJ5IG1vZHVsZScpO1xuXG4gIGZ1bmN0aW9uIGdldCh1cmwpIHtcbiAgICAvLyBSZXR1cm4gYSBuZXcgcHJvbWlzZS5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgICAvLyBEbyB0aGUgdXN1YWwgWEhSIHN0dWZmXG4gICAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICByZXEub3BlbignR0VUJywgdXJsKTtcblxuICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBUaGlzIGlzIGNhbGxlZCBldmVuIG9uIDQwNCBldGNcbiAgICAgICAgLy8gc28gY2hlY2sgdGhlIHN0YXR1c1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIHdpdGggdGhlIHJlc3BvbnNlIHRleHRcbiAgICAgICAgICByZXNvbHZlKHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSByZWplY3Qgd2l0aCB0aGUgc3RhdHVzIHRleHRcbiAgICAgICAgICAvLyB3aGljaCB3aWxsIGhvcGVmdWxseSBiZSBhIG1lYW5pbmdmdWwgZXJyb3JcbiAgICAgICAgICByZWplY3QoRXJyb3IocmVxLnN0YXR1c1RleHQpKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gSGFuZGxlIG5ldHdvcmsgZXJyb3JzXG4gICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QoRXJyb3IoJ05ldHdvcmsgRXJyb3InKSk7XG4gICAgICB9O1xuXG4gICAgICAvLyBNYWtlIHRoZSByZXF1ZXN0XG4gICAgICByZXEuc2VuZCgpO1xuICAgIH0pO1xuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgLy8gVXNlIGl0IVxuICBnZXQoanNvblJlcXVlc3RVcmwpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2VUZXh0KSB7XG4gICAgY29uc29sZS53YXJuKCdzdWNjZXNzJywgcmVzcG9uc2VUZXh0KTtcbiAgICBqc29uID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpO1xuICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCEnLCBlcnJvcik7XG4gICAgJCgnbWFpbicpLmFwcGVuZCgnPHAgY2xhc3M9XCJlcnJvclwiPkRhdGEgaGFzIGZhaWxlZCB0byBsb2FkIC0gJyArIGVycm9yICsgJzwvcD4nKTtcbiAgfSk7XG5cbn0pO1xuIl19
