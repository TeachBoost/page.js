!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.page=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
 /* jshint browser:true */

 /**
  * Module dependencies.
  */

 var pathtoRegexp = require('path-to-regexp');

 /**
  * Module exports.
  */

 module.exports = page;

 /**
  * Perform initial dispatch.
  */

 var dispatch = true;

 /**
  * Base path.
  */

 var base = '';

 /**
  * Running flag.
  */

 var running;

 /**
  * @Talia added: IE8 fix / History Polyfill
  * https://github.com/visionmedia/page.js/pull/48/files
  */

  var location = window.history.location || window.location;
  // console.log( 'window.history.location: ' + window.history.location );
  // console.log( 'window.location: ' + window.location );
  // console.log( 'location: ' + location );


 // @Talia added: IE8 fix / Hasbang (NEEDED?)
 // https://github.com/visionmedia/page.js/pull/86/files
 /**
  * HashBang option
  */

 var hashbang = false;

 /**
  * @Talia added: IE8 fix / Various Polyfills
  *
  */

 // Object.keys support
 // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 if (!Object.keys) {
   // console.log( 'POLYFILL to support Object keys' );
   Object.keys = (function () {
     'use strict';
     var hasOwnProperty = Object.prototype.hasOwnProperty,
         hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
         dontEnums = [
           'toString',
           'toLocaleString',
           'valueOf',
           'hasOwnProperty',
           'isPrototypeOf',
           'propertyIsEnumerable',
           'constructor'
         ],
         dontEnumsLength = dontEnums.length;

     return function (obj) {
       if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
         throw new TypeError('Object.keys called on non-object');
       }

       var result = [], prop, i;

       for (prop in obj) {
         if (hasOwnProperty.call(obj, prop)) {
           result.push(prop);
         }
       }

       if (hasDontEnumBug) {
         for (i = 0; i < dontEnumsLength; i++) {
           if (hasOwnProperty.call(obj, dontEnums[i])) {
             result.push(dontEnums[i]);
           }
         }
       }
       return result;
     };
   }());
 }

 // @Talia added: IE8 fix / Array.isArray support
 // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Compatibility
 if(!Array.isArray) {
   // console.log( 'POLYFILL to support Array.isArray' );
   Array.isArray = function(arg) {
     return Object.prototype.toString.call(arg) === '[object Array]';
   };
 }




 /** @Talia: END POLYFILL **/

 /**
  * Register `path` with callback `fn()`,
  * or route `path`, or `page.start()`.
  *
  *   page(fn);
  *   page('*', fn);
  *   page('/user/:id', load, user);
  *   page('/user/' + user.id, { some: 'thing' });
  *   page('/user/' + user.id);
  *   page();
  *
  * @param {String|Function} path
  * @param {Function} fn...
  * @api public
  */

 function page(path, fn) {
   // <callback>
   if ('function' == typeof path) {
     return page('*', path);
   }

   // route <path> to <callback ...>
   if ('function' == typeof fn) {
     var route = new Route(path);
     for (var i = 1; i < arguments.length; ++i) {
       page.callbacks.push(route.middleware(arguments[i]));
     }
   // show <path> with [state]
   } else if ('string' == typeof path) {
     page.show(path, fn);
   // start [options]
   } else {
     page.start(path);
   }
 }

 /**
  * Callback functions.
  */

 page.callbacks = [];

 /**
  * Get or set basepath to `path`.
  *
  * @param {String} path
  * @api public
  */

 page.base = function(path){
   if (0 == arguments.length) return base;
   base = path;
 };

 /**
  * Bind with the given `options`.
  *
  * Options:
  *
  *    - `click` bind to click events [true]
  *    - `popstate` bind to popstate [true]
  *    - `dispatch` perform initial dispatch [true]
  *
  * @param {Object} options
  * @api public
  */

 page.start = function(options){
   options = options || {};
   if (running) return;
   running = true;
   if (false === options.dispatch) dispatch = false;

   // @Talia added: IE8 fix / IE8 Polyfill
   // reference https://github.com/visionmedia/page.js/pull/48/files
   if (false !== options.popstate) addEvent(window, 'popstate', onpopstate);
   if (false !== options.click) addEvent(document, 'click', onclick);
   // if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
   // if (false !== options.click) window.addEventListener('click', onclick, false);



   // @Talia added: IE8 fix / Hasbang (NEEDED?)
   // https://github.com/visionmedia/page.js/pull/86/files
   if (true === options.hashbang) hashbang = true;


   if (!dispatch) return;

   // @Talia added: IE8 fix / Hasbang (NEEDED?)
   // https://github.com/visionmedia/page.js/pull/86/files
   // if (hashbang && location.hash.indexOf('#!') === 0)
   //   var url = location.hash.substr(2) + location.search;
   // else
   //   var url = location.pathname + location.search + location.hash;
   var url = location.pathname + location.search + location.hash;


   page.replace(url, null, true, dispatch);
 };

 /**
  * Unbind click and popstate event handlers.
  *
  * @api public
  */

 page.stop = function(){
   running = false;
   // @Talia added: IE8 fix / IE8 Polyfill
   // reference https://github.com/visionmedia/page.js/pull/48/files
   removeEvent(document, 'click', onclick);
   removeEvent(window, 'popstate', onpopstate);
   // removeEventListener('click', onclick, false);
   // removeEventListener('popstate', onpopstate, false);

 };

 /**
  * Show `path` with optional `state` object.
  *
  * @param {String} path
  * @param {Object} state
  * @param {Boolean} dispatch
  * @return {Context}
  * @api public
  */

 page.show = function(path, state, dispatch){
   var ctx = new Context(path, state);
   if (false !== dispatch) page.dispatch(ctx);
   if (!ctx.unhandled) ctx.pushState();
   return ctx;
 };

 /**
  * Replace `path` with optional `state` object.
  *
  * @param {String} path
  * @param {Object} state
  * @return {Context}
  * @api public
  */

 page.replace = function(path, state, init, dispatch){
   var ctx = new Context(path, state);
   ctx.init = init;
   if (null == dispatch) dispatch = true;
   if (dispatch) page.dispatch(ctx);
   ctx.save();
   return ctx;
 };

 /**
  * Dispatch the given `ctx`.
  *
  * @param {Object} ctx
  * @api private
  */

 page.dispatch = function(ctx){
   var i = 0;

   function next() {
     var fn = page.callbacks[i++];
     if (!fn) return unhandled(ctx);
     fn(ctx, next);
   }

   next();
 };

 /**
  * Unhandled `ctx`. When it's not the initial
  * popstate then redirect. If you wish to handle
  * 404s on your own use `page('*', callback)`.
  *
  * @param {Context} ctx
  * @api private
  */

 function unhandled(ctx) {
   // @Talia note: this is for undefined routes
   // @Talia added: IE8 fix / History polyfill
   // https://github.com/visionmedia/page.js/pull/48/files
   // var current = window.location.pathname + window.location.search;
   var current = location.pathname + location.search;
   if (current == ctx.canonicalPath) return;
   page.stop();
   ctx.unhandled = true;
   // @Talia added: IE8 fix / History polyfill
   // https://github.com/visionmedia/page.js/pull/48/files
   // window.location = ctx.canonicalPath;
   location = ctx.canonicalPath;
 }

 /**
  * Initialize a new "request" `Context`
  * with the given `path` and optional initial `state`.
  *
  * @param {String} path
  * @param {Object} state
  * @api public
  */

 function Context(path, state) {
   if ('/' == path[0] && 0 != path.indexOf(base)) path = base + path;
   var i = path.indexOf('?');

   this.canonicalPath = path;
   this.path = path.replace(base, '') || '/';

   this.title = document.title;
   this.state = state || {};
   this.state.path = path;
   this.querystring = ~i ? path.slice(i + 1) : '';
   this.pathname = ~i ? path.slice(0, i) : path;
   this.params = [];

   // fragment
   this.hash = '';
   if (!~this.path.indexOf('#')) return;
   var parts = this.path.split('#');
   this.path = parts[0];
   this.hash = parts[1] || '';
   this.querystring = this.querystring.split('#')[0];
   // console.log( this );
 }

 /**
  * Expose `Context`.
  */

 page.Context = Context;

 /**
  * Push state.
  *
  * @api private
  */

 Context.prototype.pushState = function(){
   history.pushState(this.state, this.title, this.canonicalPath);
   // @Talia added: IE8 fix / Hasbang (NEEDED? COMMENTED OUT BELOW, STILL USING DEFAULT)
   // https://github.com/visionmedia/page.js/pull/86/files
   // history.pushState(this.state, this.title, (hashbang ? '#!'+this.canonicalPath : this.canonicalPath));
 };

 /**
  * Save the context state.
  *
  * @api public
  */

 Context.prototype.save = function(){
   history.replaceState(this.state, this.title, this.canonicalPath);
   // @Talia added: IE8 fix / Hasbang (NEEDED? COMMENTED OUT BELOW, STILL USING DEFAULT)
   // https://github.com/visionmedia/page.js/pull/86/files
   // history.replaceState(this.state, this.title, (hashbang ? '#!'+this.canonicalPath : this.canonicalPath));
 };

 /**
  * Initialize `Route` with the given HTTP `path`,
  * and an array of `callbacks` and `options`.
  *
  * Options:
  *
  *   - `sensitive`    enable case-sensitive routes
  *   - `strict`       enable strict matching for trailing slashes
  *
  * @param {String} path
  * @param {Object} options.
  * @api private
  */

 function Route(path, options) {
   options = options || {};
   this.path = (path === '*') ? '(.*)' : path;
   this.method = 'GET';
   this.regexp = pathtoRegexp(this.path
     , this.keys = []
     , options.sensitive
     , options.strict);
 }

 /**
  * Expose `Route`.
  */

 page.Route = Route;

 /**
  * Return route middleware with
  * the given callback `fn()`.
  *
  * @param {Function} fn
  * @return {Function}
  * @api public
  */

 Route.prototype.middleware = function(fn){
   var self = this;
   return function(ctx, next){
     if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
     next();
   };
 };

 /**
  * Check if this route matches `path`, if so
  * populate `params`.
  *
  * @param {String} path
  * @param {Array} params
  * @return {Boolean}
  * @api private
  */

 Route.prototype.match = function(path, params){
   var keys = this.keys
     , qsIndex = path.indexOf('?')
     , pathname = ~qsIndex ? path.slice(0, qsIndex) : path
     , m = this.regexp.exec(decodeURIComponent(pathname));

   if (!m) return false;

   for (var i = 1, len = m.length; i < len; ++i) {
     var key = keys[i - 1];

     var val = 'string' == typeof m[i]
       ? decodeURIComponent(m[i])
       : m[i];

     if (key) {
       params[key.name] = undefined !== params[key.name]
         ? params[key.name]
         : val;
     } else {
       params.push(val);
     }
   }

   return true;
 };

 /**
  * Handle "populate" events.
  */

 function onpopstate(e) {
   if (e.state) {
     var path = e.state.path;
     page.replace(path, e.state);
   }
 }

 /**
  * Handle "click" events.
  */

 function onclick(e) {

   // @Talia added: IE8 fix / History Polyfill
   // https://github.com/visionmedia/page.js/pull/48/files
   if (!which(e)) return;
   // if (1 != which(e)) return;

   if (e.metaKey || e.ctrlKey || e.shiftKey) return;
   if (e.defaultPrevented) return;

   // ensure link
   // @Talia added: IE8 fix / History Polyfill
   // https://github.com/visionmedia/page.js/pull/48/files
   var el = e.target || e.srcElement;
   // var el = e.target;

   while (el && 'A' != el.nodeName) el = el.parentNode;
   if (!el || 'A' != el.nodeName) return;

   // ensure non-hash for the same path
   var link = el.getAttribute('href');

   if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

   // Check for mailto: in the href
   if (link.indexOf("mailto:") > -1) return;

   // check target
   if (el.target) return;

   // x-origin
   if (!sameOrigin(el.href)) return;

   // rebuild path
   var path = el.pathname + el.search + (el.hash || '');
   // @Talia added: IE8 fix / History Polyfill
   // https://github.com/visionmedia/page.js/pull/48/files
   // on non-html5 browsers (IE9-), `el.pathname` doesn't include leading '/'
   if (path[0] !== '/') path = '/' + path;


   // same page
   var orig = path + el.hash;

   path = path.replace(base, '');
   if (base && orig == path) return;

   // @Talia added: IE8 fix / History Polyfill
   e.preventDefault ? e.preventDefault() : e.returnValue = false;
   // e.preventDefault();

   page.show(orig);
 }

 /**
  * Event button.
  */

 function which(e) {
   e = e || window.event;
   return null == e.which
   // @Talia added: IE8 fix / History Polyfill
   // https://github.com/visionmedia/page.js/pull/48/files
   // Check on the comparison operators
     ? e.button == 0
     : e.which == 1;
     // ? e.button
     // : e.which;
 }

 /**
  * Check if `href` is the same origin.
  */

 function sameOrigin(href) {
   var origin = location.protocol + '//' + location.hostname;
   if (location.port) origin += ':' + location.port;
   return 0 == href.indexOf(origin);
 }

 // @Talia added: IE8 fix / History Polyfill
 // https://github.com/visionmedia/page.js/pull/48/files
 /**
  * Basic cross browser event code
  */

function addEvent(obj, type, fn) {
  if (obj.addEventListener) {
    obj.addEventListener(type, fn, false);
  } else {
    obj.attachEvent('on' + type, fn);
  }
}

function removeEvent(obj, type, fn) {
  if (obj.removeEventListener) {
    obj.removeEventListener(type, fn, false);
  } else {
    obj.detachEvent('on' + type, fn);
  }
}
},{"path-to-regexp":2}],2:[function(require,module,exports){
/**
 * Expose `pathtoRegexp`.
 */
module.exports = pathtoRegexp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match already escaped characters that would otherwise incorrectly appear
  // in future matches. This allows the user to escape special characters that
  // shouldn't be transformed.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that should always be escaped.
  '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
var attachKeys = function (re, keys) {
  re.keys = keys;

  return re;
};

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array should be passed in, which will contain the placeholder key
 * names. For example `/user/:id` will then contain `["id"]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 keys
 * @param  {Object}                options
 * @return {RegExp}
 */
function pathtoRegexp (path, keys, options) {
  if (keys && !Array.isArray(keys)) {
    options = keys;
    keys = null;
  }

  keys = keys || [];
  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var flags = options.sensitive ? '' : 'i';
  var index = 0;

  if (path instanceof RegExp) {
    // Match all capturing groups of a regexp.
    var groups = path.source.match(/\((?!\?)/g) || [];

    // Map all the matches to their numeric keys and push into the keys.
    keys.push.apply(keys, groups.map(function (match, index) {
      return {
        name:      index,
        delimiter: null,
        optional:  false,
        repeat:    false
      };
    }));

    // Return the source back to the user.
    return attachKeys(path, keys);
  }

  if (Array.isArray(path)) {
    // Map array parts into regexps and return their source. We also pass
    // the same keys and options instance into every generation to get
    // consistent matching groups before we join the sources together.
    path = path.map(function (value) {
      return pathtoRegexp(value, keys, options).source;
    });

    // Generate a new regexp instance by joining all the parts together.
    return attachKeys(new RegExp('(?:' + path.join('|') + ')', flags), keys);
  }

  // Alter the path string into a usable regexp.
  path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
    // Avoiding re-escaping escaped characters.
    if (escaped) {
      return escaped;
    }

    // Escape regexp special characters.
    if (escape) {
      return '\\' + escape;
    }

    var repeat   = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    keys.push({
      name:      key || index++,
      delimiter: prefix || '/',
      optional:  optional,
      repeat:    repeat
    });

    // Escape the prefix character.
    prefix = prefix ? '\\' + prefix : '';

    // Match using the custom capturing group, or fallback to capturing
    // everything up to the next slash (or next period if the param was
    // prefixed with a period).
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    // Allow parameters to be repeated more than once.
    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    // Allow a parameter to be optional.
    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  });

  // Check whether the path ends in a slash as it alters some match behaviour.
  var endsWithSlash = path[path.length - 1] === '/';

  // In non-strict mode we allow an optional trailing slash in the match. If
  // the path to match already ended with a slash, we need to remove it for
  // consistency. The slash is only valid at the very end of a path match, not
  // anywhere in the middle. This is important for non-ending mode, otherwise
  // "/test/" will match "/test//route".
  if (!strict) {
    path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';
  }

  // In non-ending mode, we need prompt the capturing groups to match as much
  // as possible by using a positive lookahead for the end or next path segment.
  if (!end) {
    path += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return attachKeys(new RegExp('^' + path + (end ? '$' : ''), flags), keys);
};

},{}]},{},[1])(1)
});