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