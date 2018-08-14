/*!
 * minicart
 * The Mini Cart is a great way to improve your PayPal shopping cart integration.
 *
 * @version 3.0.6
 * @author Jeff Harrell <https://github.com/jeffharrell/>
 * @url http://www.minicartjs.com/
 * @license MIT <https://github.com/jeffharrell/minicart/raw/master/LICENSE.md>
 */

;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],2:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],3:[function(require,module,exports){
var process=require("__browserify_process");// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
var shims = require('_shims');

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(shims.filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = shims.substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(shims.filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(shims.filter(paths, function(p, index) {
    if (!util.isString(p)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

},{"__browserify_process":8,"_shims":1,"util":4}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":1}],5:[function(require,module,exports){
/*
 * EJS Embedded JavaScript templates
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

'use strict';

/**
 * @file Embedded JavaScript templating engine. {@link http://ejs.co}
 * @author Matthew Eernisse <mde@fleegix.org>
 * @author Tiancheng "Timothy" Gu <timothygu99@gmail.com>
 * @project EJS
 * @license {@link http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0}
 */

/**
 * EJS internal functions.
 *
 * Technically this "module" lies in the same file as {@link module:ejs}, for
 * the sake of organization all the private functions re grouped into this
 * module.
 *
 * @module ejs-internal
 * @private
 */

/**
 * Embedded JavaScript templating engine.
 *
 * @module ejs
 * @public
 */

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

var scopeOptionWarned = false;
var _VERSION_STRING = require('../package.json').version;
var _DEFAULT_DELIMITER = '%';
var _DEFAULT_LOCALS_NAME = 'locals';
var _NAME = 'ejs';
var _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)';
var _OPTS_PASSABLE_WITH_DATA = ['delimiter', 'scope', 'context', 'debug', 'compileDebug',
  'client', '_with', 'rmWhitespace', 'strict', 'filename', 'async'];
// We don't allow 'cache' option to be passed in the data obj for
// the normal `render` call, but this is where Express 2 & 3 put it
// so we make an exception for `renderFile`
var _OPTS_PASSABLE_WITH_DATA_EXPRESS = _OPTS_PASSABLE_WITH_DATA.concat('cache');
var _BOM = /^\uFEFF/;

/**
 * EJS template function cache. This can be a LRU object from lru-cache NPM
 * module. By default, it is {@link module:utils.cache}, a simple in-process
 * cache that grows continuously.
 *
 * @type {Cache}
 */

exports.cache = utils.cache;

/**
 * Custom file loader. Useful for template preprocessing or restricting access
 * to a certain part of the filesystem.
 *
 * @type {fileLoader}
 */

exports.fileLoader = fs.readFileSync;

/**
 * Name of the object containing the locals.
 *
 * This variable is overridden by {@link Options}`.localsName` if it is not
 * `undefined`.
 *
 * @type {String}
 * @public
 */

exports.localsName = _DEFAULT_LOCALS_NAME;

/**
 * Promise implementation -- defaults to the native implementation if available
 * This is mostly just for testability
 *
 * @type {Function}
 * @public
 */

exports.promiseImpl = (new Function('return this;'))().Promise;

/**
 * Get the path to the included file from the parent file path and the
 * specified path.
 *
 * @param {String}  name     specified path
 * @param {String}  filename parent file path
 * @param {Boolean} isDir    parent file path whether is directory
 * @return {String}
 */
exports.resolveInclude = function(name, filename, isDir) {
  var dirname = path.dirname;
  var extname = path.extname;
  var resolve = path.resolve;
  var includePath = resolve(isDir ? filename : dirname(filename), name);
  var ext = extname(name);
  if (!ext) {
    includePath += '.ejs';
  }
  return includePath;
};

/**
 * Get the path to the included file by Options
 *
 * @param  {String}  path    specified path
 * @param  {Options} options compilation options
 * @return {String}
 */
function getIncludePath(path, options) {
  var includePath;
  var filePath;
  var views = options.views;

  // Abs path
  if (path.charAt(0) == '/') {
    includePath = exports.resolveInclude(path.replace(/^\/*/,''), options.root || '/', true);
  }
  // Relative paths
  else {
    // Look relative to a passed filename first
    if (options.filename) {
      filePath = exports.resolveInclude(path, options.filename);
      if (fs.existsSync(filePath)) {
        includePath = filePath;
      }
    }
    // Then look in any views directories
    if (!includePath) {
      if (Array.isArray(views) && views.some(function (v) {
        filePath = exports.resolveInclude(path, v, true);
        return fs.existsSync(filePath);
      })) {
        includePath = filePath;
      }
    }
    if (!includePath) {
      throw new Error('Could not find the include file "' +
          options.escapeFunction(path) + '"');
    }
  }
  return includePath;
}

/**
 * Get the template from a string or a file, either compiled on-the-fly or
 * read from cache (if enabled), and cache the template if needed.
 *
 * If `template` is not set, the file specified in `options.filename` will be
 * read.
 *
 * If `options.cache` is true, this function reads the file from
 * `options.filename` so it must be set prior to calling this function.
 *
 * @memberof module:ejs-internal
 * @param {Options} options   compilation options
 * @param {String} [template] template source
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `options.client`, either type might be returned.
 * @static
 */

function handleCache(options, template) {
  var func;
  var filename = options.filename;
  var hasTemplate = arguments.length > 1;

  if (options.cache) {
    if (!filename) {
      throw new Error('cache option requires a filename');
    }
    func = exports.cache.get(filename);
    if (func) {
      return func;
    }
    if (!hasTemplate) {
      template = fileLoader(filename).toString().replace(_BOM, '');
    }
  }
  else if (!hasTemplate) {
    // istanbul ignore if: should not happen at all
    if (!filename) {
      throw new Error('Internal EJS error: no file name or template '
                    + 'provided');
    }
    template = fileLoader(filename).toString().replace(_BOM, '');
  }
  func = exports.compile(template, options);
  if (options.cache) {
    exports.cache.set(filename, func);
  }
  return func;
}

/**
 * Try calling handleCache with the given options and data and call the
 * callback with the result. If an error occurs, call the callback with
 * the error. Used by renderFile().
 *
 * @memberof module:ejs-internal
 * @param {Options} options    compilation options
 * @param {Object} data        template data
 * @param {RenderFileCallback} cb callback
 * @static
 */

function tryHandleCache(options, data, cb) {
  var result;
  if (!cb) {
    if (typeof exports.promiseImpl == 'function') {
      return new exports.promiseImpl(function (resolve, reject) {
        try {
          result = handleCache(options)(data);
          resolve(result);
        }
        catch (err) {
          reject(err);
        }
      });
    }
    else {
      throw new Error('Please provide a callback function');
    }
  }
  else {
    try {
      result = handleCache(options)(data);
    }
    catch (err) {
      return cb(err);
    }

    cb(null, result);
  }
}

/**
 * fileLoader is independent
 *
 * @param {String} filePath ejs file path.
 * @return {String} The contents of the specified file.
 * @static
 */

function fileLoader(filePath){
  return exports.fileLoader(filePath);
}

/**
 * Get the template function.
 *
 * If `options.cache` is `true`, then the template is cached.
 *
 * @memberof module:ejs-internal
 * @param {String}  path    path for the specified file
 * @param {Options} options compilation options
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `options.client`, either type might be returned
 * @static
 */

function includeFile(path, options) {
  var opts = utils.shallowCopy({}, options);
  opts.filename = getIncludePath(path, opts);
  return handleCache(opts);
}

/**
 * Get the JavaScript source of an included file.
 *
 * @memberof module:ejs-internal
 * @param {String}  path    path for the specified file
 * @param {Options} options compilation options
 * @return {Object}
 * @static
 */

function includeSource(path, options) {
  var opts = utils.shallowCopy({}, options);
  var includePath;
  var template;
  includePath = getIncludePath(path, opts);
  template = fileLoader(includePath).toString().replace(_BOM, '');
  opts.filename = includePath;
  var templ = new Template(template, opts);
  templ.generateSource();
  return {
    source: templ.source,
    filename: includePath,
    template: template
  };
}

/**
 * Re-throw the given `err` in context to the `str` of ejs, `filename`, and
 * `lineno`.
 *
 * @implements RethrowCallback
 * @memberof module:ejs-internal
 * @param {Error}  err      Error object
 * @param {String} str      EJS source
 * @param {String} filename file name of the EJS file
 * @param {String} lineno   line number of the error
 * @static
 */

function rethrow(err, str, flnm, lineno, esc){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  var filename = esc(flnm); // eslint-disable-line
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
}

function stripSemi(str){
  return str.replace(/;(\s*$)/, '$1');
}

/**
 * Compile the given `str` of ejs into a template function.
 *
 * @param {String}  template EJS template
 *
 * @param {Options} opts     compilation options
 *
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `opts.client`, either type might be returned.
 * Note that the return type of the function also depends on the value of `opts.async`.
 * @public
 */

exports.compile = function compile(template, opts) {
  var templ;

  // v1 compat
  // 'scope' is 'context'
  // FIXME: Remove this in a future version
  if (opts && opts.scope) {
    if (!scopeOptionWarned){
      console.warn('`scope` option is deprecated and will be removed in EJS 3');
      scopeOptionWarned = true;
    }
    if (!opts.context) {
      opts.context = opts.scope;
    }
    delete opts.scope;
  }
  templ = new Template(template, opts);
  return templ.compile();
};

/**
 * Render the given `template` of ejs.
 *
 * If you would like to include options but not data, you need to explicitly
 * call this function with `data` being an empty object or `null`.
 *
 * @param {String}   template EJS template
 * @param {Object}  [data={}] template data
 * @param {Options} [opts={}] compilation and rendering options
 * @return {(String|Promise<String>)}
 * Return value type depends on `opts.async`.
 * @public
 */

exports.render = function (template, d, o) {
  var data = d || {};
  var opts = o || {};

  // No options object -- if there are optiony names
  // in the data, copy them to options
  if (arguments.length == 2) {
    utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA);
  }

  return handleCache(opts, template)(data);
};

/**
 * Render an EJS file at the given `path` and callback `cb(err, str)`.
 *
 * If you would like to include options but not data, you need to explicitly
 * call this function with `data` being an empty object or `null`.
 *
 * @param {String}             path     path to the EJS file
 * @param {Object}            [data={}] template data
 * @param {Options}           [opts={}] compilation and rendering options
 * @param {RenderFileCallback} cb callback
 * @public
 */

exports.renderFile = function () {
  var args = Array.prototype.slice.call(arguments);
  var filename = args.shift();
  var cb;
  var opts = {filename: filename};
  var data;
  var viewOpts;

  // Do we have a callback?
  if (typeof arguments[arguments.length - 1] == 'function') {
    cb = args.pop();
  }
  // Do we have data/opts?
  if (args.length) {
    // Should always have data obj
    data = args.shift();
    // Normal passed opts (data obj + opts obj)
    if (args.length) {
      // Use shallowCopy so we don't pollute passed in opts obj with new vals
      utils.shallowCopy(opts, args.pop());
    }
    // Special casing for Express (settings + opts-in-data)
    else {
      // Express 3 and 4
      if (data.settings) {
        // Pull a few things from known locations
        if (data.settings.views) {
          opts.views = data.settings.views;
        }
        if (data.settings['view cache']) {
          opts.cache = true;
        }
        // Undocumented after Express 2, but still usable, esp. for
        // items that are unsafe to be passed along with data, like `root`
        viewOpts = data.settings['view options'];
        if (viewOpts) {
          utils.shallowCopy(opts, viewOpts);
        }
      }
      // Express 2 and lower, values set in app.locals, or people who just
      // want to pass options in their data. NOTE: These values will override
      // anything previously set in settings  or settings['view options']
      utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
    }
    opts.filename = filename;
  }
  else {
    data = {};
  }

  return tryHandleCache(opts, data, cb);
};

/**
 * Clear intermediate JavaScript cache. Calls {@link Cache#reset}.
 * @public
 */

exports.clearCache = function () {
  exports.cache.reset();
};

function Template(text, opts) {
  opts = opts || {};
  var options = {};
  this.templateText = text;
  this.mode = null;
  this.truncate = false;
  this.currentLine = 1;
  this.source = '';
  this.dependencies = [];
  options.client = opts.client || false;
  options.escapeFunction = opts.escape || utils.escapeXML;
  options.compileDebug = opts.compileDebug !== false;
  options.debug = !!opts.debug;
  options.filename = opts.filename;
  options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER;
  options.strict = opts.strict || false;
  options.context = opts.context;
  options.cache = opts.cache || false;
  options.rmWhitespace = opts.rmWhitespace;
  options.root = opts.root;
  options.outputFunctionName = opts.outputFunctionName;
  options.localsName = opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME;
  options.views = opts.views;
  options.async = opts.async;

  if (options.strict) {
    options._with = false;
  }
  else {
    options._with = typeof opts._with != 'undefined' ? opts._with : true;
  }

  this.opts = options;

  this.regex = this.createRegex();
}

Template.modes = {
  EVAL: 'eval',
  ESCAPED: 'escaped',
  RAW: 'raw',
  COMMENT: 'comment',
  LITERAL: 'literal'
};

Template.prototype = {
  createRegex: function () {
    var str = _REGEX_STRING;
    var delim = utils.escapeRegExpChars(this.opts.delimiter);
    str = str.replace(/%/g, delim);
    return new RegExp(str);
  },

  compile: function () {
    var src;
    var fn;
    var opts = this.opts;
    var prepended = '';
    var appended = '';
    var escapeFn = opts.escapeFunction;
    var asyncCtor;

    if (!this.source) {
      this.generateSource();
      prepended += '  var __output = [], __append = __output.push.bind(__output);' + '\n';
      if (opts.outputFunctionName) {
        prepended += '  var ' + opts.outputFunctionName + ' = __append;' + '\n';
      }
      if (opts._with !== false) {
        prepended +=  '  with (' + opts.localsName + ' || {}) {' + '\n';
        appended += '  }' + '\n';
      }
      appended += '  return __output.join("");' + '\n';
      this.source = prepended + this.source + appended;
    }

    if (opts.compileDebug) {
      src = 'var __line = 1' + '\n'
        + '  , __lines = ' + JSON.stringify(this.templateText) + '\n'
        + '  , __filename = ' + (opts.filename ?
        JSON.stringify(opts.filename) : 'undefined') + ';' + '\n'
        + 'try {' + '\n'
        + this.source
        + '} catch (e) {' + '\n'
        + '  rethrow(e, __lines, __filename, __line, escapeFn);' + '\n'
        + '}' + '\n';
    }
    else {
      src = this.source;
    }

    if (opts.client) {
      src = 'escapeFn = escapeFn || ' + escapeFn.toString() + ';' + '\n' + src;
      if (opts.compileDebug) {
        src = 'rethrow = rethrow || ' + rethrow.toString() + ';' + '\n' + src;
      }
    }

    if (opts.strict) {
      src = '"use strict";\n' + src;
    }
    if (opts.debug) {
      console.log(src);
    }

    try {
      if (opts.async) {
        // Have to use generated function for this, since in envs without support,
        // it breaks in parsing
        try {
          asyncCtor = (new Function('return (async function(){}).constructor;'))();
        }
        catch(e) {
          if (e instanceof SyntaxError) {
            throw new Error('This environment does not support async/await');
          }
          else {
            throw e;
          }
        }
      }
      else {
        asyncCtor = Function;
      }
      fn = new asyncCtor(opts.localsName + ', escapeFn, include, rethrow', src);
    }
    catch(e) {
      // istanbul ignore else
      if (e instanceof SyntaxError) {
        if (opts.filename) {
          e.message += ' in ' + opts.filename;
        }
        e.message += ' while compiling ejs\n\n';
        e.message += 'If the above error is not helpful, you may want to try EJS-Lint:\n';
        e.message += 'https://github.com/RyanZim/EJS-Lint';
        if (!e.async) {
          e.message += '\n';
          e.message += 'Or, if you meant to create an async function, pass async: true as an option.';
        }
      }
      throw e;
    }

    if (opts.client) {
      fn.dependencies = this.dependencies;
      return fn;
    }

    // Return a callable function which will execute the function
    // created by the source-code, with the passed data as locals
    // Adds a local `include` function which allows full recursive include
    var returnedFn = function (data) {
      var include = function (path, includeData) {
        var d = utils.shallowCopy({}, data);
        if (includeData) {
          d = utils.shallowCopy(d, includeData);
        }
        return includeFile(path, opts)(d);
      };
      return fn.apply(opts.context, [data || {}, escapeFn, include, rethrow]);
    };
    returnedFn.dependencies = this.dependencies;
    return returnedFn;
  },

  generateSource: function () {
    var opts = this.opts;

    if (opts.rmWhitespace) {
      // Have to use two separate replace here as `^` and `$` operators don't
      // work well with `\r`.
      this.templateText =
        this.templateText.replace(/\r/g, '').replace(/^\s+|\s+$/gm, '');
    }

    // Slurp spaces and tabs before <%_ and after _%>
    this.templateText =
      this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');

    var self = this;
    var matches = this.parseTemplateText();
    var d = this.opts.delimiter;

    if (matches && matches.length) {
      matches.forEach(function (line, index) {
        var opening;
        var closing;
        var include;
        var includeOpts;
        var includeObj;
        var includeSrc;
        // If this is an opening tag, check for closing tags
        // FIXME: May end up with some false positives here
        // Better to store modes as k/v with '<' + delimiter as key
        // Then this can simply check against the map
        if ( line.indexOf('<' + d) === 0        // If it is a tag
          && line.indexOf('<' + d + d) !== 0) { // and is not escaped
          closing = matches[index + 2];
          if (!(closing == d + '>' || closing == '-' + d + '>' || closing == '_' + d + '>')) {
            throw new Error('Could not find matching close tag for "' + line + '".');
          }
        }
        // HACK: backward-compat `include` preprocessor directives
        if ((include = line.match(/^\s*include\s+(\S+)/))) {
          opening = matches[index - 1];
          // Must be in EVAL or RAW mode
          if (opening && (opening == '<' + d || opening == '<' + d + '-' || opening == '<' + d + '_')) {
            includeOpts = utils.shallowCopy({}, self.opts);
            includeObj = includeSource(include[1], includeOpts);
            if (self.opts.compileDebug) {
              includeSrc =
                  '    ; (function(){' + '\n'
                  + '      var __line = 1' + '\n'
                  + '      , __lines = ' + JSON.stringify(includeObj.template) + '\n'
                  + '      , __filename = ' + JSON.stringify(includeObj.filename) + ';' + '\n'
                  + '      try {' + '\n'
                  + includeObj.source
                  + '      } catch (e) {' + '\n'
                  + '        rethrow(e, __lines, __filename, __line, escapeFn);' + '\n'
                  + '      }' + '\n'
                  + '    ; }).call(this)' + '\n';
            }else{
              includeSrc = '    ; (function(){' + '\n' + includeObj.source +
                  '    ; }).call(this)' + '\n';
            }
            self.source += includeSrc;
            self.dependencies.push(exports.resolveInclude(include[1],
              includeOpts.filename));
            return;
          }
        }
        self.scanLine(line);
      });
    }

  },

  parseTemplateText: function () {
    var str = this.templateText;
    var pat = this.regex;
    var result = pat.exec(str);
    var arr = [];
    var firstPos;

    while (result) {
      firstPos = result.index;

      if (firstPos !== 0) {
        arr.push(str.substring(0, firstPos));
        str = str.slice(firstPos);
      }

      arr.push(result[0]);
      str = str.slice(result[0].length);
      result = pat.exec(str);
    }

    if (str) {
      arr.push(str);
    }

    return arr;
  },

  _addOutput: function (line) {
    if (this.truncate) {
      // Only replace single leading linebreak in the line after
      // -%> tag -- this is the single, trailing linebreak
      // after the tag that the truncation mode replaces
      // Handle Win / Unix / old Mac linebreaks -- do the \r\n
      // combo first in the regex-or
      line = line.replace(/^(?:\r\n|\r|\n)/, '');
      this.truncate = false;
    }
    else if (this.opts.rmWhitespace) {
      // rmWhitespace has already removed trailing spaces, just need
      // to remove linebreaks
      line = line.replace(/^\n/, '');
    }
    if (!line) {
      return line;
    }

    // Preserve literal slashes
    line = line.replace(/\\/g, '\\\\');

    // Convert linebreaks
    line = line.replace(/\n/g, '\\n');
    line = line.replace(/\r/g, '\\r');

    // Escape double-quotes
    // - this will be the delimiter during execution
    line = line.replace(/"/g, '\\"');
    this.source += '    ; __append("' + line + '")' + '\n';
  },

  scanLine: function (line) {
    var self = this;
    var d = this.opts.delimiter;
    var newLineCount = 0;

    newLineCount = (line.split('\n').length - 1);

    switch (line) {
    case '<' + d:
    case '<' + d + '_':
      this.mode = Template.modes.EVAL;
      break;
    case '<' + d + '=':
      this.mode = Template.modes.ESCAPED;
      break;
    case '<' + d + '-':
      this.mode = Template.modes.RAW;
      break;
    case '<' + d + '#':
      this.mode = Template.modes.COMMENT;
      break;
    case '<' + d + d:
      this.mode = Template.modes.LITERAL;
      this.source += '    ; __append("' + line.replace('<' + d + d, '<' + d) + '")' + '\n';
      break;
    case d + d + '>':
      this.mode = Template.modes.LITERAL;
      this.source += '    ; __append("' + line.replace(d + d + '>', d + '>') + '")' + '\n';
      break;
    case d + '>':
    case '-' + d + '>':
    case '_' + d + '>':
      if (this.mode == Template.modes.LITERAL) {
        this._addOutput(line);
      }

      this.mode = null;
      this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
      break;
    default:
      // In script mode, depends on type of tag
      if (this.mode) {
        // If '//' is found without a line break, add a line break.
        switch (this.mode) {
        case Template.modes.EVAL:
        case Template.modes.ESCAPED:
        case Template.modes.RAW:
          if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
            line += '\n';
          }
        }
        switch (this.mode) {
        // Just executing code
        case Template.modes.EVAL:
          this.source += '    ; ' + line + '\n';
          break;
          // Exec, esc, and output
        case Template.modes.ESCAPED:
          this.source += '    ; __append(escapeFn(' + stripSemi(line) + '))' + '\n';
          break;
          // Exec and output
        case Template.modes.RAW:
          this.source += '    ; __append(' + stripSemi(line) + ')' + '\n';
          break;
        case Template.modes.COMMENT:
          // Do nothing
          break;
          // Literal <%% mode, append as raw output
        case Template.modes.LITERAL:
          this._addOutput(line);
          break;
        }
      }
      // In string mode, just add the output
      else {
        this._addOutput(line);
      }
    }

    if (self.opts.compileDebug && newLineCount) {
      this.currentLine += newLineCount;
      this.source += '    ; __line = ' + this.currentLine + '\n';
    }
  }
};

/**
 * Escape characters reserved in XML.
 *
 * This is simply an export of {@link module:utils.escapeXML}.
 *
 * If `markup` is `undefined` or `null`, the empty string is returned.
 *
 * @param {String} markup Input string
 * @return {String} Escaped string
 * @public
 * @func
 * */
exports.escapeXML = utils.escapeXML;

/**
 * Express.js support.
 *
 * This is an alias for {@link module:ejs.renderFile}, in order to support
 * Express.js out-of-the-box.
 *
 * @func
 */

exports.__express = exports.renderFile;

// Add require support
/* istanbul ignore else */
if (require.extensions) {
  require.extensions['.ejs'] = function (module, flnm) {
    var filename = flnm || /* istanbul ignore next */ module.filename;
    var options = {
      filename: filename,
      client: true
    };
    var template = fileLoader(filename).toString();
    var fn = exports.compile(template, options);
    module._compile('module.exports = ' + fn.toString() + ';', filename);
  };
}

/**
 * Version of EJS.
 *
 * @readonly
 * @type {String}
 * @public
 */

exports.VERSION = _VERSION_STRING;

/**
 * Name for detection of EJS.
 *
 * @readonly
 * @type {String}
 * @public
 */

exports.name = _NAME;

/* istanbul ignore if */
if (typeof window != 'undefined') {
  window.ejs = exports;
}

},{"../package.json":7,"./utils":6,"fs":2,"path":3}],6:[function(require,module,exports){
/*
 * EJS Embedded JavaScript templates
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

/**
 * Private utility functions
 * @module utils
 * @private
 */

'use strict';

var regExpChars = /[|\\{}()[\]^$+*?.]/g;

/**
 * Escape characters reserved in regular expressions.
 *
 * If `string` is `undefined` or `null`, the empty string is returned.
 *
 * @param {String} string Input string
 * @return {String} Escaped string
 * @static
 * @private
 */
exports.escapeRegExpChars = function (string) {
  // istanbul ignore if
  if (!string) {
    return '';
  }
  return String(string).replace(regExpChars, '\\$&');
};

var _ENCODE_HTML_RULES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&#34;',
  "'": '&#39;'
};
var _MATCH_HTML = /[&<>'"]/g;

function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
}

/**
 * Stringified version of constants used by {@link module:utils.escapeXML}.
 *
 * It is used in the process of generating {@link ClientFunction}s.
 *
 * @readonly
 * @type {String}
 */

var escapeFuncStr =
  'var _ENCODE_HTML_RULES = {\n'
+ '      "&": "&amp;"\n'
+ '    , "<": "&lt;"\n'
+ '    , ">": "&gt;"\n'
+ '    , \'"\': "&#34;"\n'
+ '    , "\'": "&#39;"\n'
+ '    }\n'
+ '  , _MATCH_HTML = /[&<>\'"]/g;\n'
+ 'function encode_char(c) {\n'
+ '  return _ENCODE_HTML_RULES[c] || c;\n'
+ '};\n';

/**
 * Escape characters reserved in XML.
 *
 * If `markup` is `undefined` or `null`, the empty string is returned.
 *
 * @implements {EscapeCallback}
 * @param {String} markup Input string
 * @return {String} Escaped string
 * @static
 * @private
 */

exports.escapeXML = function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
      .replace(_MATCH_HTML, encode_char);
};
exports.escapeXML.toString = function () {
  return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr;
};

/**
 * Naive copy of properties from one object to another.
 * Does not recurse into non-scalar properties
 * Does not check to see if the property has a value before copying
 *
 * @param  {Object} to   Destination object
 * @param  {Object} from Source object
 * @return {Object}      Destination object
 * @static
 * @private
 */
exports.shallowCopy = function (to, from) {
  from = from || {};
  for (var p in from) {
    to[p] = from[p];
  }
  return to;
};

/**
 * Naive copy of a list of key names, from one object to another.
 * Only copies property if it is actually defined
 * Does not recurse into non-scalar properties
 *
 * @param  {Object} to   Destination object
 * @param  {Object} from Source object
 * @param  {Array} list List of properties to copy
 * @return {Object}      Destination object
 * @static
 * @private
 */
exports.shallowCopyFromList = function (to, from, list) {
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    if (typeof from[p] != 'undefined') {
      to[p] = from[p];
    }
  }
  return to;
};

/**
 * Simple in-process cache implementation. Does not implement limits of any
 * sort.
 *
 * @implements Cache
 * @static
 * @private
 */
exports.cache = {
  _data: {},
  set: function (key, val) {
    this._data[key] = val;
  },
  get: function (key) {
    return this._data[key];
  },
  reset: function () {
    this._data = {};
  }
};

},{}],7:[function(require,module,exports){
module.exports={
  "_from": "ejs@^2.5.5",
  "_id": "ejs@2.6.1",
  "_inBundle": false,
  "_integrity": "sha512-0xy4A/twfrRCnkhfk8ErDi5DqdAsAqeGxht4xkCUrsvhhbQNs7E+4jV0CN7+NKIY0aHE72+XvqtBIXzD31ZbXQ==",
  "_location": "/ejs",
  "_phantomChildren": {},
  "_requested": {
    "type": "range",
    "registry": true,
    "raw": "ejs@^2.5.5",
    "name": "ejs",
    "escapedName": "ejs",
    "rawSpec": "^2.5.5",
    "saveSpec": null,
    "fetchSpec": "^2.5.5"
  },
  "_requiredBy": [
    "/"
  ],
  "_resolved": "https://registry.npmjs.org/ejs/-/ejs-2.6.1.tgz",
  "_shasum": "498ec0d495655abc6f23cd61868d926464071aa0",
  "_spec": "ejs@^2.5.5",
  "_where": "/Volumes/Second512SSD/minicart/minicart-restaurant",
  "author": {
    "name": "Matthew Eernisse",
    "email": "mde@fleegix.org",
    "url": "http://fleegix.org"
  },
  "bugs": {
    "url": "https://github.com/mde/ejs/issues"
  },
  "bundleDependencies": false,
  "contributors": [
    {
      "name": "Timothy Gu",
      "email": "timothygu99@gmail.com",
      "url": "https://timothygu.github.io"
    }
  ],
  "dependencies": {},
  "deprecated": false,
  "description": "Embedded JavaScript templates",
  "devDependencies": {
    "browserify": "^13.1.1",
    "eslint": "^4.14.0",
    "git-directory-deploy": "^1.5.1",
    "istanbul": "~0.4.3",
    "jake": "^8.0.16",
    "jsdoc": "^3.4.0",
    "lru-cache": "^4.0.1",
    "mocha": "^5.0.5",
    "uglify-js": "^3.3.16"
  },
  "engines": {
    "node": ">=0.10.0"
  },
  "homepage": "https://github.com/mde/ejs",
  "keywords": [
    "template",
    "engine",
    "ejs"
  ],
  "license": "Apache-2.0",
  "main": "./lib/ejs.js",
  "name": "ejs",
  "repository": {
    "type": "git",
    "url": "git://github.com/mde/ejs.git"
  },
  "scripts": {
    "coverage": "istanbul cover node_modules/mocha/bin/_mocha",
    "devdoc": "jake doc[dev]",
    "doc": "jake doc",
    "lint": "eslint \"**/*.js\" Jakefile",
    "test": "jake test"
  },
  "version": "2.6.1"
}

},{}],8:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],9:[function(require,module,exports){
'use strict';


var Product = require('./product'),
    Pubsub = require('./util/pubsub'),
    Storage = require('./util/storage'),
    constants = require('./constants'),
    currency = require('./util/currency'),
    mixin = require('./util/mixin');



/**
 * Renders the Mini Cart to the page's DOM.
 *
 * @constructor
 * @param {string} name Name of the cart (used as a key for storage)
 * @param {duration} number Time in milliseconds that the cart data should persist
 */
function Cart(name, duration) {
    var data, items, settings, len, i;

    this._items = [];
    this._settings = { bn: constants.BN };

    Pubsub.call(this);
    Storage.call(this, name, duration);

    if ((data = this.load())) {
        items = data.items;
        settings = data.settings;

        if (settings) {
            this._settings = settings;
        }

        if (items) {
            for (i = 0, len = items.length; i < len; i++) {
                this.add(items[i]);
            }
        }
    }
}


mixin(Cart.prototype, Pubsub.prototype);
mixin(Cart.prototype, Storage.prototype);


/**
 * Adds an item to the cart. This fires an "add" event.
 *
 * @param {object} data Item data
 * @return {number} Item location in the cart
 */
Cart.prototype.add = function add(data) {
    var that = this,
        items = this.items(),
        idx = false,
        isExisting = false,
        product, key, len, i;

    // Prune cart settings data from the product
    for (key in data) {
        if (constants.SETTINGS.test(key)) {
            this._settings[key] = data[key];
            delete data[key];
        }
    }

    // Look to see if the same product has already been added
    for (i = 0, len = items.length; i < len; i++) {
        if (items[i].isEqual(data)) {
            product = items[i];
            product.set('quantity', product.get('quantity') + (parseInt(data.quantity, 10) || 1));
            idx = i;
            isExisting = true;
            break;
        }
    }

    // If not, then try to add it
    if (!product) {
        product = new Product(data);

        if (product.isValid()) {
            idx = (this._items.push(product) - 1);

            product.on('change', function (key, value) {
                that.save();
                that.fire('change', idx, key, value);
            });

            this.save();
        }
    }

    if (product) {
        this.fire('add', idx, product, isExisting);
    }

    return idx;
};


/**
 * Returns the carts current items.
 *
 * @param {number} idx (Optional) Returns only that item.
 * @return {array|object}
 */
Cart.prototype.items = function get(idx) {
    return (typeof idx === 'number') ? this._items[idx] : this._items;
};


/**
 * Returns the carts current settings.
 *
 * @param {string} name (Optional) Returns only that setting.
 * @return {array|string}
 */
Cart.prototype.settings = function settings(name) {
    return (name) ? this._settings[name] : this._settings;
};


/**
 * Returns the cart discount.
 *
 * @param {object} config (Optional) Currency formatting options.
 * @return {number|string}
 */
Cart.prototype.discount = function discount(config) {
    var result = parseFloat(this.settings('discount_amount_cart')) || 0;

    if (!result) {
        result = (parseFloat(this.settings('discount_rate_cart')) || 0) * this.subtotal() / 100;
    }

    config = config || {};
    config.currency = this.settings('currency_code');

    return currency(result, config);
};


/**
 * Returns the cart total without discounts.
 *
 * @param {object} config (Optional) Currency formatting options.
 * @return {number|string}
 */
Cart.prototype.subtotal = function subtotal(config) {
    var products = this.items(),
        result = 0,
        i, len;

    for (i = 0, len = products.length; i < len; i++) {
        result += products[i].total();
    }

    config = config || {};
    config.currency = this.settings('currency_code');

    return currency(result, config);
};


/**
 * Returns the cart total.
 *
 * @param {object} config (Optional) Currency formatting options.
 * @return {number|string}
 */
Cart.prototype.total = function total(config) {
    var result = 0;

    result += this.subtotal();
    result -= this.discount();

    config = config || {};
    config.currency = this.settings('currency_code');

    return currency(result, config);
};


/**
 * Remove an item from the cart. This fires a "remove" event.
 *
 * @param {number} idx Item index to remove.
 * @return {boolean}
 */
Cart.prototype.remove = function remove(idx) {
    var item = this._items.splice(idx, 1);

    if (this._items.length === 0) {
        this.destroy();
    }

    if (item) {
        this.save();
        this.fire('remove', idx, item[0]);
    }

    return !!item.length;
};


/**
 * Saves the cart data.
 */
Cart.prototype.save = function save() {
    var items = this.items(),
        settings = this.settings(),
        data = [],
        i, len;

    for (i = 0, len = items.length; i < len; i++) {
        data.push(items[i].get());
    }

    Storage.prototype.save.call(this, {
        items: data,
        settings: settings
    });
};


/**
 * Proxies the checkout event
 * The assumption is the view triggers this and consumers subscribe to it
 *
 * @param {object} The initiating event
 */
Cart.prototype.checkout = function checkout(evt) {
    this.fire('checkout', evt);
};


/**
 * Destroy the cart data. This fires a "destroy" event.
 */
Cart.prototype.destroy = function destroy() {
    Storage.prototype.destroy.call(this);

    this._items = [];
    this._settings = { bn: constants.BN };

    this.fire('destroy');
};




module.exports = Cart;

},{"./constants":11,"./product":14,"./util/currency":16,"./util/mixin":19,"./util/pubsub":20,"./util/storage":21}],10:[function(require,module,exports){
'use strict';


var mixin = require('./util/mixin');


var defaults = module.exports = {

    name: 'PPMiniCart',

    parent: (typeof document !== 'undefined') ? document.body : null,

    action: 'https://www.paypal.com/cgi-bin/webscr',

    compileDebug: true,
    target: '',

    duration: 30,

    template: '<%var items = cart.items();var settings = cart.settings();var hasItems = !!items.length;var priceFormat = { format: true, currency: cart.settings("currency_code") };var totalFormat = { format: true, showCode: true };%><form  id="payment-form" method="post" class="<% if (!hasItems) { %>minicart-empty<% } %>" action="<%= config.action %>" target="<%= config.target %>">    <button type="button" id="minicart-close" class="minicart-closer">&times;</button><div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">  <div class="panel panel-default">    <div class="panel-heading" role="tab" id="headingOne">      <h4 class="panel-title text-justify">        <a data-toggle="collapse" class="btn btn-success minitext" style="color: white;"  data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">	 <%= config.strings.shoppingCart %>        </a>      </h4>    </div>    <div id="collapseOne" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">      <div class="panel-body">    <ul>            <input type="hidden" name="subTotal" value="<%= cart.subtotal() %>" />            <input type="hidden" name="itemNo" value="<%= items.length %>" />        <% for (var i= 0, idx = i + 1, len = items.length; i < len; i++, idx++) { %>        <li class="minicart-item">            <div class="minicart-details-name">                <a class="minicart-name" href="<%= items[i].get("href") %>"><%= items[i].get("item_name") %></a>                <ul class="minicart-attributes">                    <% if (items[i].get("item_number")) { %>                    <li>                        <%= items[i].get("item_number") %>                        <input type="hidden" name="item_number[<%= idx %>]" value="<%= items[i].get("item_number") %>" />                    </li>                    <% } %>                    <% if (items[i].discount()) { %>                    <li>                        <%= config.strings.discount %> <%= items[i].discount(priceFormat) %>                        <input type="hidden" name="discount_amount[<%= idx %>]" value="<%= items[i].discount() %>" />                    </li>                    <% } %>                    <% for (var options = items[i].options(), j = 0, len2 = options.length; j < len2; j++) { %>                        <li>                            <%= options[j].key %>: <%= options[j].value %>                            <input type="hidden" name="on<%= j %>_<%= idx %>" value="<%= options[j].key %>" />                            <input type="hidden" name="os<%= j %>_<%= idx %>" value="<%= options[j].value %>" />                        </li>                    <% } %>                </ul>            </div>            <div class="minicart-details-quantity">                <input class="minicart-quantity" data-minicart-idx="<%= i %>" name="quantity[<%= idx %>]" type="text" pattern="[0-9]*" value="<%= items[i].get("quantity") %>" autocomplete="off" />            </div>            <div class="minicart-details-remove">                <button type="button" class="minicart-remove" data-minicart-idx="<%= i %>">&times;</button>            </div>            <div class="minicart-details-price">                <span class="minicart-price"><%= items[i].total(priceFormat) %></span>            </div>            <input type="hidden" name="item_name[<%= idx %>]" value="<%= items[i].get("item_name") %>" />            <input type="hidden" name="amount[<%= idx %>]" value="<%= items[i].amount() %>" />            <input type="hidden" name="shipping[<%= idx %>]" value="<%= items[i].get("shipping") %>" />            <input type="hidden" name="shipping2[<%= idx %>]" value="<%= items[i].get("shipping2") %>" />        </li>        <% } %>        <li id="form-submit" class="minicart-item" style="text-align: right;">        <% if (hasItems) { %>                <%= config.strings.subtotal %> <%= cart.total(totalFormat) %>        <% } else { %>            <p class="minicart-empty-text"><%= config.strings.empty %></p>        <% } %>    </li>        <li><h4 style="text-align: center;">Special Instructions</h4> <textarea name="extraInstructions" rows="4" cols="35" ></textarea></li>    </ul>      </div>    </div>  </div>  <div class="panel panel-default">    <div class="panel-heading" role="tab" id="headingTwo">      <h4 class="panel-title text-justify">        <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">	<span class="btn btn-danger minitext"><%= config.strings.payAtStore %></span>        </a>      </h4>    </div>    <div id="collapseTwo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">      <div class="panel-body"><table class="table table-condensed">         <tr> <td><label class="minitext"><%= config.strings.phone %></label> </td><td><input type="text" id="phone" name="Phone" size=15 value="" onfocusin="stripe.minicart.myStripe.myfocus(event);" /></td></tr>         <tr> <td><label class="minitext"><%= config.strings.name %></label></td><td><input type="text" id="name" name="name" size=22 value="" onfocusin="stripe.minicart.myStripe.myfocus(event);"  /></td></tr>	<% if (config.userAddressRequired) { %>         <tr> <td><label class="minitext"><%= config.strings.address %></label></td><td><input type="text" id="address_line1" name="address_line1" onfocusin="stripe.minicart.myStripe.myfocus(event);" size=25 value="" /></td></tr>         <tr> <td><label class="minitext"><%= config.strings.city %> </label></td><td><input type="text" id="address_city" name="address_city" onfocusin="stripe.minicart.myStripe.myfocus(event);" size=18 value="" />         &nbsp;&nbsp;&nbsp;<label class="minitext"><%= config.strings.state %> </label>&nbsp;<input type="text" id="address_state" onfocusin="stripe.minicart.myStripe.myfocus(event);" name="address_state" size="2" value="" /> </td></tr>         <tr> <td><label class="minitext"><%= config.strings.zip %> </label></td><td><input type="text" id="address_zip" onfocusin="stripe.minicart.myStripe.myfocus(event);" name="address_zip" size="5" value="" />         &nbsp; &nbsp; &nbsp;         &nbsp;<label class="minitext"><%= config.strings.country %> </label>&nbsp;<input type="text" id="address_country"  name="address_country" onfocusin="stripe.minicart.myStripe.myfocus(event);" size="11" value="" /></td></tr>	<% } %><tr> <td colspan="2">      <div id="payment-message"></div>      <div id="payment-processing">        <% if (hasItems) { %>            <table class="table table-condensed">            <tr><td>            <h5  class="text-warning">                <%= config.strings.subtotal %> <%= cart.total(totalFormat) %> plus tax            </h5>            </td></tr><tr> <td>            <button class="btn btn-info" type="submit" id="submitBtn" data-minicart-alt="<%= config.strings.buttonAlt %>"><%- config.strings.button %></button>            </div>            </td></tr></table>        <% } else { %>            <p class="minicart-empty-text"><%= config.strings.empty %></p>        <% } %>       </div></td></tr></table>      </div>    </div>  </div></div>    <input type="hidden" name="cmd" value="_cart" />    <input type="hidden" name="upload" value="1" />    <% for (var key in settings) { %>        <input type="hidden" name="<%= key %>" value="<%= settings[key] %>" />    <% } %></form>',

    styles: '@keyframes pop-in {    0% { opacity: 0; transform: scale(0.1); }    60% { opacity: 1; transform: scale(1.2); }    100% { transform: scale(1); }}@-webkit-keyframes pop-in {    0% { opacity: 0; -webkit-transform: scale(0.1); }    60% { opacity: 1; -webkit-transform: scale(1.2); }    100% { -webkit-transform: scale(1); }}@-moz-keyframes pop-in {    0% { opacity: 0; -moz-transform: scale(0.1); }    60% { opacity: 1; -moz-transform: scale(1.2); }    100% { -moz-transform: scale(1); }}.minicart-showing #PPMiniCart {    display: block;    transform: translateZ(0);    -webkit-transform: translateZ(0);    -moz-transform: translateZ(0);    animation: pop-in 0.25s;    -webkit-animation: pop-in 0.25s;    -moz-animation: pop-in 0.25s;}.minitext {   font-size: 12px;}#PPMiniCart {    display: none;    position: fixed;    left: 60%;    top: 105px;}#PPMiniCart form {    position: relative;    width: 310px;    max-height: 500px;    margin-left: -190px;    padding: 0px 0px 40px;    background: #fbfbfb;    border: 1px solid #d7d7d7;    border-radius: 4px;    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);    font: 12px/normal arial, helvetica;    color: #333;}#PPMiniCart form.minicart-empty {    padding-bottom: 10px;    font-size: 12px;    font-weight: bold;}#PPMiniCart ul {    clear: both;    float: left;    width: 274px;    margin: 0px 0 10px;    padding: 5px;    list-style-type: none;    background: #fff;    border: 1px solid #ccc;    border-radius: 4px;    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);}#PPMiniCart .minicart-empty ul {    display: none;}#PPMiniCart .minicart-closer {    color: white;    float: right;    margin: 0px 10px 0;    padding: 10px;    background: 0;    border: 0;    font-size: 28px;    cursor: pointer;    font-weight: bold;}#PPMiniCart .minicart-item {    clear: left;    padding: 6px 0;    min-height: 25px;}#PPMiniCart .minicart-item + .minicart-item {    border-top: 1px solid #f2f2f2;}#PPMiniCart .minicart-item a {    color: #333;    text-decoration: none;}#PPMiniCart .minicart-details-name {    float: left;    width: 62%;}#PPMiniCart .minicart-details-quantity {    float: left;    width: 15%;}#PPMiniCart .minicart-details-remove {    float: left;    width: 7%;}#PPMiniCart .minicart-details-price {    float: left;    width: 16%;    text-align: right;}#PPMiniCart .minicart-attributes {    margin: 0;    padding: 0;    background: transparent;    border: 0;    border-radius: 0;    box-shadow: none;    color: #999;    font-size: 12px;    line-height: 22px;}#PPMiniCart .minicart-attributes li {    display: inline;}#PPMiniCart .minicart-attributes li:after {    content: ",";}#PPMiniCart .minicart-attributes li:last-child:after {    content: "";}#PPMiniCart .minicart-quantity {    width: 30px;    height: 18px;    padding: 2px 4px;    border: 1px solid #ccc;    border-radius: 4px;    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);    font-size: 13px;    text-align: right;    transition: border linear 0.2s, box-shadow linear 0.2s;    -webkit-transition: border linear 0.2s, box-shadow linear 0.2s;    -moz-transition: border linear 0.2s, box-shadow linear 0.2s;}#PPMiniCart .minicart-quantity:hover {    border-color: #0078C1;}#PPMiniCart .minicart-quantity:focus {    border-color: #0078C1;    outline: 0;    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 3px rgba(0, 120, 193, 0.4);}#PPMiniCart .minicart-remove {    width: 18px;    height: 19px;    margin: -1px 0 0;    padding: 0;    background: #b7b7b7;    border: 1px solid #a3a3a3;    border-radius: 3px;    color: #fff;    font-size: 18px;    opacity: 0.70;    cursor: pointer;}#PPMiniCart .minicart-remove:hover {    opacity: 1;}#PPMiniCart .minicart-footer {    clear: left;}#PPMiniCart .minicart-subtotal {    position: absolute;    bottom: 17px;    padding-left: 6px;    left: 10px;    font-size: 16px;    font-weight: bold;}#PPMiniCart .minicart-submit {    position: absolute;    bottom: 10px;    right: 10px;    min-width: 123px;    height: 33px;    margin-right: 6px;    padding: 0 9px;    border: 1px solid #ffc727;    border-radius: 5px;    color: #000;    text-shadow: 1px 1px 1px #fff6e9;    cursor: pointer;    background: #ffaa00;    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZjZlOSIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZmFhMDAiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);    background: -moz-linear-gradient(top, #fff6e9 0%, #ffaa00 100%);    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#fff6e9), color-stop(100%,#ffaa00));    background: -webkit-linear-gradient(top, #fff6e9 0%,#ffaa00 100%);    background: -o-linear-gradient(top, #fff6e9 0%,#ffaa00 100%);    background: -ms-linear-gradient(top, #fff6e9 0%,#ffaa00 100%);    background: linear-gradient(to bottom, #fff6e9 0%,#ffaa00 100%);}#PPMiniCart .minicart-submit img {    vertical-align: middle;    padding: 4px 0 0 2px;}#accordion {    margin: 3px;}',

    userInfoRequired: 0,

    userAddressRequired: 0,

    strings: {
	email: 'Email',
	phone: 'Phone',
	name: 'Name',
	address: 'Addr',
	zip: 'Zip',
	country: 'Country',
	card: 'Card',
	expire: 'Expire',
	payment: 'Payment',
	shoppingCart: 'Shopping Cart',
        button: 'Check Out',
        subtotal: 'Subtotal:',
        discount: 'Discount:',
        invalidCarditCardNumber: 'The credit card number appears to be invalid.',
        invalidCVC: 'The CVC number appears to be invalid.',
        invalidExpireDate: 'The expiration date appears to be invalid.',
        paymentProcessing: 'Payment processing. Please wait!',
        pleaseEnter: 'Please enter ',
	doneMsg: 'Finished/Click Me',
        empty: 'Your shopping cart is empty'
    }

};


/**
 * Mixes in the user config with the default config.
 *
 * @param {object} userConfig Configuration overrides
 * @return {object}
 */
module.exports.load = function load(userConfig) {
    return mixin(defaults, userConfig);
};

},{"./util/mixin":19}],11:[function(require,module,exports){
'use strict';


module.exports = {

    COMMANDS: { _cart: true, _xclick: true, _donations: true },

    SETTINGS: /^(?:business|currency_code|lc|paymentaction|no_shipping|cn|no_note|invoice|handling_cart|weight_cart|weight_unit|tax_cart|discount_amount_cart|discount_rate_cart|page_style|image_url|cpp_|cs|cbt|return|cancel_return|notify_url|rm|custom|charset)/,

    BN: 'MiniCart_AddToCart_WPS_US',

    KEYUP_TIMEOUT: 500,

    SHOWING_CLASS: 'minicart-showing',

    REMOVE_CLASS: 'minicart-remove',

    CLOSER_CLASS: 'minicart-closer',

    QUANTITY_CLASS: 'minicart-quantity',

    ITEM_CLASS: 'minicart-item',

    ITEM_CHANGED_CLASS: 'minicart-item-changed',

    SUBMIT_CLASS: 'minicart-submit',

    DATA_IDX: 'data-minicart-idx'

};

},{}],12:[function(require,module,exports){
'use strict';


var Cart = require('./cart'),
    View = require('./view'),
    config = require('./config'),
    myStripe= require('./myStripe'),
    minicart = {},
    cartModel,
    confModel,
    viewModel;


/**
 * Renders the Mini Cart to the page's DOM.
 *
 * @param {object} userConfig Configuration overrides
 */
minicart.render = function (userConfig) {
    confModel = minicart.config = config.load(userConfig);
    cartModel = minicart.cart = new Cart(confModel.name, confModel.duration);
    minicart.myStripe= new myStripe();
    viewModel = minicart.view = new View({
        config: confModel,
        cart: cartModel
    });

    cartModel.on('add', viewModel.addItem, viewModel);
    cartModel.on('change', viewModel.changeItem, viewModel);
    cartModel.on('remove', viewModel.removeItem, viewModel);
    cartModel.on('destroy', viewModel.hide, viewModel);
};


/**
 * Resets the Mini Cart and its view model
 */
minicart.reset = function () {
    cartModel.destroy();

    viewModel.hide();
    viewModel.redraw();
};




// Export to either node or the brower window
if (typeof window === 'undefined') {
    module.exports = minicart;
} else {
    if (!window.stripe) {
        window.stripe = {};
    }

    window.stripe.minicart = minicart;
}
function myfocus(e) {
          if (window.mobilecheck()) {
          e = e || window.event;
          //var target = e.target || e.srcElement;
          //console.log(target.id);
          //console.log(e);
          var top = $('#'+ e.target.id).offset().top;
          var ptop = $('#PPMiniCart').offset().top;
          var adjust = ptop - top + 100;
          //console.log(top);
          //console.log(ptop);
          $('#PPMiniCart').css('top', adjust  + 'px');

          //console.log($('#name').offset());
          //$('#PPMiniCart').css('top','-10px');
          //console.log(e);
          //var offset = $(this).offset();
          //var relativeX = (e.pageX - offset.left);
          //var relativeY = (e.pageY - offset.top);

          //console.log("X: " + relativeX + "  Y: " + relativeY);
          }
}

},{"./cart":9,"./config":10,"./myStripe":13,"./view":23}],13:[function(require,module,exports){
// Created by Larry Ullman, www.larryullman.com, @LarryUllman
// Posted as part of the series "Processing Payments with Stripe"
// http://www.larryullman.com/series/processing-payments-with-stripe/
// Last updated April 14, 2015

// This page is intended to be stored in a public "js" directory.

// This function is just used to display error messages on the page.
// Assumes there's an element with an ID of "payment-errors".

var config = require('./config')

function  myStripe() {}

myStripe.prototype.reportMessage = function reportMessage(msg) {
	// Show the error in the form:
    //alert(msg);
	$('#payment-message').text(msg).addClass('alert alert-warning');
	return false;
};


myStripe.prototype.submit = function submit (evt) {
		// Flag variable:
		var error = false;

		//this.reportMessage('Payment processing. Please wait!');
		this.reportMessage(config.strings.paymentProcessing);
		// Get the values:

		if (config.userAddressRequired) {
        		if ($('#address_zip').val() === "") {
				error = true;
				mymsg = config.strings.pleaseEnter + config.strings.zip;
				this.reportMessage(mymsg)
			}
        		if ($('#address_state').val() === "") {
				error = true;
				mymsg = config.strings.pleaseEnter + config.strings.state;
				this.reportMessage(mymsg)
			}
        		if ($('#address_city').val() === "") {
				error = true;
				mymsg = config.strings.pleaseEnter + config.strings.city;
				this.reportMessage(mymsg)
			}
        		if ($('#address_line1').val() === "") {
				error = true;
				mymsg = config.strings.pleaseEnter + config.strings.address;
				this.reportMessage(mymsg)
			}
		}

        		if ($('#name').val() === "") {
				error = true;
				mymsg = config.strings.pleaseEnter + config.strings.name;
				this.reportMessage(mymsg)
			}
        		if ($('#phone').val() === "") {
				error = true;
				mymsg = config.strings.pleaseEnter + config.strings.phone;
				this.reportMessage(mymsg)
			}
	         if (error) {
			evt.preventDefault();
			console.log('error');
		 } 
		// Validate other form elements, if needed!

},

// Function handles the Stripe response:
myStripe.prototype.stripeResponseHandler =  function stripeResponseHandler(status, response) {

	// Check for an error:
	if (response.error) {

		this.reportMessage(response.error.message);
		
	} else { // No errors, submit the form:
   }

} // End of stripeResponseHandler() function.

myStripe.prototype.myfocus =  function myfocus(e) {
     // use by form input fields onfocusin event
     // Adjust input field to be 150px from absolute top
     // 
     if (this.mobilecheck()) {
	  // only mobile device need to adjust
          e = e || window.event;
          var top = $('#'+ e.target.id).offset().top;
          var ptop = $('#PPMiniCart').offset().top;
          var adjust = ptop - top + 150;
          $('#PPMiniCart').css('top', adjust  + 'px');
     }
}


myStripe.prototype.mobilecheck =  function mobilecheck() {
// check if this is a mobile device
var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = 
true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}


module.exports = myStripe

},{"./config":10}],14:[function(require,module,exports){
'use strict';


var currency = require('./util/currency'),
    Pubsub = require('./util/pubsub'),
    mixin = require('./util/mixin');


var parser = {
    quantity: function (value) {
        value = parseInt(value, 10);

        if (isNaN(value) || !value) {
            value = 1;
        }

        return value;
    },
    amount: function (value) {
        return parseFloat(value) || 0;
    },
    href: function (value) {
        if (value) {
            return value;
        } else {
            return (typeof window !== 'undefined') ? window.location.href : null;
        }
    }
};


/**
 * Creates a new product.
 *
 * @constructor
 * @param {object} data Item data
 */
function Product(data) {
    data.quantity = parser.quantity(data.quantity);
    data.amount = parser.amount(data.amount);
    data.href = parser.href(data.href);

    this._data = data;
    this._options = null;
    this._discount = null;
    this._amount = null;
    this._total = null;

    Pubsub.call(this);
}


mixin(Product.prototype, Pubsub.prototype);


/**
 * Gets the product data.
 *
 * @param {string} key (Optional) A key to restrict the returned data to.
 * @return {array|string}
 */
Product.prototype.get = function get(key) {
    return (key) ? this._data[key] : this._data;
};


/**
 * Sets a value on the product. This is used rather than manually setting the
 * value so that we can fire a "change" event.
 *
 * @param {string} key
 * @param {string} value
 */
Product.prototype.set = function set(key, value) {
    var setter = parser[key];

    this._data[key] = setter ? setter(value) : value;
    this._options = null;
    this._discount = null;
    this._amount = null;
    this._total = null;

    this.fire('change', key);
};


/**
 * Parse and return the options for this product.
 *
 * @return {object}
 */
Product.prototype.options = function options() {
    var result, key, value, amount, i, j;

    if (!this._options) {
        result = [];
        i = 0;

        while ((key = this.get('on' + i))) {
            value = this.get('os' + i);
            amount = 0;
            j = 0;

            while (typeof this.get('option_select' + j) !== 'undefined') {
                if (this.get('option_select' + j) === value) {
                    amount = parser.amount(this.get('option_amount' + j));
                    break;
                }

                j++;
            }

            result.push({
                key: key,
                value: value,
                amount: amount
            });

            i++;
        }

        this._options = result;
    }

    return this._options;
};


/**
 * Parse and return the discount for this product.
 *
 * @param {object} config (Optional) Currency formatting options.
 * @return {number|string}
 */
Product.prototype.discount = function discount(config) {
    var flat, rate, num, limit, result, amount;

    if (!this._discount) {
        result = 0;
        num = parseInt(this.get('discount_num'), 10) || 0;
        limit = Math.max(num, this.get('quantity') - 1);

        if (this.get('discount_amount') !== undefined) {
            flat = parser.amount(this.get('discount_amount'));
            result += flat;
            result += parser.amount(this.get('discount_amount2') || flat) * limit;
        } else if (this.get('discount_rate') !== undefined) {
            rate = parser.amount(this.get('discount_rate'));
            amount = this.amount();

            result += rate * amount / 100;
            result += parser.amount(this.get('discount_rate2') || rate) * amount * limit / 100;
        }

        this._discount = result;
    }

    return currency(this._discount, config);
};


/**
 * Parse and return the total without discounts for this product.
 *
 * @param {object} config (Optional) Currency formatting options.
 * @return {number|string}
 */
Product.prototype.amount = function amount(config) {
    var result, options, len, i;

    if (!this._amount) {
        result = this.get('amount');
        options = this.options();

        for (i = 0, len = options.length; i < len; i++) {
            result += options[i].amount;
        }

        this._amount = result;
    }

    return currency(this._amount, config);
};


/**
 * Parse and return the total for this product.
 *
 * @param {object} config (Optional) Currency formatting options.
 * @return {number|string}
 */
Product.prototype.total = function total(config) {
    var result;

    if (!this._total) {
        result  = this.get('quantity') * this.amount();
        result -= this.discount();

        this._total = parser.amount(result);
    }

    return currency(this._total, config);
};


/**
 * Determine if this product has the same data as another.
 *
 * @param {object|Product} data Other product.
 * @return {boolean}
 */
Product.prototype.isEqual = function isEqual(data) {
    var match = false;

    if (data instanceof Product) {
        data = data._data;
    }

    if (this.get('item_name') === data.item_name) {
        if (this.get('item_number') === data.item_number) {
            if (this.get('amount') === parser.amount(data.amount)) {
                var i = 0;

                match = true;

                while (typeof data['os' + i] !== 'undefined') {
                    if (this.get('os' + i) !== data['os' + i]) {
                        match = false;
                        break;
                    }

                    i++;
                }
            }
        }
    }

    return match;
};


/**
 * Determine if this product is valid.
 *
 * @return {boolean}
 */
Product.prototype.isValid = function isValid() {
    return (this.get('item_name') && this.amount() > 0);
};


/**
 * Destroys this product. Fires a "destroy" event.
 */
Product.prototype.destroy = function destroy() {
    this._data = [];
    this.fire('destroy', this);
};




module.exports = Product;

},{"./util/currency":16,"./util/mixin":19,"./util/pubsub":20}],15:[function(require,module,exports){
/* jshint quotmark:double */


"use strict";



module.exports.add = function add(el, str) {
    var re;

    if (!el) { return false; }

    if (el && el.classList && el.classList.add) {
        el.classList.add(str);
    } else {
        re = new RegExp("\\b" + str + "\\b");

        if (!re.test(el.className)) {
            el.className += " " + str;
        }
    }
};


module.exports.remove = function remove(el, str) {
    var re;

    if (!el) { return false; }

    if (el.classList && el.classList.add) {
        el.classList.remove(str);
    } else {
        re = new RegExp("\\b" + str + "\\b");

        if (re.test(el.className)) {
            el.className = el.className.replace(re, "");
        }
    }
};


module.exports.inject = function inject(el, str) {
    var style;

    if (!el) { return false; }

    if (str) {
        style = document.createElement("style");
        style.type = "text/css";

        if (style.styleSheet) {
            style.styleSheet.cssText = str;
        } else {
            style.appendChild(document.createTextNode(str));
        }

        el.appendChild(style);
    }
};

},{}],16:[function(require,module,exports){
'use strict';


var currencies = {
    AED: { before: '\u062c' },
    ANG: { before: '\u0192' },
    ARS: { before: '$', code: true },
    AUD: { before: '$', code: true },
    AWG: { before: '\u0192' },
    BBD: { before: '$', code: true },
    BGN: { before: '\u043b\u0432' },
    BMD: { before: '$', code: true },
    BND: { before: '$', code: true },
    BRL: { before: 'R$' },
    BSD: { before: '$', code: true },
    CAD: { before: '$', code: true },
    CHF: { before: '', code: true },
    CLP: { before: '$', code: true },
    CNY: { before: '\u00A5' },
    COP: { before: '$', code: true },
    CRC: { before: '\u20A1' },
    CZK: { before: 'Kc' },
    DKK: { before: 'kr' },
    DOP: { before: '$', code: true },
    EEK: { before: 'kr' },
    EUR: { before: '\u20AC' },
    GBP: { before: '\u00A3' },
    GTQ: { before: 'Q' },
    HKD: { before: '$', code: true },
    HRK: { before: 'kn' },
    HUF: { before: 'Ft' },
    IDR: { before: 'Rp' },
    ILS: { before: '\u20AA' },
    INR: { before: 'Rs.' },
    ISK: { before: 'kr' },
    JMD: { before: 'J$' },
    JPY: { before: '\u00A5' },
    KRW: { before: '\u20A9' },
    KYD: { before: '$', code: true },
    LTL: { before: 'Lt' },
    LVL: { before: 'Ls' },
    MXN: { before: '$', code: true },
    MYR: { before: 'RM' },
    NOK: { before: 'kr' },
    NZD: { before: '$', code: true },
    PEN: { before: 'S/' },
    PHP: { before: 'Php' },
    PLN: { before: 'z' },
    QAR: { before: '\ufdfc' },
    RON: { before: 'lei' },
    RUB: { before: '\u0440\u0443\u0431' },
    SAR: { before: '\ufdfc' },
    SEK: { before: 'kr' },
    SGD: { before: '$', code: true },
    THB: { before: '\u0E3F' },
    TRY: { before: 'TL' },
    TTD: { before: 'TT$' },
    TWD: { before: 'NT$' },
    UAH: { before: '\u20b4' },
    USD: { before: '$', code: true },
    UYU: { before: '$U' },
    VEF: { before: 'Bs' },
    VND: { before: '\u20ab' },
    XCD: { before: '$', code: true },
    ZAR: { before: 'R' }
};


module.exports = function currency(amount, config) {
    var code = config && config.currency || 'USD',
        value = currencies[code],
        before = value.before || '',
        after = value.after || '',
        length = value.length || 2,
        showCode = value.code && config && config.showCode,
        result = amount;

    if (config && config.format) {
        result = before + result.toFixed(length) + after;
    }

    if (showCode) {
        result += ' ' + code;
    }

    return result;
};

},{}],17:[function(require,module,exports){
'use strict';


module.exports = (function (window, document) {

    /**
     * Events are added here for easy reference
     */
    var cache = [];

    // NOOP for Node
    if (!document) {
        return {
            add: function () {},
            remove: function () {}
        };
    // Non-IE events
    } else if (document.addEventListener) {
        return {
            /**
             * Add an event to an object and optionally adjust it's scope
             *
             * @param obj {HTMLElement} The object to attach the event to
             * @param type {string} The type of event excluding "on"
             * @param fn {function} The function
             * @param scope {object} Object to adjust the scope to (optional)
             */
            add: function (obj, type, fn, scope) {
                scope = scope || obj;

                var wrappedFn = function (e) { fn.call(scope, e); };

                obj.addEventListener(type, wrappedFn, false);
                cache.push([obj, type, fn, wrappedFn]);
            },


            /**
             * Remove an event from an object
             *
             * @param obj {HTMLElement} The object to remove the event from
             * @param type {string} The type of event excluding "on"
             * @param fn {function} The function
             */
            remove: function (obj, type, fn) {
                var wrappedFn, item, len = cache.length, i;

                for (i = 0; i < len; i++) {
                    item = cache[i];

                    if (item[0] === obj && item[1] === type && item[2] === fn) {
                        wrappedFn = item[3];

                        if (wrappedFn) {
                            obj.removeEventListener(type, wrappedFn, false);
                            cache = cache.slice(i);
                            return true;
                        }
                    }
                }
            }
        };

    // IE events
    } else if (document.attachEvent) {
        return {
            /**
             * Add an event to an object and optionally adjust it's scope (IE)
             *
             * @param obj {HTMLElement} The object to attach the event to
             * @param type {string} The type of event excluding "on"
             * @param fn {function} The function
             * @param scope {object} Object to adjust the scope to (optional)
             */
            add: function (obj, type, fn, scope) {
                scope = scope || obj;

                var wrappedFn = function () {
                    var e = window.event;
                    e.target = e.target || e.srcElement;

                    e.preventDefault = function () {
                        e.returnValue = false;
                    };

                    fn.call(scope, e);
                };

                obj.attachEvent('on' + type, wrappedFn);
                cache.push([obj, type, fn, wrappedFn]);
            },


            /**
             * Remove an event from an object (IE)
             *
             * @param obj {HTMLElement} The object to remove the event from
             * @param type {string} The type of event excluding "on"
             * @param fn {function} The function
             */
            remove: function (obj, type, fn) {
                var wrappedFn, item, len = cache.length, i;

                for (i = 0; i < len; i++) {
                    item = cache[i];

                    if (item[0] === obj && item[1] === type && item[2] === fn) {
                        wrappedFn = item[3];

                        if (wrappedFn) {
                            obj.detachEvent('on' + type, wrappedFn);
                            cache = cache.slice(i);
                            return true;
                        }
                    }
                }
            }
        };
    }

})(typeof window === 'undefined' ? null : window, typeof document === 'undefined' ? null : document);

},{}],18:[function(require,module,exports){
'use strict';


var forms = module.exports = {

    parse: function parse(form) {
        var raw = form.elements,
            data = {},
            pair, value, i, len;

        for (i = 0, len = raw.length; i < len; i++) {
            pair = raw[i];

            if ((value = forms.getInputValue(pair))) {
                data[pair.name] = value;
            }
        }

        return data;
    },


    getInputValue: function getInputValue(input) {
        var tag = input.tagName.toLowerCase();

        if (tag === 'select') {
            return input.options[input.selectedIndex].value;
        } else if (tag === 'textarea') {
            return input.innerText;
        } else {
            if (input.type === 'radio') {
                return (input.checked) ? input.value : null;
            } else if (input.type === 'checkbox') {
                return (input.checked) ? input.value : null;
            } else {
                return input.value;
            }
        }
    }

};
},{}],19:[function(require,module,exports){
'use strict';


var mixin = module.exports = function mixin(dest, source) {
    var value;

    for (var key in source) {
        value = source[key];

        if (value && value.constructor === Object) {
            if (!dest[key]) {
                dest[key] = value;
            } else {
                mixin(dest[key] || {}, value);
            }
        } else {
            dest[key] = value;
        }
    }

    return dest;
};

},{}],20:[function(require,module,exports){
'use strict';


function Pubsub() {
    this._eventCache = {};
}


Pubsub.prototype.on = function on(name, fn, scope) {
    var cache = this._eventCache[name];

    if (!cache) {
        cache = this._eventCache[name] = [];
    }

    cache.push([fn, scope]);
};


Pubsub.prototype.off = function off(name, fn) {
    var cache = this._eventCache[name],
        i, len;

    if (cache) {
        for (i = 0, len = cache.length; i < len; i++) {
            if (cache[i] === fn) {
                cache = cache.splice(i, 1);
            }
        }
    }
};


Pubsub.prototype.fire = function on(name) {
    var cache = this._eventCache[name], i, len, fn, scope;

    if (cache) {
        for (i = 0, len = cache.length; i < len; i++) {
            fn = cache[i][0];
            scope = cache[i][1] || this;

            if (typeof fn === 'function') {
                fn.apply(scope, Array.prototype.slice.call(arguments, 1));
            }
        }
    }
};


module.exports = Pubsub;

},{}],21:[function(require,module,exports){
'use strict';


var Storage = module.exports = function Storage(name, duration) {
    this._name = name;
    this._duration = duration || 30;
};


var proto = Storage.prototype;


proto.load = function () {
    if (typeof window === 'object' && window.localStorage) {
        var data = window.localStorage.getItem(this._name), today, expires;

        if (data) {
            data = JSON.parse(decodeURIComponent(data));
        }

        if (data && data.expires) {
            today = new Date();
            expires = new Date(data.expires);

            if (today > expires) {
                this.destroy();
                return;
            }
        }

        return data && data.value;
    }
};


proto.save = function (data) {
    if (typeof window === 'object' && window.localStorage) {
        var expires = new Date(), wrapped;

        expires.setTime(expires.getTime() + this._duration * 24 * 60 * 60 * 1000);

        wrapped = {
            value: data,
            expires: expires.toGMTString()
        };

        window.localStorage.setItem(this._name, encodeURIComponent(JSON.stringify(wrapped)));
    }
};


proto.destroy = function () {
    if (typeof window === 'object' && window.localStorage) {
        window.localStorage.removeItem(this._name);
    }
};

},{}],22:[function(require,module,exports){
'use strict';


var ejs = require('ejs');


module.exports = function template(str, data) {
    return ejs.render(str, data);
};


// Workaround for IE 8's lack of support
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

},{"ejs":5}],23:[function(require,module,exports){
'use strict';


var config = require('./config'),
    events = require('./util/events'),
    template = require('./util/template'),
    forms = require('./util/forms'),
    css = require('./util/css'),
    viewevents = require('./viewevents'),
    constants = require('./constants');



/**
 * Creates a view model.
 *
 * @constructor
 * @param {object} model
 */
function View(model) {
    var wrapper;

    this.el = wrapper = document.createElement('div');
    this.model = model;
    this.isShowing = false;

    // HTML
    wrapper.id = config.name;
    config.parent.appendChild(wrapper);

    // CSS
    css.inject(document.getElementsByTagName('head')[0], config.styles);

    // JavaScript
    events.add(document, ('ontouchstart' in window) ? 'touchstart' : 'click', viewevents.click, this);
    events.add(document, 'keyup', viewevents.keyup, this);
    events.add(document, 'readystatechange', viewevents.readystatechange, this);
    events.add(window, 'pageshow', viewevents.pageshow, this);
}


/**
 * Tells the view to redraw
 */
View.prototype.redraw = function redraw() {
    events.remove(this.el.querySelector('form'), 'submit', this.model.cart.checkout, this.model.cart);
    this.el.innerHTML = template(config.template, this.model);
    events.add(this.el.querySelector('form'), 'submit', this.model.cart.checkout, this.model.cart);
};


/**
 * Tells the view to show
 */
View.prototype.show = function show() {
    if (!this.isShowing) {
        css.add(document.body, constants.SHOWING_CLASS);
        this.isShowing = true;
    }
};


/**
 * Tells the view to hide
 */
View.prototype.hide = function hide() {
    if (this.isShowing) {
        css.remove(document.body, constants.SHOWING_CLASS);
        this.isShowing = false;
    }
};


/**
 * Toggles the visibility of the view
 */
View.prototype.toggle = function toggle() {
    this[this.isShowing ? 'hide' : 'show']();
};


/**
 * Binds cart submit events to a form.
 *
 * @param {HTMLElement} form
 * @return {boolean}
 */
View.prototype.bind = function bind(form) {
    var that = this;

    // Don't bind forms without a cmd value
    if (!constants.COMMANDS[form.cmd.value]) {
        return false;
    }

    // Prevent re-binding forms
    if (form.hasMinicart) {
        return false;
    } else {
        form.hasMinicart = true;
    }

    if (form.display) {
        events.add(form, 'submit', function (e) {
            e.preventDefault();
            that.show();
        });
    } else {
        events.add(form, 'submit', function (e) {
            e.preventDefault(e);
            that.model.cart.add(forms.parse(form));
        });
    }

    return true;
};


/**
 * Adds an item to the view.
 *
 * @param {number} idx
 * @param {object} data
 */
View.prototype.addItem = function addItem(idx, data) {
    this.redraw();
    this.show();

    var els = this.el.querySelectorAll('.' + constants.ITEM_CLASS);
    css.add(els[idx], constants.ITEM_CHANGED_CLASS);
};


/**
 * Changes an item in the view.
 *
 * @param {number} idx
 * @param {object} data
 */
View.prototype.changeItem = function changeItem(idx, data) {
    this.redraw();
    this.show();

    var els = this.el.querySelectorAll('.' + constants.ITEM_CLASS);
    css.add(els[idx], constants.ITEM_CHANGED_CLASS);
};


/**
 * Removes an item from the view.
 *
 * @param {number} idx
 */
View.prototype.removeItem = function removeItem(idx) {
    this.redraw();
};




module.exports = View;

},{"./config":10,"./constants":11,"./util/css":15,"./util/events":17,"./util/forms":18,"./util/template":22,"./viewevents":24}],24:[function(require,module,exports){
'use strict';


var constants = require('./constants'),
    events = require('./util/events'),
    viewevents;


module.exports = viewevents = {

    click: function (evt) {
        var target = evt.target,
            className = target.className;

        if (this.isShowing) {
            // Cart close button
            if (className === constants.CLOSER_CLASS) {
                this.hide();
            // Product remove button
            } else if (className === constants.REMOVE_CLASS) {
                this.model.cart.remove(target.getAttribute(constants.DATA_IDX));
            // Product quantity input
            } else if (className === constants.QUANTITY_CLASS) {
                target[target.setSelectionRange ? 'setSelectionRange' : 'select'](0, 999);
            // Outside the cart
            } else if (!(/input|button|select|option/i.test(target.tagName))) {
                while (target.nodeType === 1) {
                    if (target === this.el) {
                        return;
                    }

                    target = target.parentNode;
                }

                this.hide();
            }
        }
    },


    keyup: function (evt) {
        var that = this,
            target = evt.target,
            timer;

        if (target.className === constants.QUANTITY_CLASS) {
            timer = setTimeout(function () {
                var idx = parseInt(target.getAttribute(constants.DATA_IDX), 10),
                    cart = that.model.cart,
                    product = cart.items(idx),
                    quantity = parseInt(target.value, 10);

                if (product) {
                    if (quantity > 0) {
                        product.set('quantity', quantity);
                    } else if (quantity === 0) {
                        cart.remove(idx);
                    }
                }
            }, constants.KEYUP_TIMEOUT);
        }
    },


    readystatechange: function () {
        if (/interactive|complete/.test(document.readyState)) {
            var forms, form, i, len;

            // Bind to page's forms
            forms = document.getElementsByTagName('form');

            for (i = 0, len = forms.length; i < len; i++) {
                form = forms[i];

                if (form.cmd && constants.COMMANDS[form.cmd.value]) {
                    this.bind(form);
                }
            }

            // Do the initial render when the buttons are ready
            this.redraw();

            // Only run this once
            events.remove(document, 'readystatechange', viewevents.readystatechange);
        }
    },


    pageshow: function (evt) {
        if (evt.persisted) {
            this.redraw();
            this.hide();
        }
    }

};

},{"./constants":11,"./util/events":17}]},{},[9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24])
;