webpackJsonp([0],[
/* 0 */,
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__events__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__config__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__cook__ = __webpack_require__(12);


 //===== AJAX

/*
 * Get cross browser xhr object
 *
 * Copyright (C) 2011 Jed Schmidt <http://jed.is>
 * More: https://gist.github.com/993585
 */

var ajax = function () {
  for (var a = 0; a < 4; a++) try {
    return a // try returning
    ? new ActiveXObject( // a new ActiveXObject
    [, // reflecting
    // (elided)
    "Msxml2", // the various
    "Msxml3", // working
    "Microsoft" // options
    ][a] + // for Microsoft implementations, and
    ".XMLHTTP" // the appropriate suffix,
    ) // but make sure to
    : new XMLHttpRequest(); // try the w3c standard first, and
  } catch (e) {} // ignore when it fails.

}; // DATA must be encoded - EncodeURIComponent


function ajaxReq(method, url, ok_cb, err_cb, data) {
  var xhr = ajax();
  xhr.open(method, url, true);
  var timeout = setTimeout(function () {
    xhr.abort();
    console.log("XHR timeout:", method, url);
    err_cb(-1, 'API request timed out');
  }, 30000);

  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4) return;
    clearTimeout(timeout);

    if (xhr.status >= 200 && xhr.status < 300) {
      //console.log("XHR done:", method, url, "->", xhr.status);
      ok_cb(xhr.responseText, xhr);
    } else {
      if (xhr.status != 401) console.log("XHR ERR: " + method, url + " ==> " + xhr.status);

      if (xhr.status != 404 && xhr.status != 401) {
        console.log(xhr.responseText);
      }

      err_cb(xhr.status, xhr.responseText);
    }

    xhr = null;
  };

  if (!(data instanceof FormData)) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  try {
    if (data !== undefined) xhr.send(data);else xhr.send();
  } catch (err) {
    console.log("XHR EXC :" + method, url + " --> ", err);
    err_cb(599, err);
  }
}

function dispatchJson(resp, ok_cb, err_cb, req) {
  var j;

  try {
    j = JSON.parse(resp);
  } catch (err) {
    if (resp.indexOf('error') != -1) {
      resp = resp.replace(/\/var\/.+\/api/g, '/api');
      console.log(resp);
      err_cb(597, resp);
    } else {
      console.log(err + " ==> IN: " + resp);
      err_cb(597, "JSON parse error: " + err);
    }

    return;
  }

  ok_cb(j, req);
} // DATA must be encoded - EncodeURIComponent


function ajaxJson(method, url, ok_cb, err_cb, data) {
  ajaxReq(method, url, function (resp, req) {
    dispatchJson(resp, ok_cb, err_cb, req);
  }, err_cb, data);
} // DATA must be encoded - EncodeURIComponent


function ajaxSpin(method, url, ok_cb, err_cb, data) {
  __WEBPACK_IMPORTED_MODULE_0__events__["a" /* default */].$emit('show_spin');
  ajaxReq(method, url, function (resp) {
    __WEBPACK_IMPORTED_MODULE_0__events__["a" /* default */].$emit('hide_spin');
    ok_cb(resp);
  }, function (status, statusText) {
    __WEBPACK_IMPORTED_MODULE_0__events__["a" /* default */].$emit('hide_spin');
    err_cb(status, statusText);
  }, data);
} // DATA must be encoded - EncodeURIComponent


function ajaxJsonSpin(method, url, ok_cb, err_cb, data) {
  ajaxSpin(method, url, function (resp) {
    dispatchJson(resp, ok_cb, err_cb);
  }, err_cb, data);
} // ======================
// handle PHP run-time errors


function checkReply(js, err_cb) {
  if (js != null && typeof js == "object" && typeof js.error == "object" && js.error.type != '') {
    var tabs = 1,
        delim = '#',
        spc = ' ',
        msg = '';
    if (js.error.text != '') msg += js.error.text + "\n";

    if (js.error.trace.length) {
      while (js.error.trace.length) {
        var tr = js.error.trace.shift();
        msg += Array(tabs + 1).join(delim) + ' ' + tr.line + ', ' + tr.file + "\n";
        tabs++;
        msg += Array(tabs + 1).join(spc) + (typeof tr['class'] != 'undefined' ? tr['class'] + '::' : '') + tr['function'].name + '(' + tr['function'].args.join(', ') + ')' + "\n";
      }
    } else msg += delim + ' ' + js.error.line + ', ' + js.error.file + "\n";

    if (typeof sql == "object") {
      msg += "\n" + 'STATE = ' + sql.state + "\n" + sql.text + "\n" + sql.detail + "\n" + sql.context;
    }

    console.log(msg);
    err_cb.call(this, 598, '<pre>' + msg.replace(/(?:\r\n|\r|\n)/g, '<br/>') + '</pre>'); //err_cb.call(this,598,msg);

    return false;
  }

  return true;
} // expects THIS to point to Vue/Component instance


function cb_success(ok_cb, err_cb, resp) {
  if (checkReply.call(this, resp, err_cb)) {
    this.$root.info = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__cook__["a" /* jsonCookieValue */])(__WEBPACK_IMPORTED_MODULE_1__config__["a" /* default */].cookie_info, {});
    ok_cb.call(this, resp);
  }
}

function checkJSON(js) {
  var j;

  try {
    j = JSON.parse(js);
  } catch (err) {
    return js;
  }

  if (typeof j == "object" && typeof j.msg != "undefined") return j.msg;else return js;
} // expects THIS to point to Vue/Component instance


function cb_fail(url, err_cb, stat, resp) {
  var api = url.match(/^api(\/[^\?]+)\.php($|\?.*$)/);
  if (api != null) api = api[1];else api = 'XYZ';

  if (stat == 401) {
    this.$root.info = {};
    this.$root.go_back = this.$route.path;
    this.$router.push('/login');
  } else if (stat == 404) {
    err_cb.call(this, stat, 'API endpoint for <b>' + api + '</b> was not found');
  } else {
    err_cb.call(this, stat, checkJSON(resp));
  }
} // ======================


/* harmony default export */ __webpack_exports__["a"] = ({
  // expects THIS to point to Vue/Component instance
  ajax_get(instance, url, ok_cb, err_cb, signal) {
    ajaxJsonSpin("GET", url, cb_success.bind(instance, ok_cb, err_cb), cb_fail.bind(instance, url, err_cb));
  },

  ajax_post(instance, url, ok_cb, err_cb, data, signal) {
    ajaxJsonSpin("POST", url, cb_success.bind(instance, ok_cb, err_cb), cb_fail.bind(instance, url, err_cb), data);
  }

});

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTYgMTYiPg0KICA8Y2lyY2xlIGZpbGw9IiMwMEI0RkYiIGN4PSI4IiBjeT0iOCIgcj0iOCIvPg0KICA8cmVjdCBmaWxsPSIjRkZGRkZGIiB4PSI2Ljg4IiB5PSIxMS4wNTkiIHdpZHRoPSIyLjM1MSIgaGVpZ2h0PSIxLjk0MSIvPg0KICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNS41NywzLjUxQzQuNTg3LDQuMDQzLDQuMDYyLDQuOTQ3LDQsNi4yMjNoMi4yNzljMC0wLjM3MSwwLjEyOC0wLjcyOSwwLjM4My0xLjA3NA0KICAJQzYuOTE3LDQuODAzLDcuMzUsNC42MzEsNy45Niw0LjYzMWMwLjYyMSwwLDEuMDQ3LDAuMTQxLDEuMjgyLDAuNDJjMC4yMzQsMC4yNzksMC4zNTIsMC41OSwwLjM1MiwwLjkzDQogIAljMCwwLjI5NS0wLjEwNSwwLjU2Ni0wLjMxNCwwLjgxNEw4LjgyLDcuMTg5TDguMjQ1LDcuNTcyQzcuNjc4LDcuOTQ5LDcuMzI1LDguMjgxLDcuMTg3LDguNTdDNy4wNSw4Ljg1OSw2Ljk2Niw5LjM4Myw2LjkzNSwxMC4xMzkNCiAgCWgyLjEyOUM5LjA3LDkuNzgxLDkuMTA1LDkuNTE2LDkuMTY4LDkuMzQ2QzkuMjcsOS4wNzUsOS40NzMsOC44NDEsOS43NzMsOC42NDFsMC41NjMtMC4zNjljMC41NjYtMC4zNzUsMC45NTEtMC42ODcsMS4xNS0wLjkyNg0KICAJQzExLjgyOSw2Ljk0NywxMiw2LjQ1NCwxMiw1Ljg3NGMwLTAuOTQ5LTAuMzk1LTEuNjY2LTEuMTgyLTIuMTQ5QzEwLjAzNSwzLjI0Miw5LjA0OCwzLDcuODU5LDNDNi45NTMsMyw2LjE4OSwzLjE3LDUuNTcsMy41MXoiLz4NCjwvc3ZnPg0K"

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(65)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(42),
  /* template */
  __webpack_require__(111),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export $$ */
/* harmony export (immutable) */ __webpack_exports__["a"] = strCompare;
/* unused harmony export checkFilter */
/* harmony export (immutable) */ __webpack_exports__["b"] = round;
/*
 * DOM selector
 *
 * Usage:
 *   $('div');
 *   $('#name');
 *   $('.name');
 *
 * Copyright (C) 2011 Jed Schmidt <http://jed.is> - WTFPL
 * More: https://gist.github.com/991057
 */
function $$(a, // take a simple selector like "TagName", "#ID", or ".ClassName", and
b // an optional context, and
) {
  a = a.match(/^(\W)?(.*)/); // split the selector into name and symbol.

  return ( // return an element or list, from within the scope of
  b // the passed context
  || document // or document,
  )["getElement" + ( // obtained by the appropriate method calculated by
  a[1] ? a[1] == "#" ? "ById" // the node by ID,
  : "sByClassName" // the nodes by class name, or
  : "sByTagName" // the nodes by tag name,
  )](a[2] // called with the name.
  );
} // ======================

function strCompare(a, b) {
  if (a == null) return 1;else if (b == null) return -1;
  var la = a.length,
      lb = b.length;
  if (typeof a == "Number" && typeof b == "Number") return a - b;
  if (a.match(/^[+\-]?[0-9]+(\.[0-9]+)?$/) && b.match(/^[+\-]?[0-9]+(\.[0-9]+)?$/)) return a - b;
  if (a < b) return -1;else if (a > b) return 1;else return 0;
}
function checkFilter(list, combine, fn) {
  var i,
      len = list.length,
      flt = new Array(len);

  for (i = 0; i < len; i++) {
    var item = list[i],
        tmp = item.value.trim().toLowerCase();
    if (tmp == '') flt[i] = 'z'; // X = match, Y = no match, Z = empty
    else flt[i] = fn(item.type, tmp);
  }

  var res = flt.join('');
  return res == 'z'.repeat(len) || combine != 0 && res.indexOf('y') == -1 || combine == 0 && res.indexOf('x') != -1;
}
function round(number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTYyLjgxOHB4IiBoZWlnaHQ9IjI0Ljg1NHB4IiB2aWV3Qm94PSIwIDAuNTkxIDE2Mi44MTggMjQuODU0IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMC41OTEgMTYyLjgxOCAyNC44NTQiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGcgaWQ9IlN5bWJvbHMiPg0KCTxnIGlkPSJUb3AtTmF2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzAuMDAwMDAwLCAtMjAuMDAwMDAwKSI+DQoJCTxnIGlkPSJMb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMC4wMDAwMDAsIDIwLjAwMDAwMCkiPg0KCQkJPHBvbHlnb24gaWQ9IkZpbGwtMSIgZmlsbD0iIzAwQTBCOSIgcG9pbnRzPSIwLDI1LjQ0NSA3Ljc2MywyNS40NDUgNy43NjMsMTcuODA5IDAsMTcuODA5IAkJCSIvPg0KCQkJPHBvbHlnb24gaWQ9IkZpbGwtMiIgZmlsbD0iIzAwQTBCOSIgcG9pbnRzPSI4LjkyMywyNS40NDUgMTYuNjg3LDI1LjQ0NSAxNi42ODcsMTcuODA5IDguOTIzLDE3LjgwOSAJCQkiLz4NCgkJCTxwb2x5Z29uIGlkPSJGaWxsLTMiIGZpbGw9IiMwMEEwQjkiIHBvaW50cz0iMCwxNi44MDUgNy43NjMsMTYuODA1IDcuNzYzLDkuMTY4IDAsOS4xNjggCQkJIi8+DQoJCQk8cG9seWdvbiBpZD0iRmlsbC00IiBmaWxsPSIjMDBBMEI5IiBwb2ludHM9IjguOTIzLDE2LjgwNSAxNi42ODYsMTYuODA1IDE2LjY4Niw5LjE2OCA4LjkyMyw5LjE2OCAJCQkiLz4NCgkJCTxwb2x5Z29uIGlkPSJGaWxsLTUiIGZpbGw9IiMwMEEwQjkiIHBvaW50cz0iOC45MjMsOC4yMjggMTYuNjg3LDguMjI4IDE2LjY4NywwLjU5MSA4LjkyMywwLjU5MSAJCQkiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjx0ZXh0IHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIDEgMTkuNDA4OSAxOS44MDIpIiBmb250LWZhbWlseT0iJ1NlZ29lVUknIiBmb250LXNpemU9IjE5Ij5CdWRnZXQgT3B0aW1pemU8L3RleHQ+DQo8L3N2Zz4NCg=="

/***/ }),
/* 6 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
  info_time: 1800,
  // milliseconds, how long to display successful popups
  warn_time: 4000,
  // milliseconds, how long to display failure popups
  cookie_info: '_mm_info',
  cookie_token: '_mm_token'
});

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export DEFAULT_OPTIONS */
/* harmony export (immutable) */ __webpack_exports__["a"] = predict;
const DEFAULT_OPTIONS = {
  order: 2,
  precision: 2,
  period: null
};
/**
* Determine the coefficient of determination (r^2) of a fit from the observations
* and predictions.
*
* @param {Array<Array<number>>} data - Pairs of observed x-y values
* @param {Array<Array<number>>} results - Pairs of observed predicted x-y values
*
* @return {number} - The r^2 value, or NaN if one cannot be calculated.
*/

function determinationCoefficient(data, results) {
  const predictions = [];
  const observations = [];
  data.forEach((d, i) => {
    if (d[1] !== null) {
      observations.push(d);
      predictions.push(results[i]);
    }
  });
  const sum = observations.reduce((a, observation) => a + observation[1], 0);
  const mean = sum / observations.length;
  const ssyy = observations.reduce((a, observation) => {
    const difference = observation[1] - mean;
    return a + difference * difference;
  }, 0); //************* SStot value *************////

  const sse = observations.reduce((accum, observation, index) => {
    const prediction = predictions[index];
    const residual = observation[1] - prediction[1];
    return accum + residual * residual;
  }, 0); //*********** SSres value **************//

  const ssresid = observations.reduce((accum, observation, index) => {
    const prediction = predictions[index];
    const residual = prediction[1] - mean;
    return accum + residual * residual;
  }, 0);
  const rmse = sse / observations.length;
  const r2 = 1 - rmse / ssyy;
  return ssresid / ssyy;
}
/**
* Determine the solution of a system of linear equations A * x = b using
* Gaussian elimination.
*
* @param {Array<Array<number>>} input - A 2-d matrix of data in row-major form [ A | b ]
* @param {number} order - How many degrees to solve for
*
* @return {Array<number>} - Vector of normalized solution coefficients matrix (x)
*/


function gaussianElimination(input, order) {
  const matrix = input;
  const n = input.length - 1;
  const coefficients = [order];

  for (let i = 0; i < n; i++) {
    let maxrow = i;

    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[i][j]) > Math.abs(matrix[i][maxrow])) {
        maxrow = j;
      }
    }

    for (let k = i; k < n + 1; k++) {
      const tmp = matrix[k][i];
      matrix[k][i] = matrix[k][maxrow];
      matrix[k][maxrow] = tmp;
    }

    for (let j = i + 1; j < n; j++) {
      for (let k = n; k >= i; k--) {
        matrix[k][j] -= matrix[k][i] * matrix[i][j] / matrix[i][i];
      }
    }
  }

  for (let j = n - 1; j >= 0; j--) {
    let total = 0;

    for (let k = j + 1; k < n; k++) {
      total += matrix[k][j] * coefficients[k];
    }

    coefficients[j] = (matrix[n][j] - total) / matrix[j][j];
  }

  return coefficients;
}
/**
* Round a number to a precision, specificed in number of decimal places
*
* @param {number} number - The number to round
* @param {number} precision - The number of decimal places to round to:
*                             > 0 means decimals, < 0 means powers of 10
*
*
* @return {numbr} - The number, rounded
*/


function round(number, precision) {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}
/**
* The set of all fitting methods
*
* @namespace
*/


/* unused harmony default export */ var _unused_webpack_default_export = ({
  linear(data, options) {
    const sum = [0, 0, 0, 0, 0];
    let len = 0;

    for (let n = 0; n < data.length; n++) {
      if (data[n][1] != 0) {
        len++;
        sum[0] += data[n][0];
        sum[1] += data[n][1];
        sum[2] += data[n][0] * data[n][0];
        sum[3] += data[n][0] * data[n][1];
        sum[4] += data[n][1] * data[n][1];
      }
    }

    const run = len * sum[2] - sum[0] * sum[0];
    const rise = len * sum[3] - sum[0] * sum[1];
    const gradient = run === 0 ? 0 : round(rise / run, DEFAULT_OPTIONS.precision);
    const intercept = round(sum[1] / len - gradient * sum[0] / len, DEFAULT_OPTIONS.precision);

    const predict = x => [round(x, DEFAULT_OPTIONS.precision), round(gradient * x + intercept, DEFAULT_OPTIONS.precision)];

    const points = data.map(point => predict(point[0]));

    const predict1 = x => [round(x, DEFAULT_OPTIONS.precision), round(x / (gradient * x + intercept), DEFAULT_OPTIONS.precision)];

    const points1 = data.map(point => predict1(point[0]));
    console.log(round(determinationCoefficient(data, points), DEFAULT_OPTIONS.precision), "r-square");
    return {
      points,
      predict,
      points1,
      equation: [gradient, intercept],
      r2: round(determinationCoefficient(data, points), DEFAULT_OPTIONS.precision),
      string: intercept === 0 ? `Y = ${gradient} * X` : `Y = ${gradient} * X` + (intercept < 0 ? ' ' : ' + ') + `${intercept}`,
      string1: intercept === 0 ? `Y = X / ${gradient} * X` : `Y = X / (${gradient} * X` + (intercept < 0 ? ' ' : ' + ') + `${intercept})`,
      string2: intercept === 0 ? `Y =  ${gradient - 1} * X / X` : `Y =  (${gradient - 1} * X` + (intercept < 0 ? ' ' : ' + ') + `${intercept}) / X`
    };
  },

  exponential(data, options) {
    const sum = [0, 0, 0, 0, 0, 0];
    const poly = [0, 0, 0, 0, 0, 0];
    const len = data.length;

    for (let n = 0; n < data.length; n++) {
      if (data[n][1] != 0) {
        sum[0] += data[n][0];
        sum[1] += data[n][1];
        sum[2] += data[n][0] * data[n][0] * data[n][1];
        sum[3] += data[n][1] * Math.log(data[n][1]);
        sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
        sum[5] += data[n][0] * data[n][1];
        poly[0] += data[n][0];
        poly[1] += Math.log(data[n][1]);
        poly[2] += data[n][0] * Math.log(data[n][1]);
        poly[3] += data[n][0] * data[n][0];
      }
    }

    const m = (len * poly[2] - poly[0] * poly[1]) / (len * poly[3] - poly[0] * poly[0]);
    const intercept = (poly[1] * poly[3] - poly[0] * poly[2]) / (len * poly[3] - poly[0] * poly[0]); // const b1 = round(Math.exp(m), DEFAULT_OPTIONS.precision);
    // const a1 = round(Math.exp(intercept), DEFAULT_OPTIONS.precision);

    const b1 = round(m, DEFAULT_OPTIONS.precision);
    const a1 = round(Math.exp(intercept), DEFAULT_OPTIONS.precision);
    const denominator = sum[1] * sum[2] - sum[5] * sum[5];
    const a = Math.exp((sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
    const b = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;
    const coeffA = round(a, DEFAULT_OPTIONS.precision);
    const coeffB = round(b, DEFAULT_OPTIONS.precision); // console.log("first "+coeffA+" "+coeffB+" second "+a1+" "+b1);
    // const predict = x => ([
    //   round(x, DEFAULT_OPTIONS.precision),
    //   round(a1 * Math.pow(b1, x), DEFAULT_OPTIONS.precision),
    // ]);
    // const predict = x => ([
    //   round(x, DEFAULT_OPTIONS.precision),
    //   round(a1 * Math.exp(b1 * x), DEFAULT_OPTIONS.precision),
    // ]);

    const predict = x => [round(x, DEFAULT_OPTIONS.precision), round(coeffA * Math.exp(coeffB * x), DEFAULT_OPTIONS.precision)]; // const predict = x => ([
    //   round(x, DEFAULT_OPTIONS.precision),
    //   round(a1 * Math.exp(b1 * x), DEFAULT_OPTIONS.precision),
    // ]);


    const points = data.map(point => predict(point[0]));

    const predict1 = x => [round(x, DEFAULT_OPTIONS.precision), round(x / (coeffA * Math.exp(coeffB * x)), DEFAULT_OPTIONS.precision)];

    const points1 = data.map(point => predict1(point[0]));
    return {
      points,
      predict,
      points1,
      equation: [coeffA, coeffB],
      string: `Y = ${coeffA} * Exp(${coeffB} * X)`,
      string1: `Y = X / (${coeffA} * Exp(${coeffB} * X))`,
      string2: `Y = (${coeffA} * Exp(${coeffB} * X) - X) / X`,
      r2: round(determinationCoefficient(data, points), DEFAULT_OPTIONS.precision)
    };
  },

  logarithmic(data, options) {
    const sum = [0, 0, 0, 0];
    const len = data.length;

    for (let n = 0; n < len; n++) {
      if (data[n][1] != 0) {
        sum[0] += Math.log(data[n][0]);
        sum[1] += data[n][1] * Math.log(data[n][0]);
        sum[2] += data[n][1];
        sum[3] += Math.log(data[n][0]) ** 2;
      }
    }

    const a = (len * sum[1] - sum[2] * sum[0]) / (len * sum[3] - sum[0] * sum[0]);
    const coeffB = round(a, DEFAULT_OPTIONS.precision);
    const coeffA = round((sum[2] - coeffB * sum[0]) / len, DEFAULT_OPTIONS.precision);

    const predict = x => [round(x, DEFAULT_OPTIONS.precision), round(round(coeffA + coeffB * Math.log(x), DEFAULT_OPTIONS.precision), DEFAULT_OPTIONS.precision)];

    const points = data.map(point => predict(point[0]));

    const predict1 = x => [round(x, DEFAULT_OPTIONS.precision), round(round(x / (coeffA + coeffB * Math.log(x)), DEFAULT_OPTIONS.precision), DEFAULT_OPTIONS.precision)];

    const points1 = data.map(point => predict1(point[0]));
    return {
      points,
      predict,
      points1,
      equation: [coeffA, coeffB],
      string: `Y = ${coeffB} * Ln(X)` + (coeffA < 0 ? ' ' : ' + ') + `${coeffA}`,
      string1: `Y = X / (${coeffB} * Ln(X)` + (coeffA < 0 ? ' ' : ' + ') + `${coeffA})`,
      string2: `Y = (${coeffB} * Ln(X)` + ' - X ' + (coeffA < 0 ? ' ' : ' + ') + `${coeffA}) / X`,
      r2: round(determinationCoefficient(data, points), DEFAULT_OPTIONS.precision)
    };
  },

  power(data, options) {
    const sum = [0, 0, 0, 0, 0];
    const len = data.length;

    for (let n = 0; n < len; n++) {
      if (data[n][1] != 0) {
        sum[0] += Math.log(data[n][0]);
        sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
        sum[2] += Math.log(data[n][1]);
        sum[3] += Math.log(data[n][0]) ** 2;
      }
    }

    const b = (len * sum[1] - sum[0] * sum[2]) / (len * sum[3] - sum[0] ** 2);
    const a = (sum[2] - b * sum[0]) / len;
    const coeffA = round(Math.exp(a), DEFAULT_OPTIONS.precision);
    const coeffB = round(b, DEFAULT_OPTIONS.precision);

    const predict = x => [round(x, DEFAULT_OPTIONS.precision), round(round(coeffA * x ** coeffB, DEFAULT_OPTIONS.precision), DEFAULT_OPTIONS.precision)];

    const points = data.map(point => predict(point[0]));

    const predict1 = x => [round(x, DEFAULT_OPTIONS.precision), round(round(x / (coeffA * x ** coeffB), DEFAULT_OPTIONS.precision), DEFAULT_OPTIONS.precision)];

    const points1 = data.map(point => predict1(point[0]));
    return {
      points,
      predict,
      points1,
      equation: [coeffA, coeffB],
      string: `Y = ${coeffA} * X ^ ${coeffB}`,
      string1: `Y = X / (${coeffA} * X ^ ${coeffB})`,
      string2: `Y = (${coeffA} * X ^ ${coeffB} - X) / X `,
      r2: round(determinationCoefficient(data, points), DEFAULT_OPTIONS.precision)
    };
  },

  polynomial(data, options) {
    const lhs = [];
    const rhs = [];
    let a = 0;
    let b = 0;
    const len = data.length;
    const k = DEFAULT_OPTIONS.order + 1;

    for (let i = 0; i < k; i++) {
      for (let l = 0; l < len; l++) {
        if (data[l][1] !== null) {
          a += data[l][0] ** i * data[l][1];
        }
      }

      lhs.push(a);
      a = 0;
      const c = [];

      for (let j = 0; j < k; j++) {
        for (let l = 0; l < len; l++) {
          if (data[l][1] !== null) {
            b += data[l][0] ** (i + j);
          }
        }

        c.push(b);
        b = 0;
      }

      rhs.push(c);
    }

    rhs.push(lhs);
    const coefficients = gaussianElimination(rhs, k).map(v => round(v, DEFAULT_OPTIONS.precision));

    const predict = x => [round(x, DEFAULT_OPTIONS.precision), round(coefficients.reduce((sum, coeff, power) => sum + coeff * x ** power, 0), DEFAULT_OPTIONS.precision)];

    const points = data.map(point => predict(point[0]));

    const predict1 = x => [round(x, DEFAULT_OPTIONS.precision), round(x / coefficients.reduce((sum, coeff, power) => sum + coeff * x ** power, 0), DEFAULT_OPTIONS.precision)];

    const points1 = data.map(point => predict1(point[0]));
    let string = 'Y = ';

    for (let i = coefficients.length - 1; i >= 0; i--) {
      if (i > 1) {
        string += `${coefficients[i]} * X ^ ${i} + `;
      } else if (i === 1) {
        string += `${coefficients[i]} * X + `;
      } else {
        string += coefficients[i];
      }
    }

    let string1 = 'Y = X / (';

    for (let i = coefficients.length - 1; i >= 0; i--) {
      if (i > 1) {
        string1 += `${coefficients[i]} * X ^ ${i} + `;
      } else if (i === 1) {
        string1 += `${coefficients[i]} * X + `;
      } else {
        string1 += coefficients[i] + ')';
      }
    }

    let string2 = 'Y = (';

    for (let i = coefficients.length - 1; i >= 0; i--) {
      if (i > 1) {
        string2 += `${coefficients[i]} * X ^ ${i} + `;
      } else if (i === 1) {
        string2 += `${coefficients[i] - 1} * X + `;
      } else {
        string2 += coefficients[i] + ') / X';
      }
    }

    return {
      string,
      string1,
      string2,
      points,
      predict,
      points1,
      equation: [...coefficients].reverse(),
      r2: round(determinationCoefficient(data, points), DEFAULT_OPTIONS.precision)
    };
  }

});

function predict(cost, reg_kind, reg_coef) {
  if (cost <= 0) return 0;
  let t = 0;

  switch (reg_kind) {
    case 1:
      // linear
      t = cost * reg_coef[0] + reg_coef[1];
      break;

    case 2:
      // exponential
      t = reg_coef[0] * Math.exp(cost * reg_coef[1]);
      break;

    case 3:
      // logarithmic
      t = reg_coef[0] + reg_coef[1] * Math.log(cost);
      break;

    case 4:
      // polynomial
      t = reg_coef.reverse().reduce((sum, coeff, power) => sum + coeff * Math.pow(cost, power), 0);
      break;

    case 5:
      // power
      t = reg_coef[0] * Math.pow(cost, reg_coef[1]);
      break;
  }

  return t <= 0 ? 0 : t;
}

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = checkMail;
function checkMail(emailStr) {
  if (emailStr == '') return true; // The following pattern is used to check if the entered e-mail address
  // fits the user@domain format.  It also is used to separate the username
  // from the domain.

  var emailPat = /^(.+)@(.+)$/; // The following string represents the pattern for matching all special
  // characters.  We don't want to allow special characters in the address.
  // These characters include ( ) < > @ , ; : \ " . [ ]

  var specialChars = "\\(\\)><@,;:\\\\\\\"\\.\\[\\]"; // The following string represents the range of characters allowed in a
  // username or domainname.  It really states which chars aren't allowed.

  var validChars = "\[^\\s" + specialChars + "\]"; // The following pattern applies if the "user" is a quoted string (in
  // which case, there are no rules about which characters are allowed
  // and which aren't; anything goes).  E.g. "jiminy cricket"@disney.com
  // is a legal e-mail address.

  var quotedUser = "(\"[^\"]*\")"; // The following pattern applies for domains that are IP addresses,
  // rather than symbolic names.  E.g. joe@[123.124.233.4] is a legal
  // e-mail address. NOTE: The square brackets are required.

  var ipDomainPat = /^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/; // The following string represents an atom (basically a series of non-special characters.)

  var atom = validChars + '+'; // The following string represents one word in the typical username.
  // For example, in john.doe@somewhere.com, john and doe are words.
  // Basically, a word is either an atom or quoted string.

  var word = "(" + atom + "|" + quotedUser + ")"; // The following pattern describes the structure of the user

  var userPat = new RegExp("^" + word + "(\\." + word + ")*$"); // The following pattern describes the structure of a normal symbolic
  // domain, as opposed to ipDomainPat, shown above. */

  var domainPat = new RegExp("^" + atom + "(\\." + atom + ")*$"); // Finally, let's start trying to figure out if the supplied address is valid.
  // Begin with the coarse pattern to simply break up user@domain into
  // different pieces that are easy to analyze. */

  var matchArray = emailStr.match(emailPat);

  if (matchArray == null) {
    // Too many/few @'s or something; basically, this address doesn't
    // even fit the general mould of a valid e-mail address. */
    return "Email address seems incorrect (check @ and .'s)";
  }

  var user = matchArray[1];
  var domain = matchArray[2]; // Start by checking that only basic ASCII characters are in the strings (0-127).

  for (i = 0; i < user.length; i++) {
    if (user.charCodeAt(i) > 127) {
      return "This username in email contains invalid characters.";
    }
  }

  for (i = 0; i < domain.length; i++) {
    if (domain.charCodeAt(i) > 127) {
      return "This domain name contains invalid characters.";
    }
  } // See if "user" is valid


  if (user.match(userPat) == null) {
    return "The username in email doesn't seem to be valid.";
  } // if the e-mail address is at an IP address (as opposed to a symbolic
  // host name) make sure the IP address is valid.


  var IPArray = domain.match(ipDomainPat);

  if (IPArray != null) {
    // this is an IP address
    for (var i = 1; i <= 4; i++) {
      if (IPArray[i] > 255) {
        return "Destination IP address is invalid!";
      }
    }

    return '';
  } // Domain is symbolic name.  Check if it's valid.


  var atomPat = new RegExp("^" + atom + "$");
  var domArr = domain.split(".");
  var len = domArr.length;

  for (i = 0; i < len; i++) {
    if (domArr[i].search(atomPat) == -1) {
      return "The domain name does not seem to be valid.";
    }
  } // Make sure there's a host name preceding the domain.


  if (len < 2) {
    return "This email address is missing a hostname!";
  } // If we've gotten this far, everything's valid!


  return "";
}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 11 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export has_cookie */
/* unused harmony export getCookieValue */
/* harmony export (immutable) */ __webpack_exports__["a"] = jsonCookieValue;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config__ = __webpack_require__(7);
 // used by LOGIN and SIGNUP to redirect if user is already logged in

function has_cookie(name) {
  if (name == null || name == '') name = __WEBPACK_IMPORTED_MODULE_0__config__["a" /* default */].cookie_token;
  return getCookieValue(name) != '';
}
function getCookieValue(a) {
  var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
  return b ? b.pop() : '';
}
function jsonCookieValue(a, def) {
  var js = def,
      info_cookie = decodeURIComponent(getCookieValue(a));
  if (info_cookie == '') return def;

  try {
    js = JSON.parse(info_cookie);
  } catch (err) {
    console.log("Cookie - JSON parse error: " + err + ". In: " + info_cookie);
    js = def;
  }

  return js;
}

/***/ }),
/* 13 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(17);

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_0_vue__["a" /* default */]());

/***/ }),
/* 15 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 16 */,
/* 17 */,
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = function () {
  return new Worker(__webpack_require__.p + "4b7a6ad09b94788d342f.worker.js");
};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 20 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 21 */,
/* 22 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSI1MSAxNDEgNTEwIDUxMCI+DQogIDxwYXRoIGZpbGw9IiNERjdGN0YiIGQ9Ik0zMDYsMTQxQzE2NS43NSwxNDEsNTEsMjU1Ljc1LDUxLDM5NnMxMTQuNzUsMjU1LDI1NSwyNTVzMjU1LTExNC43NSwyNTUtMjU1UzQ0Ni4yNSwxNDEsMzA2LDE0MXoiLz4NCiAgPHBvbHlnb24gZmlsbD0iI0ZGRkZGRiIgcG9pbnRzPSI0MzAuOTQ5LDQ4NS4yNSAzOTUuMjUsNTIwLjk1IDMwNiw0MzEuNyAyMTYuNzUsNTIwLjk1IDE4MS4wNSw0ODUuMjUgMjcwLjMsMzk2IDE4MS4wNSwzMDYuNzUgDQoJICAyMTYuNzUsMjcxLjA1IDMwNiwzNjAuMyAzOTUuMjUsMjcxLjA1IDQzMC45NDksMzA2Ljc1IDM0MS42OTksMzk2ICIvPg0KPC9zdmc+DQo="

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+DQogIDxjaXJjbGUgZmlsbD0iIzVDRDA1MyIgY3g9IjY0IiBjeT0iNjQiIHI9IjY0Ii8+DQogIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik01NC4zLDk3LjJMMjQuOCw2Ny43Yy0wLjQtMC40LTAuNC0xLDAtMS40bDguNS04LjVjMC40LTAuNCwxLTAuNCwxLjQsMEw1NSw3OC4xbDM4LjItMzguMg0KICAgIGMwLjQtMC40LDEtMC40LDEuNCwwbDguNSw4LjVjMC40LDAuNCwwLjQsMSwwLDEuNEw1NS43LDk3LjJDNTUuMyw5Ny42LDU0LjcsOTcuNiw1NC4zLDk3LjJ6Ii8+DQo8L3N2Zz4NCg=="

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(68)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(44),
  /* template */
  __webpack_require__(116),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-5bac2ca1",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(66)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(50),
  /* template */
  __webpack_require__(113),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(59)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(51),
  /* template */
  __webpack_require__(98),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(67)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(53),
  /* template */
  __webpack_require__(114),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_bad_route__ = __webpack_require__(86);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_bad_route___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_bad_route__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_login_login_form__ = __webpack_require__(90);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_login_login_form___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_login_login_form__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_login_signup_form__ = __webpack_require__(93);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_login_signup_form___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_login_signup_form__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_login_reset_form__ = __webpack_require__(92);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_login_reset_form___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_login_reset_form__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_login_password_reset__ = __webpack_require__(91);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_login_password_reset___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__components_login_password_reset__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_landing__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_landing___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__components_landing__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_account_my_profile__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_account_my_profile___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__components_account_my_profile__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_import_import__ = __webpack_require__(89);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_import_import___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__components_import_import__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__components_campaign_list__ = __webpack_require__(87);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__components_campaign_list___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__components_campaign_list__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__components_optimize_optimize__ = __webpack_require__(94);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__components_optimize_optimize___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__components_optimize_optimize__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__components_support_support__ = __webpack_require__(97);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__components_support_support___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_11__components_support_support__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__components_support_contact__ = __webpack_require__(96);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__components_support_contact___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12__components_support_contact__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__components_admin_stats__ = __webpack_require__(85);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__components_admin_stats___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_13__components_admin_stats__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__components_admin_paypal__ = __webpack_require__(84);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__components_admin_paypal___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_14__components_admin_paypal__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__components_privacy__ = __webpack_require__(95);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__components_privacy___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_15__components_privacy__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__components_account_campaigns__ = __webpack_require__(80);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__components_account_campaigns___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_16__components_account_campaigns__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__components_admin_events__ = __webpack_require__(83);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__components_admin_events___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_17__components_admin_events__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__components_account_upgrade__ = __webpack_require__(82);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__components_account_upgrade___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_18__components_account_upgrade__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__components_about__ = __webpack_require__(79);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__components_about___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_19__components_about__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__tool_cook__ = __webpack_require__(12);






















/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_0_vue_router__["a" /* default */]({
  base: '/',
  mode: 'hash',
  routes: [{
    path: '/',
    component: __WEBPACK_IMPORTED_MODULE_6__components_landing___default.a,
    meta: {
      title: 'Splash'
    }
  }, {
    path: '/login',
    component: __WEBPACK_IMPORTED_MODULE_2__components_login_login_form___default.a,
    meta: {
      title: 'LOGIN'
    }
  }, {
    path: '/signup',
    component: __WEBPACK_IMPORTED_MODULE_3__components_login_signup_form___default.a,
    meta: {
      title: 'REGISTER'
    }
  }, {
    path: '/reset',
    component: __WEBPACK_IMPORTED_MODULE_4__components_login_reset_form___default.a,
    meta: {
      title: 'RESET'
    }
  }, {
    path: '/reset/:token',
    component: __WEBPACK_IMPORTED_MODULE_5__components_login_password_reset___default.a,
    meta: {
      title: 'Password Reset'
    }
  }, {
    path: '/feature',
    component: __WEBPACK_IMPORTED_MODULE_6__components_landing___default.a,
    meta: {
      title: 'Video'
    }
  }, {
    path: '/contact',
    component: __WEBPACK_IMPORTED_MODULE_12__components_support_contact___default.a,
    meta: {
      title: 'Contact us'
    }
  }, {
    path: '/campaigns',
    component: __WEBPACK_IMPORTED_MODULE_9__components_campaign_list___default.a,
    meta: {
      title: 'Campaigns',
      menu: true
    }
  }, {
    path: '/import',
    component: __WEBPACK_IMPORTED_MODULE_8__components_import_import___default.a,
    meta: {
      title: 'Import data',
      menu: true
    }
  }, {
    path: '/profile',
    component: __WEBPACK_IMPORTED_MODULE_7__components_account_my_profile___default.a,
    meta: {
      title: 'My profile',
      menu: true
    }
  }, {
    path: '/support',
    component: __WEBPACK_IMPORTED_MODULE_11__components_support_support___default.a,
    meta: {
      title: 'Support',
      menu: true
    }
  }, {
    path: '/admin',
    component: __WEBPACK_IMPORTED_MODULE_13__components_admin_stats___default.a,
    meta: {
      title: 'Admin panel',
      admin: true
    }
  }, {
    path: '/paypal',
    component: __WEBPACK_IMPORTED_MODULE_14__components_admin_paypal___default.a,
    meta: {
      title: 'PayPal',
      admin: true
    }
  }, {
    path: '/optimize/:kind/:list',
    name: 'optimize',
    component: __WEBPACK_IMPORTED_MODULE_10__components_optimize_optimize___default.a,
    meta: {
      title: 'Optimize'
    }
  }, {
    path: '/privacy',
    component: __WEBPACK_IMPORTED_MODULE_15__components_privacy___default.a,
    meta: {
      title: 'Privacy Policy'
    }
  }, {
    path: '/data/:user',
    component: __WEBPACK_IMPORTED_MODULE_16__components_account_campaigns___default.a,
    meta: {
      title: 'Export data'
    }
  }, {
    path: '/events/:user',
    component: __WEBPACK_IMPORTED_MODULE_17__components_admin_events___default.a,
    meta: {
      title: 'User events'
    }
  }, {
    path: '/upgrade',
    component: __WEBPACK_IMPORTED_MODULE_18__components_account_upgrade___default.a,
    meta: {
      title: 'Paid subscription'
    }
  }, {
    path: '/about',
    component: __WEBPACK_IMPORTED_MODULE_19__components_about___default.a,
    meta: {
      title: 'ABOUT'
    }
  }, {
    path: '*',
    // should be last, otherwise matches everything
    component: __WEBPACK_IMPORTED_MODULE_1__components_bad_route___default.a,
    meta: {
      title: 'NOT FOUND'
    }
  }]
}));

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(64)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(32),
  /* template */
  __webpack_require__(109),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 30 */,
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["default"] = ({
  name: "Collapse",

  data() {
    return {
      active: false
    };
  },

  props: {
    selected: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  created() {
    this._isCollapseItem = true;
    this.active = this.selected;
  },

  ready() {
    if (this.active) {
      this.$emit('collapse-open', this.index);
    }
  },

  methods: {
    toggle() {
      this.active = !this.active;

      if (this.active) {
        this.$emit('collapse-open', this.index);
      }
    }

  }
});

/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'app',
  computed: {
    rt: function () {
      return this.$router;
    }
  },
  methods: {
    myFunction() {
      var x = document.getElementById("myTopnav");

      if (x.className === "mainmenu") {
        x.className += " responsive"; // console.log(x.className);
      } else {
        x.className = "mainmenu"; // console.log(x.className);
      }
    },

    func1() {
      // console.log('aaa');
      var x = document.getElementById("myTopnav");
      x.className = "mainmenu";
    }

  }
});

/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_err_panel__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__tool_util__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




__webpack_require__(10);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default.a
  },
  data: function () {
    var a = {
      is_warn: false,
      warn_text: '',
      user_name: '',
      data_roi: [],
      data_cpa: [],
      selected_roi: [],
      selected_cpa: []
    };
    return a;
  },
  created: function () {
    this.fetchData();
  },
  computed: {
    sortedROI: function () {
      return this.data_roi.sort(function (a, b) {
        const t = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["a" /* strCompare */])(a.group.toLowerCase(), b.group.toLowerCase());
        if (t) return t;
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["a" /* strCompare */])(a.title.toLowerCase(), b.title.toLowerCase());
      });
    },
    sortedCPA: function () {
      return this.data_cpa.sort(function (a, b) {
        const t = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["a" /* strCompare */])(a.group.toLowerCase(), b.group.toLowerCase());
        if (t) return t;
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["a" /* strCompare */])(a.title.toLowerCase(), b.title.toLowerCase());
      });
    }
  },
  methods: {
    fetchData: function () {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, 'api/admin/user_data.php?id=' + this.$route.params.user, function (resp) {
        if (isArray(resp.data_roi)) this.data_roi = resp.data_roi;
        if (isArray(resp.data_cpa)) this.data_cpa = resp.data_cpa;
        this.user_name = resp.user_name;
        this.selected_roi = [];
        this.selected_cpa = [];
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    },
    roi_all: function (evt) {
      if (evt.target.checked) this.selected_roi = this.data_roi.map(function (item) {
        return item.id;
      });else this.selected_roi = [];
    },
    cpa_all: function (evt) {
      if (evt.target.checked) this.selected_cpa = this.data_cpa.map(function (item) {
        return item.id;
      });else this.selected_cpa = [];
    }
  }
});

/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_email__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tool_ajax__ = __webpack_require__(1);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



__webpack_require__(6);

/* harmony default export */ __webpack_exports__["default"] = ({
  data: function () {
    var a = {
      username: '',
      password: '',
      password2: '',
      email: '',
      full_name: '',
      confirmed: '',
      subscribed: false,
      cant_signup: ''
    };
    return a;
  },
  created: function () {
    this.fetchData();
  },
  methods: {
    fetchData: function () {
      __WEBPACK_IMPORTED_MODULE_1__tool_ajax__["a" /* default */].ajax_get(this, "api/login/get_profile.php", function (resp) {
        this.cant_signup = '';
        this.username = resp.user_name;
        this.email = resp.email;
        this.full_name = resp.full_name;
        this.confirmed = resp.confirmed;
        this.subscribed = resp.subscribe_on && resp.subscribe_on != '' && (resp.cancel_on == null || resp.cancel_on == '');
      }, function (stat, resp) {
        this.cant_signup = resp;
        this.$refs.email.focus();
      });
    },
    doSave: function () {
      var err;
      if (this.full_name.trim() == '') this.cant_signup = 'Missing first and last name';else if ((this.password.trim() != '' || this.password2.trim() != '') && this.password.trim() != this.password2.trim()) this.cant_signup = 'Passwords are different'; //else if((err = checkMail(this.email.trim(),true)) != '') this.cant_signup = err;
      else {
          var full_name = this.full_name ? this.full_name.trim() : '';
          var password = this.password ? this.password.trim() : '';
          var password2 = this.password2 ? this.password2.trim() : '';
          var email = this.email ? this.email.trim() : '';
          __WEBPACK_IMPORTED_MODULE_1__tool_ajax__["a" /* default */].ajax_post(this, "api/login/save_profile.php", function (resp) {
            if (resp.saved) {
              this.cant_signup = '';
            } else this.cant_signup = 'There was an error while saving changes';
          }, function (stat, resp) {
            this.cant_signup = resp;
            this.$refs.username.focus();
          }, "full_name=" + encodeURIComponent(full_name) + "&password=" + encodeURIComponent(password) + "&password2=" + encodeURIComponent(password2) + "&email=" + encodeURIComponent(email));
        }
    },
    resendMail: function () {
      __WEBPACK_IMPORTED_MODULE_1__tool_ajax__["a" /* default */].ajax_get(this, "api/login/resend.php", function (resp) {
        if (resp.sent) this.cant_signup = 'Activation email was sent';else this.cant_signup = 'There was a problem with sending the activation email';
      }, function (stat, resp) {
        this.cant_signup = resp;
        this.$refs.username.focus();
      });
    }
  }
});

/***/ }),
/* 35 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_err_panel__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



__webpack_require__(13);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default.a
  },
  data: function () {
    var a = {
      is_warn: false,
      warn_text: '',
      subscribed: false,
      cancelled: false
    };
    return a;
  },
  created: function () {
    this.fetchData();
  },
  methods: {
    fetchData: function () {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, 'api/login/get_profile.php', function (resp) {
        this.subscribed = resp.subscribe_on != null && resp.subscribe_on != '';
        this.cancelled = resp.cancel_on != null && resp.cancel_on != '';
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    }
  }
});

/***/ }),
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_err_panel__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



__webpack_require__(10);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default.a
  },
  data: function () {
    var a = {
      is_warn: false,
      warn_text: '',
      events: [],
      user_name: ''
    };
    return a;
  },
  created: function () {
    this.fetchData();
  },
  methods: {
    fetchData: function () {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, 'api/admin/event_log.php?id=' + this.$route.params.user, function (resp) {
        if (isArray(resp.events)) this.events = resp.events;
        this.user_name = resp.user_name;
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    }
  }
});

/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_err_panel__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



__webpack_require__(10);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default.a
  },
  data: function () {
    var a = {
      is_warn: false,
      warn_text: '',
      plans: [],
      hooks: [],
      page: 0,
      num_pages: 1,
      plan_name: '',
      plan_desc: '',
      pay_name: '',
      freq: '',
      amount: 0,
      currency: '',
      max_fail: '',
      freq_list: ['Day', 'Week', 'Month', 'Year'],
      curr_list: ['USD', 'AUD', 'EUR'],
      window: window
    };
    return a;
  },
  created: function () {
    this.fetchPlans();
    this.fetchHooks();
  },
  methods: {
    fetchPlans: function () {
      // get details for the existing billing plans from PayPal
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, 'api/paypal/plan_list.php?page=' + this.page, function (resp) {
        if (isArray(resp.items)) this.plans = resp.items;
        this.num_pages = resp.pages;
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    },
    newPlan: function () {
      // create new billing plan inside PayPal (and activate it)
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, 'api/paypal/plan_new.php', function (resp) {
        this.is_warn = false;
        this.warn_text = 'A new billing plan with ID = ' + resp.plan_id + ' was created';
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      }, JSON.stringify({
        name: this.plan_name,
        description: this.plan_desc,
        paydef: this.pay_name,
        frequency: this.freq,
        amount: this.amount,
        currency: this.currency,
        max_fail: this.max_fail
      }));
    },
    planDuplicate: function (plan) {
      // copy data to the form fields, simplifying the creation of a new plan
      this.plan_name = plan.name;
      this.plan_desc = plan.description;
      this.pay_name = plan.paydef;
      this.freq = plan.frequency;
      this.amount = plan.amount;
      this.currency = plan.currency;
      this.max_fail = plan.max_fail;
    },
    planActive: function (plan) {
      // mark the plan as preferred in our DB for new subscriptions
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, 'api/paypal/plan_active.php?id=' + encodeURIComponent(plan.id), function (resp) {
        this.is_warn = false;
        this.warn_text = 'The plan with ID = ' + plan.id + ' will be used for new subscribers';
        this.plans = this.plans.map(function (item) {
          item.active = item.id == plan.id;
          return item;
        });
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    },
    fetchHooks: function () {
      // get details for the existing billing plans from PayPal
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, 'api/paypal/webhook_list.php', function (resp) {
        if (isArray(resp)) this.hooks = resp;
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    },
    hookDelete: function (hook) {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, 'api/paypal/webhook_delete.php?id=' + encodeURIComponent(hook.id), function (resp) {
        this.is_warn = false;
        this.warn_text = 'Web hook was successfully removed';
        this.hooks.splice(this.hooks.indexOf(hook), 1);
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    },
    newHook: function () {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, 'api/paypal/webhook_new.php', function (resp) {
        this.hooks.push({
          id: resp.hook_id,
          url: resp.url,
          event_types: [{
            name: 'BILLING.SUBSCRIPTION.CREATED'
          }, {
            name: 'BILLING.SUBSCRIPTION.CANCELLED'
          }, {
            name: 'BILLING.SUBSCRIPTION.RE-ACTIVATED'
          }, {
            name: 'BILLING.SUBSCRIPTION.SUSPENDED'
          }]
        });
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    }
  }
});

/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_err_panel__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__tool_util__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




__webpack_require__(10);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default.a
  },
  data: function () {
    var a = {
      is_warn: false,
      warn_text: '',
      list: []
    };
    return a;
  },
  created: function () {
    this.fetchData();
  },
  filters: {
    thousand: function (value) {
      return String(value).replace(/([^-])(?=(\d{3})+(\.\d\d)?$)/g, '$1,');
    }
  },
  methods: {
    fetchData: function () {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, 'api/admin/acc_stat.php', function (resp) {
        if (isArray(resp)) this.list = resp;else this.list = [];
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    }
  }
});

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_err_panel__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_campaign_tabs__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_campaign_tabs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_campaign_tabs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__tool_util__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_collapse__ = __webpack_require__(77);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_collapse___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_vue_collapse__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






__webpack_require__(13);

__webpack_require__(11);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default.a,
    'optimizer': __WEBPACK_IMPORTED_MODULE_2__components_campaign_tabs___default.a,
    Collapse: __WEBPACK_IMPORTED_MODULE_4_vue_collapse___default.a
  },
  data: function () {
    var a = {
      active: true,
      search: '',
      is_warn: false,
      warn_text: '',
      unpaid: false,
      valid_msg: '',
      campaign_roi: [],
      campaign_cpa: [],
      group_roi: [],
      group_cpa: [],
      select_roi: [],
      select_cpa: [],
      total_spent: 0,
      avg_spent: 0,
      total_revenue: 0,
      avg_revenue: 0,
      total_roi: 0,
      avg_roi: 0,
      roi_or_cpa: 1,
      outlier: false,
      from_date: null,
      // this.month_start(),
      to_date: null,
      // this.month_end(),
      kind_regress: 0,
      r2: [0, // auto-selected
      0, // linear
      0, // exponential
      0, // logarithmic
      0, // polynomial
      0],
      regressions: ['Auto Select', 'Linear', 'Exponential', 'Logarithmic', 'Polynomial', 'Power'],
      optimizer_list: []
    };
    return a;
  },
  mounted: function () {
    this.$parent.$on('toggleNav', () => {
      this.active = !this.active;
    });
  },
  created: function () {
    this.initDate();
    this.fetchData();
  },
  filters: {
    filterNum: function (num) {
      if (num == null || isNaN(num)) return 0;
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__tool_util__["b" /* round */])(num);
    }
  },
  computed: {
    groupsROI: function () {
      return this.group_roi.sort(function (a, b) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__tool_util__["a" /* strCompare */])(a.title, b.title);
      });
    },
    groupsCPA: function () {
      return this.group_cpa.sort(function (a, b) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__tool_util__["a" /* strCompare */])(a.title, b.title);
      });
    }
  },
  methods: {
    sortedROI: function (grp) {
      // slice is needed to prevent infinite render loop
      return this.campaign_roi[grp.id].slice().sort(function (a, b) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__tool_util__["a" /* strCompare */])(a.title.toLowerCase(), b.title.toLowerCase());
      }), this.campaign_roi[grp.id].slice().filter(post => {
        return post.title.toLowerCase().includes(this.search.toLowerCase());
      });
    },
    sortedCPA: function (grp) {
      // slice is needed to prevent infinite render loop
      return this.campaign_cpa[grp.id].slice().sort(function (a, b) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__tool_util__["a" /* strCompare */])(a.title.toLowerCase(), b.title.toLowerCase());
      }), this.campaign_cpa[grp.id].slice().filter(post => {
        return post.title.toLowerCase().includes(this.search.toLowerCase());
      });
    },
    fetchData: function () {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, "api/campaign/list.php", this.getResult, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    },

    getResult(resp) {
      this.select_roi = [];
      this.select_cpa = [];
      this.unpaid = resp.unpaid;
      if (isObject(resp.campaign_roi)) this.campaign_roi = resp.campaign_roi;else this.campaign_roi = [];
      if (isObject(resp.campaign_cpa)) this.campaign_cpa = resp.campaign_cpa;else this.campaign_cpa = [];
      if (isArray(resp.groups_roi) && resp.groups_roi.length) this.group_roi = resp.groups_roi;else this.group_roi = [];
      if (isArray(resp.groups_cpa) && resp.groups_cpa.length) this.group_cpa = resp.groups_cpa;else this.group_cpa = [];
    },

    initDate: function () {
      var todayTime = new Date();
      var year = todayTime.getFullYear();
      var month = todayTime.getMonth() + 1 > 9 ? todayTime.getMonth() + 1 : "0" + (todayTime.getMonth() + 1);
      var day = todayTime.getDate() > 9 ? todayTime.getDate() : "0" + todayTime.getDate();
      this.to_date = year + '-' + month + '-' + day;
      this.from_date = year - 1 + '-' + month + '-' + day;
    },
    doOptimal: function (list) {
      this.valid_msg = '';

      if (!list.length) {
        this.valid_msg = 'Please select at least 1 campaign';
        this.total_spent = 0;
        this.avg_spent = 0;
        this.total_revenue = 0;
        this.avg_revenue = 0;
        this.total_roi = 0;
        this.avg_roi = 0;
      } else if (!(this.$root.info && this.$root.info.confirmed)) this.valid_msg = '<b>Forbidden</b><br/>Confirm your e-mail first<br/>or <a href="#/profile" class="link">re-issue</a> another activation';else {
        this.kind_regress = 0;
        this.optimizer_list = list.slice();
      }
    },
    delCampaign: function (list) {
      if (!window.confirm('Do you really want to PERMANENTLY delete the selected campaigns ?')) return;
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, "api/campaign/delete.php", this.getResult, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      }, JSON.stringify(list));
    },
    toggleCollapsed: function (grp) {
      if (!grp.collapsed) {
        document.getElementById(grp.id).className = "fa fa-angle-down";
      } else if (grp.collapsed) {
        document.getElementById(grp.id).className = "fa fa-angle-up";
      }

      this.$set(grp, 'collapsed', !grp.collapsed);
    },
    toggleSelected: function (arr, list, grp) {
      var len = arr.length,
          i,
          idx;

      if (grp.checked == len) {
        // must exclude all members of group from list of selected
        for (i = 0; i < len; i++) {
          idx = list.indexOf(arr[i].id);
          if (idx != -1) list.splice(idx, 1);
        }

        grp.checked = 0;
      } else {
        // must include all members of group into list of selected
        for (i = 0; i < len; i++) {
          idx = list.indexOf(arr[i].id);
          if (idx == -1 && !arr[i].unpaid) list.push(arr[i].id); // skip campaigns over the free limit
        }

        grp.checked = len;
      }
    },
    showError: function (msg) {
      this.is_warn = true;
      this.warn_text = msg;
    },
    updHistory: function (history) {
      this.total_spent = history.total_spent;
      this.avg_spent = history.avg_spent;
      this.total_revenue = history.total_revenue;
      this.avg_revenue = history.avg_revenue;
      this.total_roi = history.total_roi;
      this.avg_roi = history.avg_roi; // update best fit R2
      //this.kind_regress = history.best_fit;

      this.r2 = history.r2;
    },

    /*
    month_start: function()
    {
      const d = new Date();
      d.setDate(1);
      return d.toISOString().substr(0,10);
    },
    month_end: function()
    {
      const d = new Date();
      d.setDate(0);
      d.setMonth(d.getMonth()+1);
      return d.toISOString().substr(0,10);
    }
    */
    removeElement: function (event, grp) {
      event.target.parentElement.setAttribute('style', 'display: none');

      if (grp.collapsed) {
        document.getElementById(grp.id + 'list').setAttribute('style', 'display: none');
      }
    },
    toggleNav: function (event) {
      this.$parent.$emit('toggleNav');

      if (this.active) {
        document.getElementById('collapseIcon').className = "fa fa-caret-left custom_collapse";
      } else {
        document.getElementById('collapseIcon').className = "fa fa-caret-right custom_collapse";
        event.target.parentElement.setAttribute('style', 'height: 678px');
      }
    }
  }
});

/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_optimize_single__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_optimize_single___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_optimize_single__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_optimize_solver__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_optimize_solver___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_optimize_solver__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lib_regression__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__calc_worker_js__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__calc_worker_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__calc_worker_js__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'camp': __WEBPACK_IMPORTED_MODULE_1__components_optimize_single___default.a,
    'solve': __WEBPACK_IMPORTED_MODULE_2__components_optimize_solver___default.a
  },
  props: {
    regression: {
      type: Number,
      default: 0
    },
    campaigns: {
      type: Array,
      default: function () {
        return [];
      }
    },
    outliers: // TRUE = remove outliers
    {
      type: Boolean,
      default: false
    },
    kind: {
      type: Number,
      default: 1 // 1 = ROI, any other = CPA

    },
    start: {
      type: String,
      default: ''
    },
    end: {
      type: String,
      default: ''
    },
    reg_names: {
      type: Array
    }
  },
  data: function () {
    var a = {
      cur_tab: 1,
      solved: false,
      combined: null,
      individual: [],
      history: {
        total_spent: 0,
        avg_spent: 0,
        total_revenue: 0,
        avg_revenue: 0,
        total_roi: 0,
        avg_roi: 0,
        best_fit: 0,
        r2: [0, 0, 0, 0, 0, 0] // equal to the number of regressions + 1 (for the Auto-fit)

      },
      worker: new __WEBPACK_IMPORTED_MODULE_4__calc_worker_js___default.a()
    };
    return a;
  },
  watch: {
    'regression': 'clear_optimal',
    //'outliers': 'recalc', -- removing outliers is destructive, we have to refresh the whole dataset from server
    'campaigns': 'update',
    'start': 'update',
    'end': 'update'
  },
  created: function () {
    // Setup an event listener that will handle messages received from the worker.
    this.worker.addEventListener('message', this.worker_ready, false);
    this.update();
  },
  beforeDestroy: function () {
    this.worker.terminate();
  },
  methods: {
    update: function () {
      if (this.campaigns.length == 0) {
        this.combined = null;
        this.individual = [];
      } else __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, "api/campaign/load.php", function (resp) {
        if (isArray(resp) && resp.length) {
          if (resp.length > 1) this.combined = resp.shift();else this.combined = resp[0];
          this.individual = resp;
          this.recalc();
        } else {
          this.combined = null;
          this.individual = [];
        }
      }, function (stat, resp) {
        this.$emit('error', resp);
      }, JSON.stringify({
        from: this.start,
        to: this.end,
        list: this.campaigns.join(',')
      }));
    },
    recalc: function (step) {
      console.log(this.individual, "individual values");
      console.log(this.combined, "cobined values");

      if (step == 2) {
        this.worker.postMessage({
          cmd: 2,
          param: this.individual,
          kind: parseInt(this.kind),
          regression: parseInt(this.regression),
          outliers: this.outliers
        });
      } else {
        this.solved = false;
        this.worker.postMessage({
          cmd: 1,
          param: this.combined,
          kind: parseInt(this.kind),
          regression: parseInt(this.regression),
          outliers: this.outliers
        });
      }
    },
    clear_optimal: function () {
      let i,
          camp = this.individual,
          len = camp.length;

      for (i = 0; i < len; i++) {
        camp[i].optimal_cost = 0;
      }
    },
    worker_ready: function (e) {
      switch (e.data.cmd) {
        case 1:
          // regression of combined data
          this.combined = e.data.param;
          this.recalc(2);
          let i,
              hist = this.history,
              points = this.combined.points,
              len = points.length,
              spent = 0,
              revenue = 0,
              projected;

          if (len > 0) {
            hist.r2 = this.combined.regressions.map(function (item) {
              return isNaN(item.r2) ? 0 : item.r2;
            });

            for (i = 0; i < len; i++) {
              spent += points[i][0];
              revenue += points[i][1];
            }

            hist.total_spent = spent;
            hist.total_revenue = revenue;
            hist.avg_spent = len ? spent / len : 0;
            hist.avg_revenue = len ? revenue / len : 0;
            projected = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__lib_regression__["a" /* predict */])(spent, this.combined.best_fit, this.combined.regressions[0].equation);
            hist.total_roi = this.kind == 1 ? spent ? 100 * (projected - spent) / spent : 0 : projected ? spent / projected : 0;
            hist.avg_roi = len ? hist.total_roi / len : 0;
            this.$emit('history', hist);
            break;
          }

        case 2:
          // regressions of individual campaigns
          this.individual = e.data.param;
          this.solved = true;
          break;

        case 3:
          // progress indicator
          break;
      }
    },
    solverResult: function (res) {
      var i,
          len = res.length;

      for (i = 0; i < len; i++) this.individual[i].optimal_cost = res[i];
    },
    showErr: function (msg) {
      this.$emit('error', msg);
    }
  }
});

/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config__ = __webpack_require__(7);
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: ['value', 'warn'],
  data: function () {
    var a = {
      notifTimeout: null,
      msg: this.value
    };
    return a;
  },
  watch: {
    'value': 'newText'
  },
  methods: {
    newText() {
      if (this.value == null || this.value == '') {
        this.msg = '';
        return;
      } // \s\S is workaround for "." not matching on CRLF


      var tmp;
      if (this.value.indexOf('<html') != -1) tmp = this.value.replace(/^[\s\S]+<body[^>]*>/i, '').replace(/<\/body>[\s\S]*$/i, '');else tmp = this.value; //if(this.warn) console.log(tmp);

      this.msg = tmp; //'<pre>' + tmp.replace(/(?:\r\n|\r|\n)/g,'<br/>') + '</pre>';

      if (this.notifTimeout != null) clearTimeout(this.notifTimeout);
      var self = this;
      this.notifTimout = setTimeout(function () {
        self.notifTimout = null;
        self.msg = ''; // TEXT must be cleared by the parent component, otherwise subsequent errors with the exact same text will be ignored

        self.$emit('input', '');
      }, this.warn ? __WEBPACK_IMPORTED_MODULE_0__config__["a" /* default */].warn_time : __WEBPACK_IMPORTED_MODULE_0__config__["a" /* default */].info_time);
    }

  }
});

/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_err_panel__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__tool_util__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__tool_util_file__ = __webpack_require__(57);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





__webpack_require__(13);

__webpack_require__(15);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default.a
  },
  data: function () {
    var a = {
      is_warn: false,
      warn_text: '',
      unpaid: false,
      campaign_roi: [],
      campaign_cpa: [],
      cpa_client_customer_id: null,
      roi_client_customer_id: null,
      group_roi: [],
      group_cpa: [],
      new_roi: '',
      // name for the new campaign
      new_cpa: '',
      // name for the new campaign
      old_roi: 0,
      // ID of the old campaign
      old_cpa: 0,
      // ID of the old campaign
      file_roi_new: [],
      file_roi_old: [],
      file_cpa_new: [],
      file_cpa_old: [],
      no_multi_roi: false,
      // TRUE = treat files with multiple campaigns as files with single-campaign
      combine_roi: false,
      // TRUE = combine all files into one campaign, group name is the name of this campaign
      no_multi_cpa: false,
      // TRUE = treat files with multiple campaigns as files with single-campaign
      combine_cpa: false // TRUE = combine all files into one campaign, group name is the name of this campaign

    };
    return a;
  },
  created: function () {
    this.fetchData();
  },
  computed: {
    groupsROI: function () {
      return this.group_roi.sort(function (a, b) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["a" /* strCompare */])(a.title, b.title);
      });
    },
    groupsCPA: function () {
      return this.group_cpa.sort(function (a, b) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["a" /* strCompare */])(a.title, b.title);
      });
    }
  },
  methods: {
    refreshInfo: function (arr) {
      this.unpaid = arr.unpaid;
      if (isObject(arr.campaign_roi)) this.campaign_roi = arr.campaign_roi;else this.campaign_roi = [];
      if (isObject(arr.campaign_cpa)) this.campaign_cpa = arr.campaign_cpa;else this.campaign_cpa = [];
      if (isArray(arr.groups_roi) && arr.groups_roi.length) this.group_roi = arr.groups_roi;else this.group_roi = [];
      if (isArray(arr.groups_cpa) && arr.groups_cpa.length) this.group_cpa = arr.groups_cpa;else this.group_cpa = [];
    },
    fetchData: function () {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, "api/campaign/list.php", this.refreshInfo, function (stat, resp) {
        make_error.call(this, resp);
      });
    },
    doUpload: function (operation, kind, file_list, campaign_id, campaign_name) {
      if (operation == 1 && campaign_name.trim() == '') make_error.call(this, 'Missing group name');else if (operation != 1 && campaign_id == 0) make_error.call(this, 'Please choose a campaign');else if (file_list.length != 0) {
        var i,
            payload = new FormData(),
            len = file_list.length;

        for (i = 0; i < len; i++) {
          payload.append('excel_' + i, file_list[i]);
        }

        __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, "api/campaign/import.php?kind=" + kind + "&operation=" + operation + "&id=" + campaign_id + "&no_multi=" + ((kind == 1 ? this.no_multi_roi : this.no_multi_cpa) ? '1' : '0') + "&combine=" + ((kind == 1 ? this.combine_roi : this.combine_cpa) ? '1' : '0') + "&name=" + encodeURIComponent(campaign_name || ''), function (resp) {
          this.is_warn = false;
          this.warn_text = 'Data was successfully imported - ' + resp.imported + ' records';
          this.refreshInfo(resp);

          if (kind == 1) {
            if (operation == 1) {
              this.new_roi = '';
              this.file_roi_new = [];
              __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__tool_util_file__["a" /* clearFileInput */])(this.$refs.file_new_roi);
            } else {
              this.old_roi = 0;
              this.file_roi_old = [];
              __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__tool_util_file__["a" /* clearFileInput */])(this.$refs.file_old_roi);
            }
          } else {
            if (operation == 1) {
              this.new_cpa = '';
              this.file_cpa_new = [];
              __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__tool_util_file__["a" /* clearFileInput */])(this.$refs.file_new_cpa);
            } else {
              this.old_cpa = 0;
              this.file_cpa_old = [];
              __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__tool_util_file__["a" /* clearFileInput */])(this.$refs.file_old_cpa);
            }
          }
        }, function (stat, resp) {
          make_error.call(this, resp);
        }, payload);
      }
    },
    connectAPI: function (data_type) {
      var customer_id = data_type == 1 ? this.roi_client_customer_id : this.cpa_client_customer_id; // AJAX.ajax_get(this,"api/google/connect_api.php?data_type=" + data_type + "&customer_id=" + customer_id,
      //     function (resp)
      //     {
      //       window.open(resp.url, '_self');
      //     },
      //     function (stat,resp)
      //     {
      //       make_error.call(this,resp);
      //     }
      //   )

      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, "api/google/connect_api.php?data_type=" + data_type, function (resp) {
        window.open(resp.url, '_self');
      }, function (stat, resp) {
        make_error.call(this, resp);
      });
    },
    connectROIAPI: function () {
      // if(!this.roi_client_customer_id) make_error.call(this,'Missing client customer id');
      // else this.connectAPI(1);
      this.connectAPI(1);
    },
    connectConversionAPI: function () {
      if (!this.cpa_client_customer_id) make_error.call(this, 'Missing client customer id');else this.connectAPI(2);
    },
    sortedROI: function (grp) {
      return this.campaign_roi[grp.id].slice().sort(function (a, b) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["a" /* strCompare */])(a.title.toLocaleLowerCase(), b.title.toLocaleLowerCase());
      });
    },
    sortedCPA: function (grp) {
      return this.campaign_cpa[grp.id].slice().sort(function (a, b) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["a" /* strCompare */])(a.title.toLocaleLowerCase(), b.title.toLocaleLowerCase());
      });
    },
    uploadROI: function () {
      this.doUpload(1, 1, this.file_roi_new, 0, this.new_roi);
    },
    uploadCPA: function () {
      this.doUpload(1, 2, this.file_cpa_new, 0, this.new_cpa);
    },
    appendROI: function () {
      this.doUpload(2, 1, this.file_roi_old, this.old_roi);
    },
    appendCPA: function () {
      this.doUpload(2, 2, this.file_cpa_old, this.old_cpa);
    },
    updateROI: function () {
      this.doUpload(3, 1, this.file_roi_old, this.old_roi);
    },
    updateCPA: function () {
      this.doUpload(3, 2, this.file_cpa_old, this.old_cpa);
    },
    replaceROI: function () {
      this.doUpload(4, 1, this.file_roi_old, this.old_roi);
    },
    replaceCPA: function () {
      this.doUpload(4, 2, this.file_cpa_old, this.old_cpa);
    },
    newFileROI: function (e) {
      this.file_roi_new = e.target.files || e.dataTransfer.files;
    },
    oldFileROI: function (e) {
      this.file_roi_old = e.target.files || e.dataTransfer.files;
    },
    newFileCPA: function (e) {
      this.file_cpa_new = e.target.files || e.dataTransfer.files;
    },
    oldFileCPA: function (e) {
      this.file_cpa_old = e.target.files || e.dataTransfer.files;
    }
  }
});

function make_error(err) {
  this.is_warn = true;
  this.warn_text = err;
}

/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__template_json__ = __webpack_require__(126);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__template_json___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__template_json__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_highcharts__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_highcharts___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_highcharts__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__tool_util__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__lib_regression__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__calc_worker_js__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__calc_worker_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__calc_worker_js__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//







__webpack_require__(11);

__webpack_require__(19);

/* harmony default export */ __webpack_exports__["default"] = ({
  data: function () {
    var a = {
      video_list: [{
        title: 'Intro & Theory',
        video: 'S4UDgI7VLIk'
      }, {
        title: 'Import Data',
        video: '5RmN5kyzxmU'
      }, {
        title: 'Understanding the Output',
        video: '0RGYaLLZiLE'
      }],
      var_cost: 0,
      combined: null,
      individual: [],
      optimal_cost: 0,
      optimal_value: 0,
      // either Revenue or Conversions
      optimum: 0,
      kind: 1,
      defaultList: 0,
      worker: new __WEBPACK_IMPORTED_MODULE_5__calc_worker_js___default.a()
    };
    return a;
  },
  created: function () {
    // Setup an event listener that will handle messages received from the worker.
    this.worker.addEventListener('message', this.worker_ready, false);
  },
  beforeDestroy: function () {
    this.worker.terminate();
  },
  mounted: function () {
    //this.defaultData();
    this.combined = __WEBPACK_IMPORTED_MODULE_0__template_json___default.a[0];
    this.recalc();
  },
  computed: {
    max_value: function () {
      // compute the cost for the max ROI or max CPA - using the predicted values from regression
      var i,
          p,
          cost = 5000,
          tmp,
          points = this.combined.regressions[3].points,
          len = points.length;

      for (i = 0; i < len; i++) {
        p = points[i];

        if (p[0] > cost) {
          cost = p[0];
        }
      }

      cost = Math.min(cost, 10000);
      return cost;
    }
  },
  filters: {
    filterNum: function (num) {
      if (num == null || isNaN(num)) return 0;
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["b" /* round */])(num);
    }
  },
  methods: {
    setPoint: function () {
      this.chart.destroy();
      var reg_data = this.combined.regressions[3].points.sort(function (a, b) {
        return a[0] - b[0];
      }).map(function (item) {
        if (item[1] < 0) item[1] = 0;
        return item;
      });
      if (this.chart != null) this.chart = null;
      __WEBPACK_IMPORTED_MODULE_1_highcharts___default.a.setOptions({
        lang: {
          thousandsSep: ''
        }
      });
      this.chart = __WEBPACK_IMPORTED_MODULE_1_highcharts___default.a.chart({
        chart: {
          renderTo: 'graph' + this._uid,
          type: 'scatter',
          zoomType: 'xy'
        },
        title: {
          text: 'Regression Cost'
        },
        xAxis: {
          min: 0,
          ceiling: 10000,
          title: {
            enabled: true,
            text: 'Cost'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        yAxis: {
          title: {
            text: 'Conversion'
          }
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 90,
          y: 60,
          floating: true,
          backgroundColor: '#FFFFFF',
          borderWidth: 1
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 3,
              lineColor: "#0000ff",
              states: {
                hover: {
                  enabled: true,
                  lineColor: '#0000ff'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
            tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              pointFormat: '{point.x}, {point.y}'
            }
          },
          series: {
            animation: false
          }
        },
        series: [{
          name: 'Day (Cost, Conversion)',
          color: 'rgba(223, 83, 83, .5)',
          data: this.combined.points
        }, {
          name: 'State',
          color: "blue",
          data: [[this.var_cost * Math.abs(1), this.projected_value(this.var_cost)]]
        }, {
          name: 'Day (Cost, Conversion)',
          data: reg_data,
          color: 'rgba(40, 100, 255, .9)',
          lineWidth: 2,
          type: 'line',
          dashStyle: 'solid',
          marker: {
            enabled: false
          },
          showInLegend: false
        }],
        credits: {
          enabled: false
        }
      });
    },

    start_video(item) {
      if (!item.clicked) this.$set(item, 'clicked', true);
    },

    projected_value: function (cost) {
      return Math.min(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__lib_regression__["a" /* predict */])(cost, 3, this.combined.regressions[3].equation), 10000);
    },
    projected_roi: function (cost, revenue) {
      return this.kind == 1 ? cost ? 100 * (revenue - cost) / cost : 0 : revenue ? cost / revenue : 0;
    },
    recalc: function (step) {
      this.solved = false; //this.combined = JSON.parse(myJson);
      // console.log(this.combined);
      // console.log(myJson[0]);

      this.worker.postMessage({
        cmd: 1,
        param: this.combined,
        regression: 3
      });
    },
    worker_ready: function (e) {
      switch (e.data.cmd) {
        case 1:
          // regression of combined data
          this.combined = e.data.param;
          this.initChart();
          break;
      }
    },
    optimal_regress: function () {
      var optimum = 1000000,
          optimal_cost = 0,
          tmp;
      if (this.kind == 1) optimum = 0;

      for (var v_cost = 0; v_cost <= this.max_value; v_cost += 0.01) {
        tmp = Math.round(100 * this.projected_roi(v_cost, this.projected_value(v_cost))) / 100;

        if (this.kind == 1) {
          if (optimum < tmp) {
            optimum = tmp;
            optimal_cost = v_cost;
          }
        } else if (tmp > 0 && optimum > tmp) {
          optimum = tmp;
          optimal_cost = v_cost;
        }
      }

      this.optimum = optimum;
      this.optimal_cost = optimal_cost;
      this.optimal_value = this.projected_value(optimal_cost);

      if (this.kind == 1) {
        // the cost with maximum ROI
        this.optimal_result = (this.optimum < 0 ? '<span style="color:red">' + this.optimum + '</span>' : this.optimum) + '% (' + this.optimal_cost.toFixed(2) + '/' + this.optimal_value.toFixed(2) + ')';
      } else {
        // the cost with minimum CPA
        this.optimal_result = this.optimum + ' (' + this.optimal_cost.toFixed(2) + '/' + this.optimal_value.toFixed(2) + ')';
      }
    },
    defaultData: function () {
      __WEBPACK_IMPORTED_MODULE_3__tool_ajax__["a" /* default */].ajax_get(this, "api/campaign/default.php", this.getResult, function (stat, resp) {});
    },

    getResult(resp) {
      this.defaultList = resp.id;
      this.init_Data();
      console.log("default", this.defaultList);
    },

    init_Data: function () {
      __WEBPACK_IMPORTED_MODULE_3__tool_ajax__["a" /* default */].ajax_post(this, "api/campaign/load.php", function (resp) {
        if (isArray(resp) && resp.length) {
          if (resp.length > 1) this.combined = resp.shift();else {
            this.combined = resp[0];
          }
          this.individual = resp;
          this.recalc();
        } else {
          this.combined = null;
          this.individual = [];
        }
      }, function (stat, resp) {
        this.$emit('error', resp);
      }, JSON.stringify({
        list: this.defaultList
      }));
    },
    initChart: function () {
      this.optimal_regress();
      var reg_data = this.combined.regressions[3].points.sort(function (a, b) {
        return a[0] - b[0];
      }).map(function (item) {
        if (item[1] < 0) item[1] = 0;
        return item;
      });
      if (this.chart != null) this.chart = null;
      __WEBPACK_IMPORTED_MODULE_1_highcharts___default.a.setOptions({
        lang: {
          thousandsSep: ''
        }
      });
      this.chart = __WEBPACK_IMPORTED_MODULE_1_highcharts___default.a.chart({
        chart: {
          renderTo: 'graph' + this._uid,
          type: 'scatter',
          zoomType: 'xy'
        },
        title: {
          text: 'Regression Cost'
        },
        xAxis: {
          min: 0,
          ceiling: 10000,
          title: {
            enabled: true,
            text: 'Cost'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        yAxis: {
          title: {
            text: 'Conversion'
          }
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 90,
          y: 60,
          floating: true,
          backgroundColor: '#FFFFFF',
          borderWidth: 1
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 3,
              lineColor: "#0000ff",
              states: {
                hover: {
                  enabled: true,
                  lineColor: '#0000ff'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
            tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              pointFormat: '{point.x}, {point.y}'
            }
          },
          series: {
            animation: false
          }
        },
        series: [{
          name: 'Day (Cost, ' + 'Conversion' + ')',
          color: 'rgba(223, 83, 83, .5)',
          data: this.combined.points
        }, {
          name: 'Day (Cost, ' + 'Conversion' + ')',
          data: reg_data,
          color: 'rgba(40, 100, 255, .9)',
          lineWidth: 2,
          type: 'line',
          dashStyle: 'solid',
          marker: {
            enabled: false
          },
          showInLegend: false
        }],
        credits: {
          enabled: false
        }
      });
    }
  }
});

/***/ }),
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


__webpack_require__(6);

/* harmony default export */ __webpack_exports__["default"] = ({
  data: function () {
    var a = {
      username: '',
      password: '',
      cant_login: ''
    };
    return a;
  },
  created: function () {
    this.checkLogin();
  },
  methods: {
    checkLogin: function () {
      if (this.$root.is_loged) this.lastStep();
    },
    doLogin: function () {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, "api/login/login.php", function (resp) {
        this.cant_login = '';
        this.lastStep();
      }, function (stat, resp) {
        this.cant_login = resp;
        this.$refs.username.focus();
      }, "username=" + encodeURIComponent(this.username) + "&password=" + encodeURIComponent(this.password));
    },
    lastStep: function () {
      if (this.$root.go_back != '') {
        var tmp = this.$root.go_back;
        this.$root.go_back = '';
        this.$router.replace(tmp); // go to previous page but already logged in
      } else this.$router.push('/');
    }
  }
});

/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


__webpack_require__(6);

/* harmony default export */ __webpack_exports__["default"] = ({
  data: function () {
    var a = {
      password: '',
      password2: '',
      cant_reset: ''
    };
    return a;
  },
  created: function () {
    if (this.$route.params.token.trim() == '') this.$router.replace('/');
  },
  methods: {
    doSignup: function () {
      var err;
      if (this.password.trim() == '') this.cant_reset = 'Missing password';else if (this.password2.trim() == '') this.cant_reset = 'Missing 2nd password';else if (this.password.trim() != this.password2.trim()) this.cant_reset = 'Passwords are different';else {
        __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, "api/login/new_pass.php", function (resp) {
          if (resp.reset) {
            this.cant_reset = '';
            this.$router.replace('/login'); // you still have to login with your username - no automatic logins
          } else this.cant_reset = 'There was an error sending the confirmation e-mail';
        }, function (stat, resp) {
          this.cant_reset = resp;
          this.$refs.password.focus();
        }, "password=" + encodeURIComponent(this.password.trim()) + "&password2=" + encodeURIComponent(this.password2.trim()) + "&token=" + encodeURIComponent(this.$route.params.token));
      }
    }
  }
});

/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


__webpack_require__(6);

/* harmony default export */ __webpack_exports__["default"] = ({
  data: function () {
    var a = {
      username: '',
      email: '',
      sent: false,
      cant_reset: ''
    };
    return a;
  },
  created: function () {
    this.checkLogin();
  },
  methods: {
    checkLogin: function () {
      if (this.$root.is_loged) this.$router.replace('/profile');
    },
    doSignup: function () {
      var mail = this.email.trim();
      if (this.username.trim() == '') this.cant_reset = 'Missing username'; //else if(mail=='') this.cant_reset = 'Missing e-mail address';
      else {
          __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, "api/login/reset.php", function (resp) {
            if (resp.reset) {
              this.cant_reset = '';
              this.sent = true;
            } else this.cant_reset = 'There was an error sending the e-mail';
          }, function (stat, resp) {
            this.cant_reset = resp;
            this.$refs.username.focus();
          }, "user=" + encodeURIComponent(this.username.trim()) //+"&email="+encodeURIComponent(mail)
          );
        }
    }
  }
});

/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_email__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tool_ajax__ = __webpack_require__(1);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



__webpack_require__(6);

/* harmony default export */ __webpack_exports__["default"] = ({
  data: function () {
    var a = {
      username: '',
      password: '',
      password2: '',
      email: '',
      cant_signup: '',
      industry_id: '0',
      list_industry: [],
      permit_agregate: true
    };
    return a;
  },
  created: function () {
    this.checkLogin();
  },
  methods: {
    checkLogin: function () {
      if (this.$root.is_loged) this.$router.replace('/profile');else __WEBPACK_IMPORTED_MODULE_1__tool_ajax__["a" /* default */].ajax_get(this, 'api/login/industry.php', function (resp) {
        if (isArray(resp)) this.list_industry = resp;
      }, function (stat, resp) {
        this.cant_signup = resp;
        this.$refs.username.focus();
      });
    },
    doSignup: function () {
      var err;
      if (this.username.trim() == '') this.cant_signup = 'Missing username';else if (this.password.trim() == '') this.cant_signup = 'Missing password';else if (this.password2.trim() == '') this.cant_signup = 'Missing 2nd password';else if (this.password.trim() != this.password2.trim()) this.cant_signup = 'Passwords are different';else if (+this.industry_id < 1) this.cant_signup = 'Please specify your industry';else if ((err = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__tool_email__["a" /* checkMail */])(this.username.trim())) != '') this.cant_signup = err;else {
        __WEBPACK_IMPORTED_MODULE_1__tool_ajax__["a" /* default */].ajax_post(this, "api/login/signup.php", function (resp) {
          if (resp.signup) {
            this.cant_signup = '';
            this.$router.push('/profile'); // default route on 1-st signup
          } else this.cant_signup = 'There was an error sending the confirmation e-mail';
        }, function (stat, resp) {
          this.cant_signup = resp;
          this.$refs.username.focus();
        }, "username=" + encodeURIComponent(this.username.trim()) + "&password=" + encodeURIComponent(this.password.trim()) + "&password2=" + encodeURIComponent(this.password2.trim()) + "&industry=" + encodeURIComponent(this.industry_id) + "&permit=" + (this.permit_agregate ? '1' : '0'));
      }
    }
  }
});

/***/ }),
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_err_panel__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__single__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__single___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__single__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__solver__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__solver___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__solver__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_1__components_err_panel___default.a,
    'camp': __WEBPACK_IMPORTED_MODULE_2__single___default.a,
    'solve': __WEBPACK_IMPORTED_MODULE_3__solver___default.a
  },
  data: function () {
    var a = {
      is_warn: false,
      warn_text: '',
      info: [],
      reg_data: [],
      // slope and offset from regression, for each campaign - keyed by campaign ID
      solved: 0,
      combined: []
    };
    return a;
  },
  created: function () {
    this.fetchData();
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    fetchData: function () {
      if (this.$route.params.list == null || this.$route.params.list.trim() == '') this.$router.replace('/campaigns');else __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, "api/campaign/load.php", function (resp) {
        if (isArray(resp) && resp.length) {
          this.info = resp;
          this.solved = resp.length;
          this.reg_data = new Array(resp.length);
        } else {
          this.info = [];
          this.reg_data = [];
        }
      }, function (stat, resp) {
        this.reg_data = [];
        this.is_warn = true;
        this.warn_text = resp;
      }, JSON.stringify({
        //from: YYYY-MM-DD,
        //to: YYYY-MM-DD,
        list: this.$route.params.list
      }));
    },
    solverParam: function (idx, slope, ofs
    /*,improve*/
    ) {
      if (this.solved > 0) this.solved--;
      this.reg_data[idx] = {
        title: this.info[idx].title,
        slope: slope,
        ofs: ofs,
        improve: 0,
        // improve,
        min_cost: 0,
        max_cost: 0,
        optimal_cost: 0
      };
    },
    solverResult: function (res) {
      if (res.length > 1) res.unshift(0);
      this.reg_data = this.reg_data.map(function (item, idx) {
        item.optimal_cost = res[idx];
        return item;
      });
    },
    showErr: function (err) {
      this.is_warn = true;
      this.warn_text = err;
    }
  }
});

/***/ }),
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_highcharts__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_highcharts___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_highcharts__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_regression__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__tool_util__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




__webpack_require__(19);

__webpack_require__(11);

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    campaign: {
      type: Object
    },
    kind: // 1 = ROI, 2 = CPA
    {
      type: Number,
      default: 1
    },
    type_reg: {
      type: Number
    },
    reg_names: {
      type: Array
    }
  },
  data: function () {
    var a = {
      chart: null,
      optimal_cost: 0,
      optimal_value: 0,
      // either Revenue or Conversions
      optimum: 0,
      // either ROI or CPA
      optimal_result: '',
      // used by the Legend
      var_cost: 0,
      minValue: 0,
      maxValue: 0
    };
    return a;
  },
  mounted: function () {
    // this.initEnv();
    this.initChart();
  },
  watch: {
    'campaign': 'initChart',
    'type_reg': 'initChart'
  },
  filters: {
    filterNum: function (num) {
      if (num == null || isNaN(num)) return 0;
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__tool_util__["b" /* round */])(num);
    }
  },
  computed: {
    reg_type: function () {
      return this.type_reg ? this.type_reg : this.campaign.best_fit;
    },
    regression: function () {
      return this.campaign.regressions[this.reg_type];
    },
    text_kind: function () {
      return this.kind == 1 ? 'Revenue' : 'Conversions';
    },
    optimal_text: function () {
      return this.kind == 1 ? 'Max ROI' : 'Min CPA';
    },
    campaign_kind: function () {
      return this.kind == 1 ? 'ROI' : 'CPA';
    },
    max_value: function () {
      // compute the cost for the max ROI or max CPA - using the predicted values from regression
      var i,
          p,
          cost = 5000,
          tmp,
          points = this.regression.points,
          len = points.length;

      for (i = 0; i < len; i++) {
        p = points[i];

        if (p[0] > cost) {
          cost = p[0];
        }
      }

      cost = Math.min(cost, 10000);
      return cost;
    }
  },
  methods: {
    moveGreenLine: function () {
      this.initChart();
      this.optimal_regress();
      this.var_cost = 0;
      var reg_data = this.regression.points.sort(function (a, b) {
        return a[0] - b[0];
      }).map(function (item) {
        if (item[1] < 0) item[1] = 0;
        return item;
      });
      if (this.chart != null) this.chart = null;
      __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.setOptions({
        lang: {
          thousandsSep: ''
        }
      });
      this.chart = __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.chart({
        chart: {
          renderTo: 'graph' + this._uid,
          type: 'scatter',
          zoomType: 'xy',
          height: 9 / 16 * 100 + '%'
        },
        title: {
          text: 'Cost vs ' + this.text_kind
        },
        xAxis: {
          min: 0,
          ceiling: 10000,
          title: {
            enabled: true,
            text: 'Cost'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        yAxis: {
          title: {
            text: this.text_kind
          }
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 90,
          y: 60,
          floating: true,
          backgroundColor: '#FFFFFF',
          borderWidth: 1
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 3,
              lineColor: "#0000ff",
              states: {
                hover: {
                  enabled: true,
                  lineColor: '#0000ff'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
            tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              pointFormat: '{point.x}, {point.y}'
            }
          },
          series: {
            animation: false
          }
        },
        series: [{
          name: 'Day (Cost, ' + this.text_kind + ')',
          color: 'rgba(223, 83, 83, .5)',
          data: this.campaign.points
        }, {
          name: 'Fit',
          color: 'blue',
          data: [[this.var_cost * Math.abs(-1), this.projected_value(this.var_cost)]]
        }, {
          name: '(Cost, ' + this.campaign_kind + ')',
          data: reg_data,
          color: 'rgba(40, 100, 255, .9)',
          lineWidth: 2,
          type: 'line',
          dashStyle: 'solid',
          marker: {
            enabled: false
          },
          showInLegend: false
        }, {
          data: [[reg_data[1][0], 0], [reg_data[1][0], this.optimal_value * 2]],
          color: 'rgba(70, 160, 50, .9)',
          lineWidth: 3,
          type: 'line',
          dashStyle: 'solid',
          name: this.optimal_text + ' = ' + this.optimal_result,
          showInLegend: false
        }],
        credits: {
          enabled: false
        }
      });
    },
    setPoint: function () {
      this.optimal_regress();
      var reg_data = this.regression.points.sort(function (a, b) {
        return a[0] - b[0];
      }).map(function (item) {
        if (item[1] < 0) item[1] = 0;
        return item;
      });
      if (this.chart != null) this.chart = null;
      __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.setOptions({
        lang: {
          thousandsSep: ''
        }
      });
      var reg_data1 = this.regression.points1.sort(function (a, b) {
        return a[0] - b[0];
      }).map(function (item) {
        if (item[1] < 0) item[1] = 0;
        return item;
      });
      var counter = 0;
      var maxValue = reg_data.length;
      console.log(this.campaign_kind);

      if (this.campaign_kind == 'CPA') {
        console.log("is this CPA?");

        for (var i = 0; i < maxValue; i++) {
          if (reg_data[i][1] == 0) continue;
          reg_data1[counter] = [reg_data[i][0], reg_data[i][0] / reg_data[i][1]];
          counter++;
        }
      } else {
        console.log("is this ROI?");

        for (var i = 0; i < maxValue; i++) {
          if (reg_data[i][0] == 0) continue;
          reg_data1[counter] = [reg_data[i][0], (reg_data[i][1] - reg_data[i][0]) / reg_data[i][0]];
          counter++;
        }
      }

      var reg_points1 = reg_data1.sort(function (a, b) {
        return a[0] - b[0];
      }).map(function (item) {
        if (item[1] < 0) item[1] = 0;
        return item;
      });
      if (this.chart != null) this.chart = null;
      __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.setOptions({
        lang: {
          thousandsSep: ''
        }
      });
      this.chart = __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.chart({
        chart: {
          renderTo: 'graph' + this._uid,
          type: 'scatter',
          zoomType: 'xy',
          height: 9 / 16 * 100 + '%'
        },
        title: {
          text: 'Cost vs ' + this.text_kind
        },
        xAxis: {
          min: 0,
          ceiling: 10000,
          title: {
            enabled: true,
            text: 'Cost'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        yAxis: {
          title: {
            text: this.text_kind
          }
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 90,
          y: 60,
          floating: true,
          backgroundColor: '#FFFFFF',
          borderWidth: 1
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 3,
              lineColor: "#0000ff",
              states: {
                hover: {
                  enabled: true,
                  lineColor: '#0000ff'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
            tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              pointFormat: '{point.x}, {point.y}'
            }
          },
          series: {
            animation: false
          }
        },
        series: [{
          name: 'Day (Cost, ' + this.text_kind + ')',
          color: 'rgba(223, 83, 83, .5)',
          data: this.campaign.points
        }, {
          name: 'Fit',
          color: 'blue',
          data: [[this.var_cost * Math.abs(-1), this.projected_value(this.var_cost)]]
        }, {
          data: reg_data,
          color: 'rgba(40, 100, 255, .9)',
          lineWidth: 2,
          type: 'line',
          dashStyle: 'solid',
          marker: {
            enabled: false
          },
          name: '(Cost, ' + this.text_kind + ')',
          showInLegend: false
        }, {
          data: [[this.optimal_cost, 0], [this.optimal_cost, this.optimal_value * 2]],
          color: 'rgba(70, 160, 50, .9)',
          lineWidth: 3,
          type: 'line',
          dashStyle: 'solid',
          name: this.optimal_text + ' = ' + this.optimal_result,
          showInLegend: false
        }],
        credits: {
          enabled: false
        }
      });
      this.chart = __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.chart({
        chart: {
          renderTo: 'graph1' + this._uid,
          type: 'scatter',
          zoomType: 'xy',
          height: 9 / 16 * 100 + '%'
        },
        title: {
          text: 'Cost vs ' + this.campaign_kind
        },
        xAxis: {
          min: 0,
          ceiling: 10000,
          title: {
            enabled: true,
            text: 'Cost'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        yAxis: {
          title: {
            text: this.campaign_kind
          }
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 90,
          y: 60,
          floating: true,
          backgroundColor: '#FFFFFF',
          borderWidth: 1
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 3,
              lineColor: "#0000ff",
              states: {
                hover: {
                  enabled: true,
                  lineColor: '#0000ff'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
            tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              pointFormat: '{point.x}, {point.y}'
            }
          },
          series: {
            animation: false
          }
        },
        series: [{
          name: 'Fit',
          color: 'blue',
          data: [[this.var_cost * Math.abs(-1), this.var_cost / this.projected_value(this.var_cost)]]
        }, {
          data: reg_data1,
          color: 'rgba(40, 100, 255, .9)',
          lineWidth: 2,
          type: 'line',
          dashStyle: 'solid',
          marker: {
            enabled: false
          },
          name: '(Cost vs ' + this.campaign_kind + ')',
          showInLegend: false
        }],
        credits: {
          enabled: false
        }
      });
    },
    projected_value: function (cost) {
      return Math.min(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__lib_regression__["a" /* predict */])(cost, this.reg_type, this.regression.equation), 10000);
    },
    projected_optimal: function (cost) {
      return this.projected_roi(cost, this.projected_value(cost));
    },
    projected_roi: function (cost, revenue) {
      return this.kind == 1 ? cost ? 100 * (revenue - cost) / cost : 0 : revenue ? cost / revenue : 0;
    },
    optimal_regress: function () {
      console.log(this.regression.string2, "strinng2");
      console.log("Fdsfdsfdsfdsfdsfsdfdsfds");
      var optinum_min, optinum_max;
      var optimum = 1000000,
          tmp;
      var optimal_cost = 0;

      switch (this.reg_type) {
        case 1:
          if (this.kind != 1) {
            optinum_min = Math.min(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100);
            if (optinum_min == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else optimal_cost = this.max_value;
          } else {
            optinum_max = Math.max(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100);
            if (optinum_max == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else optimal_cost = this.max_value;
          }

          break;

        case 2:
          var b = this.regression.equation[1];
          var a = this.regression.equation[0];

          if (this.kind != 1) {
            if (b == 0) {
              optinum_min = Math.ceil(0.01 / a * 100) / 100;
              optimal_cost = 0.01;
            } else {
              optinum_min = Math.min(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100, Math.round(100 * this.projected_roi(1 / b, this.projected_value(1 / b))) / 100);
              if (optinum_min == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else if (optinum_min == Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100) optimal_cost = this.max_value;else optimal_cost = 1 / b;
            }
          } else {
            if (b == 0) {
              optinum_max = Math.ceil((a - 0.01) / 0.01 * 100);
              optimal_cost = 0.01;
            } else {
              optinum_max = Math.max(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100, Math.round(100 * this.projected_roi(1 / b, this.projected_value(1 / b))) / 100);
              if (optinum_max == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else if (optinum_max == Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100) optimal_cost = this.max_value;else optimal_cost = 1 / b;
            }
          }

          break;

        case 3:
          console.log(this.regression.equation, "e");

          if (this.kind != 1) {
            optinum_min = Math.min(Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100, Math.round(100 * this.projected_roi(Math.exp(1 - this.regression.equation[0] / this.regression.equation[1]), this.projected_value(Math.exp(1 - this.regression.equation[0] / this.regression.equation[1])))) / 100);
            if (optinum_min == Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100) optimal_cost = this.max_value;else optimal_cost = Math.exp(1 - this.regression.equation[0] / this.regression.equation[1]);
          } else {
            optinum_max = Math.max(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100, Math.round(100 * this.projected_roi(Math.exp(1 - this.regression.equation[0] / this.regression.equation[1]), this.projected_value(Math.exp(1 - this.regression.equation[0] / this.regression.equation[1])))) / 100);
            if (optinum_max == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else if (optinum_max == Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100) optimal_cost = this.max_value;else optimal_cost = Math.exp(1 - this.regression.equation[0] / this.regression.equation[1]);
          }

          break;

        case 4:
          if (this.kind != 1) {
            var a = this.regression.equation[0];
            var b = this.regression.equation[1];
            var c = this.regression.equation[2];

            if (this.regression.equation[0] != 0 && this.regression.equation[2] / this.regression.equation[0] > 0) {
              optinum_min = Math.min(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100, Math.round(100 * this.projected_roi(Math.sqrt(c / a), this.projected_value(Math.sqrt(c / a)))) / 100);
              if (optinum_min == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else if (optinum_min == Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100) optimal_cost = this.max_value;else optimal_cost = Math.sqrt(c / a);
              console.log(optimal_cost, "optimal_cost");
            } else {
              optinum_min = Math.min(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100);
              if (optinum_min == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else if (optinum_min == Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100) optimal_cost = this.max_value;
            }
          } else {
            var a = this.regression.equation[0];
            var b = this.regression.equation[1];
            var c = this.regression.equation[2];

            if (this.regression.equation[0] != 0 && this.regression.equation[2] / this.regression.equation[0] > 0) {
              optinum_max = Math.max(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100, Math.round(100 * this.projected_roi(Math.sqrt(c / a), this.projected_value(Math.sqrt(c / a)))) / 100);
              console.log(optinum_max, "sdfsdfds");
              if (optinum_max == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else if (optinum_max == Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100) optimal_cost = this.max_value;else optimal_cost = Math.sqrt(c / a);
              console.log(optimal_cost, "optimal_cost");
            } else {
              optinum_max = Math.max(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100);
              if (optinum_max == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else if (optinum_max == Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100) optimal_cost = this.max_value;
            }
          }

          break;

        case 5:
          if (this.kind != 1) {
            optinum_min = Math.min(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100);
            if (optinum_min == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else optimal_cost = this.max_value;
          } else {
            optinum_max = Math.max(Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100, Math.round(100 * this.projected_roi(this.max_value, this.projected_value(this.max_value))) / 100);
            if (optinum_max == Math.round(100 * this.projected_roi(0.01, this.projected_value(0.01))) / 100) optimal_cost = 0.01;else optimal_cost = this.max_value;
          }

          break;
      }

      if (this.kind == 1) {
        if (optimum < optinum_max) {
          optimum = optinum_max;
        }
      } else if (optinum_min > 0 && optimum > optinum_min) {
        optimum = optinum_min;
      }

      this.optimum = optimum;
      this.optimal_cost = Math.round(optimal_cost * 100) / 100;
      this.optimal_value = this.projected_value(optimal_cost);
      this.optimal_value = this.projected_value(optimal_cost);
      console.log(this.projected_value(optimal_cost), this.optimal_value, "optimal_cost");

      if (this.kind == 1) {
        // the cost with maximum ROI
        this.optimal_result = (this.optimum < 0 ? '<span style="color:red">' + this.optimum + '</span>' : this.optimum) + '% (' + this.optimal_cost.toFixed(2) + '/' + this.optimal_value.toFixed(2) + ')';
      } else {
        // the cost with minimum CPA
        this.optimal_result = this.optimum + ' (' + this.optimal_cost.toFixed(2) + '/' + this.optimal_value.toFixed(2) + ')';
      }
    },
    connectPlot: function (x = 0, y = 0) {
      var init_x = x,
          init_y = y,
          length = this.regression.points.length;
      var plot;

      if (this.reg_names[this.type_reg ? this.type_reg : this.campaign.best_fit] == "Linear") {
        init_y = this.regression.equation[0] * init_x + this.regression.equation[1];

        if (init_y < 0) {
          init_x = -(this.regression.equation[1] / this.regression.equation[0]);
          init_y = 0;
        }
      } else if (this.reg_names[this.type_reg ? this.type_reg : this.campaign.best_fit] == "Exponential") {
        init_y = this.regression.equation[0] * Math.exp(this.regression.equation[1] * init_x);
      } else if (this.reg_names[this.type_reg ? this.type_reg : this.campaign.best_fit] == "Logarithmic") {
        if (init_x == 0) {
          init_x = Math.pow(Math.E, -(this.regression.equation[0] / this.regression.equation[1]));
        } else {
          init_y = this.regression.equation[0] + this.regression.equation[1] * Math.log(init_x);
        }
      } else if (this.reg_names[this.type_reg ? this.type_reg : this.campaign.best_fit] == "Polynomial") {
        if (init_x == 0) {
          init_y = this.regression.equation[this.regression.equation.length - 1];

          if (init_y < 0) {
            if (this.regression.equation.length == 2) {
              init_x = -(this.regression.equation[1] / this.regression.equation[0]);
              init_y = 0;
            } else if (this.regression.equation.length == 3) {
              init_x = (-this.regression.equation[1] + Math.sqrt(this.regression.equation[0] * this.regression.equation[0] - 4 * this.regression.equation[0] * this.regression.equation[2])) / (2 * this.regression.equation[0]);
              var init_x2 = (-this.regression.equation[1] - Math.sqrt(this.regression.equation[0] * this.regression.equation[0] - 4 * this.regression.equation[0] * this.regression.equation[2])) / (2 * this.regression.equation[0]);
              init_y = 0;

              if (init_x > 0 && init_x2 > 0) {
                this.regression.points[length + 1] = [init_x2, init_y];
              } else if (init_x2 > 0 && init_x < 0) {
                init_x = init_x2;
              }
            }
          }
        } else {}
      } else if (this.reg_names[this.type_reg ? this.type_reg : this.campaign.best_fit] == "Power") {
        if (init_x == 0) {
          init_y = init_x = 0;
        } else {
          init_y = this.regression.equation[0] * init_x ** this.regression.equation[1];
        }
      }

      plot = [init_x, init_y];
      return plot;
    },
    initChart: function () {
      this.optimal_regress();
      var init_plot = this.connectPlot();
      this.regression.points[length] = init_plot;
      var reg_data = this.regression.points.sort(function (a, b) {
        return a[0] - b[0];
      }).map(function (item) {
        if (item[1] < 0) item[1] = 0;
        return item;
      });
      this.maxValue = reg_data[reg_data.length - 1][0];
      if (this.chart != null) this.chart = null;
      __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.setOptions({
        lang: {
          thousandsSep: ''
        }
      });
      var reg_data1 = this.regression.points1.sort(function (a, b) {
        return a[0] - b[0];
      }).map(function (item) {
        if (item[1] < 0) item[1] = 0;
        return item;
      });
      var maxValue = reg_data.length;
      var counter = 0;
      console.log(this.campaign_kind);

      if (this.campaign_kind == 'CPA') {
        console.log("is this CPA?");

        for (var i = 0; i < maxValue; i++) {
          if (reg_data[i][1] == 0) continue;
          reg_data1[counter] = [reg_data[i][0], reg_data[i][0] / reg_data[i][1]];
          counter++;
        }
      } else {
        console.log("is this ROI?");

        for (var i = 0; i < maxValue; i++) {
          if (reg_data[i][0] == 0) continue;
          reg_data1[counter] = [reg_data[i][0], (reg_data[i][1] - reg_data[i][0]) / reg_data[i][0]];
          counter++;
        }

        console.log(reg_data, reg_data1);
      } //reg_data1.push([maxValue, i/this.projected_value(maxValue)]);


      var reg_points1 = reg_data1.sort(function (a, b) {
        return a[0] - b[0];
      }).map(function (item) {
        if (item[1] < 0) item[1] = 0;
        return item;
      });
      if (this.chart != null) this.chart = null;
      __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.setOptions({
        lang: {
          thousandsSep: ''
        }
      });
      this.chart = __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.chart({
        chart: {
          renderTo: 'graph' + this._uid,
          type: 'scatter',
          zoomType: 'xy',
          height: 9 / 16 * 100 + '%'
        },
        title: {
          text: 'Cost vs ' + this.text_kind
        },
        xAxis: {
          min: 0,
          ceiling: 10000,
          title: {
            enabled: true,
            text: 'Cost'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        yAxis: {
          title: {
            text: this.text_kind
          }
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 90,
          y: 60,
          floating: true,
          backgroundColor: '#FFFFFF',
          borderWidth: 1
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 3,
              lineColor: "#0000ff",
              states: {
                hover: {
                  enabled: true,
                  lineColor: '#0000ff'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
            tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              pointFormat: '{point.x}, {point.y}'
            }
          },
          series: {
            animation: false
          }
        },
        series: [{
          name: 'Day (Cost, ' + this.text_kind + ')',
          color: 'rgba(223, 83, 83, .5)',
          data: this.campaign.points
        }, {
          name: '(Cost, ' + this.text_kind + ')',
          data: reg_data,
          color: 'rgba(40, 100, 255, .9)',
          lineWidth: 2,
          type: 'line',
          dashStyle: 'solid',
          marker: {
            enabled: false
          },
          showInLegend: false
        }, {
          data: [[this.optimal_cost, 0], [this.optimal_cost, this.optimal_value * 2]],
          color: 'rgba(70, 160, 50, .9)',
          lineWidth: 3,
          type: 'line',
          dashStyle: 'solid',
          name: this.optimal_text + ' = ' + this.optimal_result,
          showInLegend: false
        }],
        credits: {
          enabled: false
        }
      });
      this.chart = __WEBPACK_IMPORTED_MODULE_0_highcharts___default.a.chart({
        chart: {
          renderTo: 'graph1' + this._uid,
          type: 'scatter',
          zoomType: 'xy',
          height: 9 / 16 * 100 + '%'
        },
        title: {
          text: 'Cost vs ' + this.campaign_kind
        },
        xAxis: {
          min: 0,
          ceiling: 10000,
          title: {
            enabled: true,
            text: 'Cost'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        yAxis: {
          title: {
            text: this.campaign_kind
          }
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 90,
          y: 60,
          floating: true,
          backgroundColor: '#FFFFFF',
          borderWidth: 1
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 3,
              lineColor: "#0000ff",
              states: {
                hover: {
                  enabled: true,
                  lineColor: '#0000ff'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
            tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              pointFormat: '{point.x}, {point.y}'
            }
          },
          series: {
            animation: false
          }
        },
        series: [{
          name: '(Cost, ' + this.campaign_kind + ')',
          data: reg_data1,
          color: 'rgba(40, 100, 255, .9)',
          lineWidth: 2,
          type: 'line',
          dashStyle: 'solid',
          marker: {
            enabled: false
          },
          showInLegend: false
        }],
        credits: {
          enabled: false
        }
      });
    }
  }
});

/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_regression__ = __webpack_require__(8);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



__webpack_require__(11);

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    list: {
      type: Array,
      default: function () {
        return [];
      }
    },
    kind: {
      type: Number,
      default: 1
    },
    type_reg: {
      type: Number
    }
  },
  data: function () {
    var a = {
      min_total: 0,
      max_total: 0
    };
    return a;
  },
  filters: {
    filterNum: function (num) {
      if (num == null || num <= 0) return 0;
      return (+(Math.round(+(num + 'e' + 2
      /*precision*/
      )) + 'e' + -2
      /*precision*/
      )).toFixed(2
      /*precision*/
      );
    }
  },
  computed: {
    text_kind: function () {
      return this.kind == 1 ? 'Revenue' : 'Conversions';
    },
    optimal_text: function () {
      return this.kind == 1 ? 'Max ROI' : 'Min CPA';
    },
    total_cost: function () {
      var i,
          s = 0,
          len = this.list.length;

      for (i = 0; i < len; i++) s += this.list[i].optimal_cost;

      return s;
    },
    total_result: function () {
      var i,
          s = 0,
          len = this.list.length;

      for (i = 0; i < len; i++) s += this.depend(this.list[i]);

      return s;
    },
    total_optimal: function () {
      var c = this.total_cost,
          r = this.total_result;
      if (this.kind == 1) return c ? 100 * (r - c) / c : 0;else return r > 0.1 ? c / r : c;
    }
  },
  methods: {
    projected: function (item) {
      return this.kind == 1 ? this.projected_roi(item) : this.projected_cpa(item);
    },
    depend: function (item) {
      return item.optimal_cost <= 0 ? 0 : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__lib_regression__["a" /* predict */])(item.optimal_cost, this.type_reg ? this.type_reg : item.best_fit, item.regressions[this.type_reg ? this.type_reg : item.best_fit].equation) * (1 + item.improve / 100);
    },
    projected_roi: function (item) {
      return item.optimal_cost ? 100 * (this.depend(item) - item.optimal_cost) / item.optimal_cost : 0;
    },
    projected_cpa: function (item) {
      var result = this.depend(item);
      return result > 0.1 ? item.optimal_cost / result : item.optimal_cost;
    },
    doSolve: function () {
      let self = this;
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_post(this, "api/optimize/solve.php", function (resp) {
        this.$emit('optimize', resp);
      }, function (stat, resp) {
        this.$emit('failure', resp);
      }, JSON.stringify({
        kind: parseInt(this.kind),
        reg_type: this.type_reg,
        min_total: this.min_total,
        max_total: this.max_total,
        list: this.list.map(function (item) {
          return {
            min_cost: item.min_cost,
            max_cost: item.max_cost,
            improve: item.improve,
            regression: item.regressions[self.type_reg].equation
          };
        })
      }));
    }
  }
});

/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_email__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_err_panel__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__instruct__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__instruct___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__instruct__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__tool_util__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






__webpack_require__(20);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_2__components_err_panel___default.a,
    'instruct': __WEBPACK_IMPORTED_MODULE_3__instruct___default.a
  },
  data: function () {
    var a = {
      is_warn: false,
      warn_text: '',
      form_error: '',
      first_name: '',
      last_name: '',
      email: '',
      company: '',
      phone: '',
      country_id: 0,
      job_title: '',
      message: '',
      country_list: []
    };
    return a;
  },
  watch: {
    'first_name': 'frmClear',
    'last_name': 'frmClear',
    'email': 'frmClear',
    'country_id': 'frmClear',
    'message': 'frmClear'
  },
  created: function () {
    this.fetchData();
  },
  computed: {
    sortedCountry: function () {
      return this.country_list.sort(function (a, b) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__tool_util__["a" /* strCompare */])(a.name, b.name);
      });
    }
  },
  methods: {
    frmClear: function () {
      this.form_error = '';
    },
    fetchData: function () {
      __WEBPACK_IMPORTED_MODULE_1__tool_ajax__["a" /* default */].ajax_get(this, "api/contact/country.php", function (resp) {
        if (isArray(resp.country)) this.country_list = resp.country;else this.country_list = [];
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      });
    },
    doContact: function () {
      var err;
      if ((err = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__tool_email__["a" /* checkMail */])(this.email.trim())) != '') this.form_error = err;else if (this.country_id == 0) this.form_error = 'Choose your country';else if (this.message.trim() == '') this.form_error = 'What is your message?';else __WEBPACK_IMPORTED_MODULE_1__tool_ajax__["a" /* default */].ajax_post(this, "api/contact/from_any.php", function (resp) {
        this.is_warn = false;
        this.warn_text = 'Your contact request was successfully delivered.';
        this.first_name = '';
        this.last_name = '';
        this.email = '';
        this.country_id = 0;
        this.company = '';
        this.phone = '';
        this.job_title = '';
        this.message = '';
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      }, JSON.stringify({
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        phone: this.phone,
        country_id: this.country_id,
        company: this.company,
        job_title: this.job_title,
        message: this.message
      }));
    }
  }
});

/***/ }),
/* 53 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_plyr_patched__ = __webpack_require__(55);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

 // patched for TITLE

__webpack_require__(58);

/* harmony default export */ __webpack_exports__["default"] = ({
  data: function () {
    var a = {
      videos: [],
      def_video: {
        title: 'Example',
        video: 'bTqVqk7FSmY'
      }
    };
    return a;
  },
  created: function () {
    this.fetchData();
  },
  methods: {
    fetchData: function () {
      __WEBPACK_IMPORTED_MODULE_0__tool_ajax__["a" /* default */].ajax_get(this, 'api/contact/country.php', function (resp) {
        if (resp.video) this.videos = resp.video;else this.videos = [this.def_video];
        this.$nextTick(function () {
          __WEBPACK_IMPORTED_MODULE_1__lib_plyr_patched__["a" /* default */].setup({
            tooltips: {
              controls: true,
              seek: true
            }
          });
        });
      }, function (stat, resp) {});
    }
  }
});

/***/ }),
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tool_email__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tool_ajax__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_err_panel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_err_panel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_err_panel__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__instruct__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__instruct___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__instruct__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





__webpack_require__(20);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    'err-panel': __WEBPACK_IMPORTED_MODULE_2__components_err_panel___default.a,
    'instruct': __WEBPACK_IMPORTED_MODULE_3__instruct___default.a
  },
  data: function () {
    var a = {
      is_warn: false,
      warn_text: '',
      form_error: '',
      subject: '',
      message: ''
    };
    return a;
  },
  watch: {
    'subject': 'frmClear',
    'message': 'frmClear'
  },
  methods: {
    frmClear: function () {
      this.form_error = '';
    },
    doContact: function () {
      var err;
      if (this.subject.trim() == '') this.form_error = 'What is the subject of the message?';else if (this.message.trim() == '') this.form_error = 'What is your message?';else __WEBPACK_IMPORTED_MODULE_1__tool_ajax__["a" /* default */].ajax_post(this, "api/contact/from_reg.php", function (resp) {
        this.is_warn = false;
        this.warn_text = 'Your contact request was successfully delivered.';
        this.subject = '';
        this.message = '';
      }, function (stat, resp) {
        this.is_warn = true;
        this.warn_text = resp;
      }, JSON.stringify({
        subject: this.subject,
        message: this.message
      }));
    }
  }
});

/***/ }),
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ==========================================================================
// Plyr
// plyr.js v2.0.13
// https://github.com/sampotts/plyr
// License: The MIT License (MIT)
// ==========================================================================
// Credits: http://paypal.github.io/accessible-html5-video-player/
// ==========================================================================
 // Globals

var fullscreen,
    scroll = {
  x: 0,
  y: 0
},
    // Default config
defaults = {
  enabled: true,
  debug: false,
  autoplay: false,
  loop: false,
  seekTime: 10,
  volume: 10,
  volumeMin: 0,
  volumeMax: 10,
  volumeStep: 1,
  duration: null,
  displayDuration: true,
  loadSprite: true,
  iconPrefix: 'plyr',
  iconUrl: 'https://cdn.plyr.io/2.0.13/plyr.svg',
  blankUrl: 'https://cdn.selz.com/plyr/blank.mp4',
  clickToPlay: true,
  hideControls: true,
  showPosterOnEnd: false,
  disableContextMenu: true,
  keyboardShorcuts: {
    focused: true,
    global: false
  },
  tooltips: {
    controls: false,
    seek: true
  },
  selectors: {
    html5: 'video, audio',
    embed: '[data-type]',
    editable: 'input, textarea, select, [contenteditable]',
    container: '.plyr',
    controls: {
      container: null,
      wrapper: '.plyr__controls'
    },
    labels: '[data-plyr]',
    buttons: {
      seek: '[data-plyr="seek"]',
      play: '[data-plyr="play"]',
      pause: '[data-plyr="pause"]',
      restart: '[data-plyr="restart"]',
      rewind: '[data-plyr="rewind"]',
      forward: '[data-plyr="fast-forward"]',
      mute: '[data-plyr="mute"]',
      captions: '[data-plyr="captions"]',
      fullscreen: '[data-plyr="fullscreen"]'
    },
    volume: {
      input: '[data-plyr="volume"]',
      display: '.plyr__volume--display'
    },
    progress: {
      container: '.plyr__progress',
      buffer: '.plyr__progress--buffer',
      played: '.plyr__progress--played'
    },
    captions: '.plyr__captions',
    currentTime: '.plyr__time--current',
    duration: '.plyr__time--duration'
  },
  classes: {
    setup: 'plyr--setup',
    ready: 'plyr--ready',
    videoWrapper: 'plyr__video-wrapper',
    embedWrapper: 'plyr__video-embed',
    type: 'plyr--{0}',
    stopped: 'plyr--stopped',
    playing: 'plyr--playing',
    muted: 'plyr--muted',
    loading: 'plyr--loading',
    hover: 'plyr--hover',
    tooltip: 'plyr__tooltip',
    hidden: 'plyr__sr-only',
    hideControls: 'plyr--hide-controls',
    isIos: 'plyr--is-ios',
    isTouch: 'plyr--is-touch',
    captions: {
      enabled: 'plyr--captions-enabled',
      active: 'plyr--captions-active'
    },
    fullscreen: {
      enabled: 'plyr--fullscreen-enabled',
      active: 'plyr--fullscreen-active'
    },
    tabFocus: 'tab-focus'
  },
  captions: {
    defaultActive: false
  },
  fullscreen: {
    enabled: true,
    fallback: true,
    allowAudio: false
  },
  storage: {
    enabled: true,
    key: 'plyr'
  },
  controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'fullscreen'],
  i18n: {
    restart: 'Restart',
    rewind: 'Rewind {seektime} secs',
    play: 'Play',
    pause: 'Pause',
    forward: 'Forward {seektime} secs',
    played: 'played',
    buffered: 'buffered',
    currentTime: 'Current time',
    duration: 'Duration',
    volume: 'Volume',
    toggleMute: 'Toggle Mute',
    toggleCaptions: 'Toggle Captions',
    toggleFullscreen: 'Toggle Fullscreen',
    frameTitle: 'Player for {title}'
  },
  types: {
    embed: ['youtube', 'vimeo', 'soundcloud'],
    html5: ['video', 'audio']
  },
  // URLs
  urls: {
    vimeo: {
      api: 'https://player.vimeo.com/api/player.js'
    },
    youtube: {
      api: 'https://www.youtube.com/iframe_api'
    },
    soundcloud: {
      api: 'https://w.soundcloud.com/player/api.js'
    }
  },
  // Custom control listeners
  listeners: {
    seek: null,
    play: null,
    pause: null,
    restart: null,
    rewind: null,
    forward: null,
    mute: null,
    volume: null,
    captions: null,
    fullscreen: null
  },
  // Events to watch on HTML5 media elements
  events: ['ready', 'ended', 'progress', 'stalled', 'playing', 'waiting', 'canplay', 'canplaythrough', 'loadstart', 'loadeddata', 'loadedmetadata', 'timeupdate', 'volumechange', 'play', 'pause', 'error', 'seeking', 'seeked', 'emptied'],
  // Logging
  logPrefix: '[Plyr]'
}; // Credits: http://paypal.github.io/accessible-html5-video-player/
// Unfortunately, due to mixed support, UA sniffing is required

function _browserSniff() {
  var ua = navigator.userAgent,
      name = navigator.appName,
      fullVersion = '' + parseFloat(navigator.appVersion),
      majorVersion = parseInt(navigator.appVersion, 10),
      nameOffset,
      verOffset,
      ix,
      isIE = false,
      isFirefox = false,
      isChrome = false,
      isSafari = false;

  if (navigator.appVersion.indexOf('Windows NT') !== -1 && navigator.appVersion.indexOf('rv:11') !== -1) {
    // MSIE 11
    isIE = true;
    name = 'IE';
    fullVersion = '11';
  } else if ((verOffset = ua.indexOf('MSIE')) !== -1) {
    // MSIE
    isIE = true;
    name = 'IE';
    fullVersion = ua.substring(verOffset + 5);
  } else if ((verOffset = ua.indexOf('Chrome')) !== -1) {
    // Chrome
    isChrome = true;
    name = 'Chrome';
    fullVersion = ua.substring(verOffset + 7);
  } else if ((verOffset = ua.indexOf('Safari')) !== -1) {
    // Safari
    isSafari = true;
    name = 'Safari';
    fullVersion = ua.substring(verOffset + 7);

    if ((verOffset = ua.indexOf('Version')) !== -1) {
      fullVersion = ua.substring(verOffset + 8);
    }
  } else if ((verOffset = ua.indexOf('Firefox')) !== -1) {
    // Firefox
    isFirefox = true;
    name = 'Firefox';
    fullVersion = ua.substring(verOffset + 8);
  } else if ((nameOffset = ua.lastIndexOf(' ') + 1) < (verOffset = ua.lastIndexOf('/'))) {
    // In most other browsers, 'name/version' is at the end of userAgent
    name = ua.substring(nameOffset, verOffset);
    fullVersion = ua.substring(verOffset + 1);

    if (name.toLowerCase() === name.toUpperCase()) {
      name = navigator.appName;
    }
  } // Trim the fullVersion string at semicolon/space if present


  if ((ix = fullVersion.indexOf(';')) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  }

  if ((ix = fullVersion.indexOf(' ')) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  } // Get major version


  majorVersion = parseInt('' + fullVersion, 10);

  if (isNaN(majorVersion)) {
    fullVersion = '' + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  } // Return data


  return {
    name: name,
    version: majorVersion,
    isIE: isIE,
    isFirefox: isFirefox,
    isChrome: isChrome,
    isSafari: isSafari,
    isIos: /(iPad|iPhone|iPod)/g.test(navigator.platform),
    isIphone: /(iPhone|iPod)/g.test(navigator.userAgent),
    isTouch: 'ontouchstart' in document.documentElement
  };
} // Check for mime type support against a player instance
// Credits: http://diveintohtml5.info/everything.html
// Related: http://www.leanbackplyr.com/test/h5mt.html


function _supportMime(plyr, mimeType) {
  var media = plyr.media;

  if (plyr.type === 'video') {
    // Check type
    switch (mimeType) {
      case 'video/webm':
        return !!(media.canPlayType && media.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/, ''));

      case 'video/mp4':
        return !!(media.canPlayType && media.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''));

      case 'video/ogg':
        return !!(media.canPlayType && media.canPlayType('video/ogg; codecs="theora"').replace(/no/, ''));
    }
  } else if (plyr.type === 'audio') {
    // Check type
    switch (mimeType) {
      case 'audio/mpeg':
        return !!(media.canPlayType && media.canPlayType('audio/mpeg;').replace(/no/, ''));

      case 'audio/ogg':
        return !!(media.canPlayType && media.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));

      case 'audio/wav':
        return !!(media.canPlayType && media.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
    }
  } // If we got this far, we're stuffed


  return false;
} // Inject a script


function _injectScript(source) {
  if (document.querySelectorAll('script[src="' + source + '"]').length) {
    return;
  }

  var tag = document.createElement('script');
  tag.src = source;
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
} // Element exists in an array


function _inArray(haystack, needle) {
  return Array.prototype.indexOf && haystack.indexOf(needle) !== -1;
} // Replace all


function _replaceAll(string, find, replace) {
  return string.replace(new RegExp(find.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'), replace);
} // Wrap an element


function _wrap(elements, wrapper) {
  // Convert `elements` to an array, if necessary.
  if (!elements.length) {
    elements = [elements];
  } // Loops backwards to prevent having to clone the wrapper on the
  // first element (see `child` below).


  for (var i = elements.length - 1; i >= 0; i--) {
    var child = i > 0 ? wrapper.cloneNode(true) : wrapper;
    var element = elements[i]; // Cache the current parent and sibling.

    var parent = element.parentNode;
    var sibling = element.nextSibling; // Wrap the element (is automatically removed from its current
    // parent).

    child.appendChild(element); // If the element had a sibling, insert the wrapper before
    // the sibling to maintain the HTML structure; otherwise, just
    // append it to the parent.

    if (sibling) {
      parent.insertBefore(child, sibling);
    } else {
      parent.appendChild(child);
    }

    return child;
  }
} // Unwrap an element
// http://plainjs.com/javascript/manipulation/unwrap-a-dom-element-35/

/*function _unwrap(wrapper) {
    // Get the element's parent node
    var parent = wrapper.parentNode;
      // Move all children out of the element
    while (wrapper.firstChild) {
        parent.insertBefore(wrapper.firstChild, wrapper);
    }
      // Remove the empty element
    parent.removeChild(wrapper);
}*/
// Remove an element


function _remove(element) {
  if (!element) {
    return;
  }

  element.parentNode.removeChild(element);
} // Prepend child


function _prependChild(parent, element) {
  parent.insertBefore(element, parent.firstChild);
} // Set attributes


function _setAttributes(element, attributes) {
  for (var key in attributes) {
    element.setAttribute(key, _is.boolean(attributes[key]) && attributes[key] ? '' : attributes[key]);
  }
} // Insert a HTML element


function _insertElement(type, parent, attributes) {
  // Create a new <element>
  var element = document.createElement(type); // Set all passed attributes

  _setAttributes(element, attributes); // Inject the new element


  _prependChild(parent, element);
} // Get a classname from selector


function _getClassname(selector) {
  return selector.replace('.', '');
} // Toggle class on an element


function _toggleClass(element, className, state) {
  if (element) {
    if (element.classList) {
      element.classList[state ? 'add' : 'remove'](className);
    } else {
      var name = (' ' + element.className + ' ').replace(/\s+/g, ' ').replace(' ' + className + ' ', '');
      element.className = name + (state ? ' ' + className : '');
    }
  }
} // Has class name


function _hasClass(element, className) {
  if (element) {
    if (element.classList) {
      return element.classList.contains(className);
    } else {
      return new RegExp('(\\s|^)' + className + '(\\s|$)').test(element.className);
    }
  }

  return false;
} // Element matches selector


function _matches(element, selector) {
  var p = Element.prototype;

  var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
    return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
  };

  return f.call(element, selector);
} // Bind along with custom handler


function _proxyListener(element, eventName, userListener, defaultListener, useCapture) {
  _on(element, eventName, function (event) {
    if (userListener) {
      userListener.apply(element, [event]);
    }

    defaultListener.apply(element, [event]);
  }, useCapture);
} // Toggle event listener


function _toggleListener(element, events, callback, toggle, useCapture) {
  var eventList = events.split(' '); // Whether the listener is a capturing listener or not
  // Default to false

  if (!_is.boolean(useCapture)) {
    useCapture = false;
  } // If a nodelist is passed, call itself on each node


  if (element instanceof NodeList) {
    for (var x = 0; x < element.length; x++) {
      if (element[x] instanceof Node) {
        _toggleListener(element[x], arguments[1], arguments[2], arguments[3]);
      }
    }

    return;
  } // If a single node is passed, bind the event listener


  for (var i = 0; i < eventList.length; i++) {
    element[toggle ? 'addEventListener' : 'removeEventListener'](eventList[i], callback, useCapture);
  }
} // Bind event


function _on(element, events, callback, useCapture) {
  if (element) {
    _toggleListener(element, events, callback, true, useCapture);
  }
} // Unbind event

/*function _off(element, events, callback, useCapture) {
    if (element) {
        _toggleListener(element, events, callback, false, useCapture);
    }
}*/
// Trigger event


function _event(element, type, bubbles, properties) {
  // Bail if no element
  if (!element || !type) {
    return;
  } // Default bubbles to false


  if (!_is.boolean(bubbles)) {
    bubbles = false;
  } // Create and dispatch the event


  var event = new CustomEvent(type, {
    bubbles: bubbles,
    detail: properties
  }); // Dispatch the event

  element.dispatchEvent(event);
} // Toggle aria-pressed state on a toggle button
// http://www.ssbbartgroup.com/blog/how-not-to-misuse-aria-states-properties-and-roles


function _toggleState(target, state) {
  // Bail if no target
  if (!target) {
    return;
  } // Get state


  state = _is.boolean(state) ? state : !target.getAttribute('aria-pressed'); // Set the attribute on target

  target.setAttribute('aria-pressed', state);
  return state;
} // Get percentage


function _getPercentage(current, max) {
  if (current === 0 || max === 0 || isNaN(current) || isNaN(max)) {
    return 0;
  }

  return (current / max * 100).toFixed(2);
} // Deep extend/merge destination object with N more objects
// http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
// Removed call to arguments.callee (used explicit function name instead)


function _extend() {
  // Get arguments
  var objects = arguments; // Bail if nothing to merge

  if (!objects.length) {
    return;
  } // Return first if specified but nothing to merge


  if (objects.length === 1) {
    return objects[0];
  } // First object is the destination


  var destination = Array.prototype.shift.call(objects),
      length = objects.length; // Loop through all objects to merge

  for (var i = 0; i < length; i++) {
    var source = objects[i];

    for (var property in source) {
      if (source[property] && source[property].constructor && source[property].constructor === Object) {
        destination[property] = destination[property] || {};

        _extend(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
  }

  return destination;
} // Check variable types


var _is = {
  object: function (input) {
    return input !== null && typeof input === 'object';
  },
  array: function (input) {
    return input !== null && typeof input === 'object' && input.constructor === Array;
  },
  number: function (input) {
    return input !== null && (typeof input === 'number' && !isNaN(input - 0) || typeof input === 'object' && input.constructor === Number);
  },
  string: function (input) {
    return input !== null && (typeof input === 'string' || typeof input === 'object' && input.constructor === String);
  },
  boolean: function (input) {
    return input !== null && typeof input === 'boolean';
  },
  nodeList: function (input) {
    return input !== null && input instanceof NodeList;
  },
  htmlElement: function (input) {
    return input !== null && input instanceof HTMLElement;
  },
  function: function (input) {
    return input !== null && typeof input === 'function';
  },
  undefined: function (input) {
    return input !== null && typeof input === 'undefined';
  }
}; // Parse YouTube ID from url

function _parseYouTubeId(url) {
  var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  return url.match(regex) ? RegExp.$2 : url;
} // Parse Vimeo ID from url


function _parseVimeoId(url) {
  var regex = /^.*(vimeo.com\/|video\/)(\d+).*/;
  return url.match(regex) ? RegExp.$2 : url;
} // Fullscreen API


function _fullscreen() {
  var fullscreen = {
    supportsFullScreen: false,
    isFullScreen: function () {
      return false;
    },
    requestFullScreen: function () {},
    cancelFullScreen: function () {},
    fullScreenEventName: '',
    element: null,
    prefix: ''
  },
      browserPrefixes = 'webkit o moz ms khtml'.split(' '); // Check for native support

  if (!_is.undefined(document.cancelFullScreen)) {
    fullscreen.supportsFullScreen = true;
  } else {
    // Check for fullscreen support by vendor prefix
    for (var i = 0, il = browserPrefixes.length; i < il; i++) {
      fullscreen.prefix = browserPrefixes[i];

      if (!_is.undefined(document[fullscreen.prefix + 'CancelFullScreen'])) {
        fullscreen.supportsFullScreen = true;
        break;
      } else if (!_is.undefined(document.msExitFullscreen) && document.msFullscreenEnabled) {
        // Special case for MS (when isn't it?)
        fullscreen.prefix = 'ms';
        fullscreen.supportsFullScreen = true;
        break;
      }
    }
  } // Update methods to do something useful


  if (fullscreen.supportsFullScreen) {
    // Yet again Microsoft awesomeness,
    // Sometimes the prefix is 'ms', sometimes 'MS' to keep you on your toes
    fullscreen.fullScreenEventName = fullscreen.prefix === 'ms' ? 'MSFullscreenChange' : fullscreen.prefix + 'fullscreenchange';

    fullscreen.isFullScreen = function (element) {
      if (_is.undefined(element)) {
        element = document.body;
      }

      switch (this.prefix) {
        case '':
          return document.fullscreenElement === element;

        case 'moz':
          return document.mozFullScreenElement === element;

        default:
          return document[this.prefix + 'FullscreenElement'] === element;
      }
    };

    fullscreen.requestFullScreen = function (element) {
      if (_is.undefined(element)) {
        element = document.body;
      }

      return this.prefix === '' ? element.requestFullScreen() : element[this.prefix + (this.prefix === 'ms' ? 'RequestFullscreen' : 'RequestFullScreen')]();
    };

    fullscreen.cancelFullScreen = function () {
      return this.prefix === '' ? document.cancelFullScreen() : document[this.prefix + (this.prefix === 'ms' ? 'ExitFullscreen' : 'CancelFullScreen')]();
    };

    fullscreen.element = function () {
      return this.prefix === '' ? document.fullscreenElement : document[this.prefix + 'FullscreenElement'];
    };
  }

  return fullscreen;
} // Local storage


var _storage = {
  supported: function () {
    if (!('localStorage' in window)) {
      return false;
    } // Try to use it (it might be disabled, e.g. user is in private/porn mode)
    // see: https://github.com/sampotts/plyr/issues/131


    try {
      // Add test item
      window.localStorage.setItem('___test', 'OK'); // Get the test item

      var result = window.localStorage.getItem('___test'); // Clean up

      window.localStorage.removeItem('___test'); // Check if value matches

      return result === 'OK';
    } catch (e) {
      return false;
    }

    return false;
  }()
}; // Player instance

function Plyr(media, config) {
  var plyr = this,
      timers = {},
      api; // Set media

  plyr.media = media;
  var original = media.cloneNode(true); // Trigger events, with plyr instance passed

  function _triggerEvent(element, type, bubbles, properties) {
    _event(element, type, bubbles, _extend({}, properties, {
      plyr: api
    }));
  } // Debugging


  function _console(type, args) {
    if (config.debug && window.console) {
      args = Array.prototype.slice.call(args);

      if (_is.string(config.logPrefix) && config.logPrefix.length) {
        args.unshift(config.logPrefix);
      }

      console[type].apply(console, args);
    }
  }

  var _log = function () {
    _console('log', arguments);
  },
      _warn = function () {
    _console('warn', arguments);
  }; // Log config options


  _log('Config', config); // Get icon URL


  function _getIconUrl() {
    return {
      url: config.iconUrl,
      absolute: config.iconUrl.indexOf("http") === 0 || plyr.browser.isIE
    };
  } // Build the default HTML


  function _buildControls() {
    // Create html array
    var html = [],
        iconUrl = _getIconUrl(),
        iconPath = (!iconUrl.absolute ? iconUrl.url : '') + '#' + config.iconPrefix; // Larger overlaid play button


    if (_inArray(config.controls, 'play-large')) {
      html.push('<button type="button" data-plyr="play" class="plyr__play-large">', '<svg><use xlink:href="' + iconPath + '-play" /></svg>', '<span class="plyr__sr-only">' + config.i18n.play + '</span>', '</button>');
    }

    html.push('<div class="plyr__controls">'); // Restart button

    if (_inArray(config.controls, 'restart')) {
      html.push('<button type="button" data-plyr="restart">', '<svg><use xlink:href="' + iconPath + '-restart" /></svg>', '<span class="plyr__sr-only">' + config.i18n.restart + '</span>', '</button>');
    } // Rewind button


    if (_inArray(config.controls, 'rewind')) {
      html.push('<button type="button" data-plyr="rewind">', '<svg><use xlink:href="' + iconPath + '-rewind" /></svg>', '<span class="plyr__sr-only">' + config.i18n.rewind + '</span>', '</button>');
    } // Play Pause button
    // TODO: This should be a toggle button really?


    if (_inArray(config.controls, 'play')) {
      html.push('<button type="button" data-plyr="play">', '<svg><use xlink:href="' + iconPath + '-play" /></svg>', '<span class="plyr__sr-only">' + config.i18n.play + '</span>', '</button>', '<button type="button" data-plyr="pause">', '<svg><use xlink:href="' + iconPath + '-pause" /></svg>', '<span class="plyr__sr-only">' + config.i18n.pause + '</span>', '</button>');
    } // Fast forward button


    if (_inArray(config.controls, 'fast-forward')) {
      html.push('<button type="button" data-plyr="fast-forward">', '<svg><use xlink:href="' + iconPath + '-fast-forward" /></svg>', '<span class="plyr__sr-only">' + config.i18n.forward + '</span>', '</button>');
    } // Progress


    if (_inArray(config.controls, 'progress')) {
      // Create progress
      html.push('<span class="plyr__progress">', '<label for="seek{id}" class="plyr__sr-only">Seek</label>', '<input id="seek{id}" class="plyr__progress--seek" type="range" min="0" max="100" step="0.1" value="0" data-plyr="seek">', '<progress class="plyr__progress--played" max="100" value="0" role="presentation"></progress>', '<progress class="plyr__progress--buffer" max="100" value="0">', '<span>0</span>% ' + config.i18n.buffered, '</progress>'); // Seek tooltip

      if (config.tooltips.seek) {
        html.push('<span class="plyr__tooltip">00:00</span>');
      } // Close


      html.push('</span>');
    } // Media current time display


    if (_inArray(config.controls, 'current-time')) {
      html.push('<span class="plyr__time">', '<span class="plyr__sr-only">' + config.i18n.currentTime + '</span>', '<span class="plyr__time--current">00:00</span>', '</span>');
    } // Media duration display


    if (_inArray(config.controls, 'duration')) {
      html.push('<span class="plyr__time">', '<span class="plyr__sr-only">' + config.i18n.duration + '</span>', '<span class="plyr__time--duration">00:00</span>', '</span>');
    } // Toggle mute button


    if (_inArray(config.controls, 'mute')) {
      html.push('<button type="button" data-plyr="mute">', '<svg class="icon--muted"><use xlink:href="' + iconPath + '-muted" /></svg>', '<svg><use xlink:href="' + iconPath + '-volume" /></svg>', '<span class="plyr__sr-only">' + config.i18n.toggleMute + '</span>', '</button>');
    } // Volume range control


    if (_inArray(config.controls, 'volume')) {
      html.push('<span class="plyr__volume">', '<label for="volume{id}" class="plyr__sr-only">' + config.i18n.volume + '</label>', '<input id="volume{id}" class="plyr__volume--input" type="range" min="' + config.volumeMin + '" max="' + config.volumeMax + '" value="' + config.volume + '" data-plyr="volume">', '<progress class="plyr__volume--display" max="' + config.volumeMax + '" value="' + config.volumeMin + '" role="presentation"></progress>', '</span>');
    } // Toggle captions button


    if (_inArray(config.controls, 'captions')) {
      html.push('<button type="button" data-plyr="captions">', '<svg class="icon--captions-on"><use xlink:href="' + iconPath + '-captions-on" /></svg>', '<svg><use xlink:href="' + iconPath + '-captions-off" /></svg>', '<span class="plyr__sr-only">' + config.i18n.toggleCaptions + '</span>', '</button>');
    } // Toggle fullscreen button


    if (_inArray(config.controls, 'fullscreen')) {
      html.push('<button type="button" data-plyr="fullscreen">', '<svg class="icon--exit-fullscreen"><use xlink:href="' + iconPath + '-exit-fullscreen" /></svg>', '<svg><use xlink:href="' + iconPath + '-enter-fullscreen" /></svg>', '<span class="plyr__sr-only">' + config.i18n.toggleFullscreen + '</span>', '</button>');
    } // Close everything


    html.push('</div>');
    return html.join('');
  } // Setup fullscreen


  function _setupFullscreen() {
    if (!plyr.supported.full) {
      return;
    }

    if ((plyr.type !== 'audio' || config.fullscreen.allowAudio) && config.fullscreen.enabled) {
      // Check for native support
      var nativeSupport = fullscreen.supportsFullScreen;

      if (nativeSupport || config.fullscreen.fallback && !_inFrame()) {
        _log((nativeSupport ? 'Native' : 'Fallback') + ' fullscreen enabled'); // Add styling hook


        _toggleClass(plyr.container, config.classes.fullscreen.enabled, true);
      } else {
        _log('Fullscreen not supported and fallback disabled');
      } // Toggle state


      if (plyr.buttons && plyr.buttons.fullscreen) {
        _toggleState(plyr.buttons.fullscreen, false);
      } // Setup focus trap


      _focusTrap();
    }
  } // Setup captions


  function _setupCaptions() {
    // Bail if not HTML5 video
    if (plyr.type !== 'video') {
      return;
    } // Inject the container


    if (!_getElement(config.selectors.captions)) {
      plyr.videoContainer.insertAdjacentHTML('afterbegin', '<div class="' + _getClassname(config.selectors.captions) + '"></div>');
    } // Determine if HTML5 textTracks is supported


    plyr.usingTextTracks = false;

    if (plyr.media.textTracks) {
      plyr.usingTextTracks = true;
    } // Get URL of caption file if exists


    var captionSrc = '',
        kind,
        children = plyr.media.childNodes;

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName.toLowerCase() === 'track') {
        kind = children[i].kind;

        if (kind === 'captions' || kind === 'subtitles') {
          captionSrc = children[i].getAttribute('src');
        }
      }
    } // Record if caption file exists or not


    plyr.captionExists = true;

    if (captionSrc === '') {
      plyr.captionExists = false;

      _log('No caption track found');
    } else {
      _log('Caption track found; URI: ' + captionSrc);
    } // If no caption file exists, hide container for caption text


    if (!plyr.captionExists) {
      _toggleClass(plyr.container, config.classes.captions.enabled);
    } else {
      // Turn off native caption rendering to avoid double captions
      // This doesn't seem to work in Safari 7+, so the <track> elements are removed from the dom below
      var tracks = plyr.media.textTracks;

      for (var x = 0; x < tracks.length; x++) {
        tracks[x].mode = 'hidden';
      } // Enable UI


      _showCaptions(plyr); // Disable unsupported browsers than report false positive
      // Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1033144


      if (plyr.browser.isIE && plyr.browser.version >= 10 || plyr.browser.isFirefox && plyr.browser.version >= 31) {
        // Debugging
        _log('Detected browser with known TextTrack issues - using manual fallback'); // Set to false so skips to 'manual' captioning


        plyr.usingTextTracks = false;
      } // Rendering caption tracks
      // Native support required - http://caniuse.com/webvtt


      if (plyr.usingTextTracks) {
        _log('TextTracks supported');

        for (var y = 0; y < tracks.length; y++) {
          var track = tracks[y];

          if (track.kind === 'captions' || track.kind === 'subtitles') {
            _on(track, 'cuechange', function () {
              // Display a cue, if there is one
              if (this.activeCues[0] && 'text' in this.activeCues[0]) {
                _setCaption(this.activeCues[0].getCueAsHTML());
              } else {
                _setCaption();
              }
            });
          }
        }
      } else {
        // Caption tracks not natively supported
        _log('TextTracks not supported so rendering captions manually'); // Render captions from array at appropriate time


        plyr.currentCaption = '';
        plyr.captions = [];

        if (captionSrc !== '') {
          // Create XMLHttpRequest Object
          var xhr = new XMLHttpRequest();

          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                var captions = [],
                    caption,
                    req = xhr.responseText; //According to webvtt spec, line terminator consists of one of the following
                // CRLF (U+000D U+000A), LF (U+000A) or CR (U+000D)

                var lineSeparator = '\r\n';

                if (req.indexOf(lineSeparator + lineSeparator) === -1) {
                  if (req.indexOf('\r\r') !== -1) {
                    lineSeparator = '\r';
                  } else {
                    lineSeparator = '\n';
                  }
                }

                captions = req.split(lineSeparator + lineSeparator);

                for (var r = 0; r < captions.length; r++) {
                  caption = captions[r];
                  plyr.captions[r] = []; // Get the parts of the captions

                  var parts = caption.split(lineSeparator),
                      index = 0; // Incase caption numbers are added

                  if (parts[index].indexOf(":") === -1) {
                    index = 1;
                  }

                  plyr.captions[r] = [parts[index], parts[index + 1]];
                } // Remove first element ('VTT')


                plyr.captions.shift();

                _log('Successfully loaded the caption file via AJAX');
              } else {
                _warn(config.logPrefix + 'There was a problem loading the caption file via AJAX');
              }
            }
          };

          xhr.open('get', captionSrc, true);
          xhr.send();
        }
      }
    }
  } // Set the current caption


  function _setCaption(caption) {
    /* jshint unused:false */
    var container = _getElement(config.selectors.captions),
        content = document.createElement('span'); // Empty the container


    container.innerHTML = ''; // Default to empty

    if (_is.undefined(caption)) {
      caption = '';
    } // Set the span content


    if (_is.string(caption)) {
      content.innerHTML = caption.trim();
    } else {
      content.appendChild(caption);
    } // Set new caption text


    container.appendChild(content); // Force redraw (for Safari)

    var redraw = container.offsetHeight;
  } // Captions functions
  // Seek the manual caption time and update UI


  function _seekManualCaptions(time) {
    // Utilities for caption time codes
    function _timecodeCommon(tc, pos) {
      var tcpair = [];
      tcpair = tc.split(' --> ');

      for (var i = 0; i < tcpair.length; i++) {
        // WebVTT allows for extra meta data after the timestamp line
        // So get rid of this if it exists
        tcpair[i] = tcpair[i].replace(/(\d+:\d+:\d+\.\d+).*/, "$1");
      }

      return _subTcSecs(tcpair[pos]);
    }

    function _timecodeMin(tc) {
      return _timecodeCommon(tc, 0);
    }

    function _timecodeMax(tc) {
      return _timecodeCommon(tc, 1);
    }

    function _subTcSecs(tc) {
      if (tc === null || tc === undefined) {
        return 0;
      } else {
        var tc1 = [],
            tc2 = [],
            seconds;
        tc1 = tc.split(',');
        tc2 = tc1[0].split(':');
        seconds = Math.floor(tc2[0] * 60 * 60) + Math.floor(tc2[1] * 60) + Math.floor(tc2[2]);
        return seconds;
      }
    } // If it's not video, or we're using textTracks, bail.


    if (plyr.usingTextTracks || plyr.type !== 'video' || !plyr.supported.full) {
      return;
    } // Reset subcount


    plyr.subcount = 0; // Check time is a number, if not use currentTime
    // IE has a bug where currentTime doesn't go to 0
    // https://twitter.com/Sam_Potts/status/573715746506731521

    time = _is.number(time) ? time : plyr.media.currentTime; // If there's no subs available, bail

    if (!plyr.captions[plyr.subcount]) {
      return;
    }

    while (_timecodeMax(plyr.captions[plyr.subcount][0]) < time.toFixed(1)) {
      plyr.subcount++;

      if (plyr.subcount > plyr.captions.length - 1) {
        plyr.subcount = plyr.captions.length - 1;
        break;
      }
    } // Check if the next caption is in the current time range


    if (plyr.media.currentTime.toFixed(1) >= _timecodeMin(plyr.captions[plyr.subcount][0]) && plyr.media.currentTime.toFixed(1) <= _timecodeMax(plyr.captions[plyr.subcount][0])) {
      plyr.currentCaption = plyr.captions[plyr.subcount][1]; // Render the caption

      _setCaption(plyr.currentCaption);
    } else {
      _setCaption();
    }
  } // Display captions container and button (for initialization)


  function _showCaptions() {
    // If there's no caption toggle, bail
    if (!plyr.buttons.captions) {
      return;
    }

    _toggleClass(plyr.container, config.classes.captions.enabled, true); // Try to load the value from storage


    var active = plyr.storage.captionsEnabled; // Otherwise fall back to the default config

    if (!_is.boolean(active)) {
      active = config.captions.defaultActive;
    }

    if (active) {
      _toggleClass(plyr.container, config.classes.captions.active, true);

      _toggleState(plyr.buttons.captions, true);
    }
  } // Find all elements


  function _getElements(selector) {
    return plyr.container.querySelectorAll(selector);
  } // Find a single element


  function _getElement(selector) {
    return _getElements(selector)[0];
  } // Determine if we're in an iframe


  function _inFrame() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  } // Trap focus inside container


  function _focusTrap() {
    var tabbables = _getElements('input:not([disabled]), button:not([disabled])'),
        first = tabbables[0],
        last = tabbables[tabbables.length - 1];

    function _checkFocus(event) {
      // If it is TAB
      if (event.which === 9 && plyr.isFullscreen) {
        if (event.target === last && !event.shiftKey) {
          // Move focus to first element that can be tabbed if Shift isn't used
          event.preventDefault();
          first.focus();
        } else if (event.target === first && event.shiftKey) {
          // Move focus to last element that can be tabbed if Shift is used
          event.preventDefault();
          last.focus();
        }
      }
    } // Bind the handler


    _on(plyr.container, 'keydown', _checkFocus);
  } // Add elements to HTML5 media (source, tracks, etc)


  function _insertChildElements(type, attributes) {
    if (_is.string(attributes)) {
      _insertElement(type, plyr.media, {
        src: attributes
      });
    } else if (attributes.constructor === Array) {
      for (var i = attributes.length - 1; i >= 0; i--) {
        _insertElement(type, plyr.media, attributes[i]);
      }
    }
  } // Insert controls


  function _injectControls() {
    // Sprite
    if (config.loadSprite) {
      var iconUrl = _getIconUrl(); // Only load external sprite using AJAX


      if (iconUrl.absolute) {
        _log('AJAX loading absolute SVG sprite' + (plyr.browser.isIE ? ' (due to IE)' : ''));

        loadSprite(iconUrl.url, "sprite-plyr");
      } else {
        _log('Sprite will be used as external resource directly');
      }
    } // Make a copy of the html


    var html = config.html; // Insert custom video controls

    _log('Injecting custom controls'); // If no controls are specified, create default


    if (!html) {
      html = _buildControls();
    } // Replace seek time instances


    html = _replaceAll(html, '{seektime}', config.seekTime); // Replace all id references with random numbers

    html = _replaceAll(html, '{id}', Math.floor(Math.random() * 10000)); // Controls container

    var target; // Inject to custom location

    if (_is.string(config.selectors.controls.container)) {
      target = document.querySelector(config.selectors.controls.container);
    } // Inject into the container by default


    if (!_is.htmlElement(target)) {
      target = plyr.container;
    } // Inject controls HTML


    target.insertAdjacentHTML('beforeend', html); // Setup tooltips

    if (config.tooltips.controls) {
      var labels = _getElements([config.selectors.controls.wrapper, ' ', config.selectors.labels, ' .', config.classes.hidden].join(''));

      for (var i = labels.length - 1; i >= 0; i--) {
        var label = labels[i];

        _toggleClass(label, config.classes.hidden, false);

        _toggleClass(label, config.classes.tooltip, true);
      }
    }
  } // Find the UI controls and store references


  function _findElements() {
    try {
      plyr.controls = _getElement(config.selectors.controls.wrapper); // Buttons

      plyr.buttons = {};
      plyr.buttons.seek = _getElement(config.selectors.buttons.seek);
      plyr.buttons.play = _getElements(config.selectors.buttons.play);
      plyr.buttons.pause = _getElement(config.selectors.buttons.pause);
      plyr.buttons.restart = _getElement(config.selectors.buttons.restart);
      plyr.buttons.rewind = _getElement(config.selectors.buttons.rewind);
      plyr.buttons.forward = _getElement(config.selectors.buttons.forward);
      plyr.buttons.fullscreen = _getElement(config.selectors.buttons.fullscreen); // Inputs

      plyr.buttons.mute = _getElement(config.selectors.buttons.mute);
      plyr.buttons.captions = _getElement(config.selectors.buttons.captions); // Progress

      plyr.progress = {};
      plyr.progress.container = _getElement(config.selectors.progress.container); // Progress - Buffering

      plyr.progress.buffer = {};
      plyr.progress.buffer.bar = _getElement(config.selectors.progress.buffer);
      plyr.progress.buffer.text = plyr.progress.buffer.bar && plyr.progress.buffer.bar.getElementsByTagName('span')[0]; // Progress - Played

      plyr.progress.played = _getElement(config.selectors.progress.played); // Seek tooltip

      plyr.progress.tooltip = plyr.progress.container && plyr.progress.container.querySelector('.' + config.classes.tooltip); // Volume

      plyr.volume = {};
      plyr.volume.input = _getElement(config.selectors.volume.input);
      plyr.volume.display = _getElement(config.selectors.volume.display); // Timing

      plyr.duration = _getElement(config.selectors.duration);
      plyr.currentTime = _getElement(config.selectors.currentTime);
      plyr.seekTime = _getElements(config.selectors.seekTime);
      return true;
    } catch (e) {
      _warn('It looks like there is a problem with your controls HTML'); // Restore native video controls


      _toggleNativeControls(true);

      return false;
    }
  } // Toggle style hook


  function _toggleStyleHook() {
    _toggleClass(plyr.container, config.selectors.container.replace('.', ''), plyr.supported.full);
  } // Toggle native controls


  function _toggleNativeControls(toggle) {
    if (toggle && _inArray(config.types.html5, plyr.type)) {
      plyr.media.setAttribute('controls', '');
    } else {
      plyr.media.removeAttribute('controls');
    }
  } // Setup aria attribute for play and iframe title


  function _setTitle(iframe) {
    // Find the current text
    var label = config.i18n.play; // If there's a media title set, use that for the label

    if (_is.string(config.title) && config.title.length) {
      label += ', ' + config.title; // Set container label

      plyr.container.setAttribute('aria-label', config.title);
      plyr.container.setAttribute('title', config.title); // TMCDOS
    } // If there's a play button, set label


    if (plyr.supported.full && plyr.buttons.play) {
      for (var i = plyr.buttons.play.length - 1; i >= 0; i--) {
        plyr.buttons.play[i].setAttribute('aria-label', label);
      }
    } // Set iframe title
    // https://github.com/sampotts/plyr/issues/124


    if (_is.htmlElement(iframe)) {
      iframe.setAttribute('title', config.i18n.frameTitle.replace('{title}', config.title));
    }
  } // Setup localStorage


  function _setupStorage() {
    var value = null;
    plyr.storage = {}; // Bail if we don't have localStorage support or it's disabled

    if (!_storage.supported || !config.storage.enabled) {
      return;
    } // Clean up old volume
    // https://github.com/sampotts/plyr/issues/171


    window.localStorage.removeItem('plyr-volume'); // load value from the current key

    value = window.localStorage.getItem(config.storage.key);

    if (!value) {
      // Key wasn't set (or had been cleared), move along
      return;
    } else if (/^\d+(\.\d+)?$/.test(value)) {
      // If value is a number, it's probably volume from an older
      // version of plyr. See: https://github.com/sampotts/plyr/pull/313
      // Update the key to be JSON
      _updateStorage({
        volume: parseFloat(value)
      });
    } else {
      // Assume it's JSON from this or a later version of plyr
      plyr.storage = JSON.parse(value);
    }
  } // Save a value back to local storage


  function _updateStorage(value) {
    // Bail if we don't have localStorage support or it's disabled
    if (!_storage.supported || !config.storage.enabled) {
      return;
    } // Update the working copy of the values


    _extend(plyr.storage, value); // Update storage


    window.localStorage.setItem(config.storage.key, JSON.stringify(plyr.storage));
  } // Setup media


  function _setupMedia() {
    // If there's no media, bail
    if (!plyr.media) {
      _warn('No media element found!');

      return;
    }

    if (plyr.supported.full) {
      // Add type class
      _toggleClass(plyr.container, config.classes.type.replace('{0}', plyr.type), true); // Add video class for embeds
      // This will require changes if audio embeds are added


      if (_inArray(config.types.embed, plyr.type)) {
        _toggleClass(plyr.container, config.classes.type.replace('{0}', 'video'), true);
      } // If there's no autoplay attribute, assume the video is stopped and add state class


      _toggleClass(plyr.container, config.classes.stopped, config.autoplay); // Add iOS class


      _toggleClass(plyr.container, config.classes.isIos, plyr.browser.isIos); // Add touch class


      _toggleClass(plyr.container, config.classes.isTouch, plyr.browser.isTouch); // Inject the player wrapper


      if (plyr.type === 'video') {
        // Create the wrapper div
        var wrapper = document.createElement('div');
        wrapper.setAttribute('class', config.classes.videoWrapper); // Wrap the video in a container

        _wrap(plyr.media, wrapper); // Cache the container


        plyr.videoContainer = wrapper;
      }
    } // Embeds


    if (_inArray(config.types.embed, plyr.type)) {
      _setupEmbed();
    }
  } // Setup YouTube/Vimeo


  function _setupEmbed() {
    var container = document.createElement('div'),
        mediaId,
        id = plyr.type + '-' + Math.floor(Math.random() * 10000); // Parse IDs from URLs if supplied

    switch (plyr.type) {
      case 'youtube':
        mediaId = _parseYouTubeId(plyr.embedId);
        break;

      case 'vimeo':
        mediaId = _parseVimeoId(plyr.embedId);
        break;

      default:
        mediaId = plyr.embedId;
    } // Remove old containers


    var containers = _getElements('[id^="' + plyr.type + '-"]');

    for (var i = containers.length - 1; i >= 0; i--) {
      _remove(containers[i]);
    } // Add embed class for responsive


    _toggleClass(plyr.media, config.classes.videoWrapper, true);

    _toggleClass(plyr.media, config.classes.embedWrapper, true);

    if (plyr.type === 'youtube') {
      // Create the YouTube container
      plyr.media.appendChild(container); // Set ID

      container.setAttribute('id', id); // Setup API

      if (_is.object(window.YT)) {
        _youTubeReady(mediaId, container);
      } else {
        // Load the API
        _injectScript(config.urls.youtube.api); // Setup callback for the API


        window.onYouTubeReadyCallbacks = window.onYouTubeReadyCallbacks || []; // Add to queue

        window.onYouTubeReadyCallbacks.push(function () {
          _youTubeReady(mediaId, container);
        }); // Set callback to process queue

        window.onYouTubeIframeAPIReady = function () {
          window.onYouTubeReadyCallbacks.forEach(function (callback) {
            callback();
          });
        };
      }
    } else if (plyr.type === 'vimeo') {
      // Vimeo needs an extra div to hide controls on desktop (which has full support)
      if (plyr.supported.full) {
        plyr.media.appendChild(container);
      } else {
        container = plyr.media;
      } // Set ID


      container.setAttribute('id', id); // Load the API if not already

      if (!_is.object(window.Vimeo)) {
        _injectScript(config.urls.vimeo.api); // Wait for fragaloop load


        var vimeoTimer = window.setInterval(function () {
          if (_is.object(window.Vimeo)) {
            window.clearInterval(vimeoTimer);

            _vimeoReady(mediaId, container);
          }
        }, 50);
      } else {
        _vimeoReady(mediaId, container);
      }
    } else if (plyr.type === 'soundcloud') {
      // TODO: Currently unsupported and undocumented
      // Inject the iframe
      var soundCloud = document.createElement('iframe'); // Watch for iframe load

      soundCloud.loaded = false;

      _on(soundCloud, 'load', function () {
        soundCloud.loaded = true;
      });

      _setAttributes(soundCloud, {
        'src': 'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/' + mediaId,
        'id': id
      });

      container.appendChild(soundCloud);
      plyr.media.appendChild(container); // Load the API if not already

      if (!window.SC) {
        _injectScript(config.urls.soundcloud.api);
      } // Wait for SC load


      var soundCloudTimer = window.setInterval(function () {
        if (window.SC && soundCloud.loaded) {
          window.clearInterval(soundCloudTimer);

          _soundcloudReady.call(soundCloud);
        }
      }, 50);
    }
  } // When embeds are ready


  function _embedReady() {
    // Setup the UI and call ready if full support
    if (plyr.supported.full) {
      _setupInterface();

      _ready();
    } // Set title


    _setTitle(_getElement('iframe'));
  } // Handle YouTube API ready


  function _youTubeReady(videoId, container) {
    // Setup instance
    // https://developers.google.com/youtube/iframe_api_reference
    plyr.embed = new window.YT.Player(container.id, {
      videoId: videoId,
      playerVars: {
        autoplay: config.autoplay ? 1 : 0,
        controls: plyr.supported.full ? 0 : 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        cc_load_policy: config.captions.defaultActive ? 1 : 0,
        cc_lang_pref: 'en',
        wmode: 'transparent',
        modestbranding: 1,
        disablekb: 1,
        origin: '*' // https://code.google.com/p/gdata-issues/issues/detail?id=5788#c45

      },
      events: {
        'onError': function (event) {
          _triggerEvent(plyr.container, 'error', true, {
            code: event.data,
            embed: event.target
          });
        },
        'onReady': function (event) {
          // Get the instance
          var instance = event.target; // Create a faux HTML5 API using the YouTube API

          plyr.media.play = function () {
            instance.playVideo();
            plyr.media.paused = false;
          };

          plyr.media.pause = function () {
            instance.pauseVideo();
            plyr.media.paused = true;
          };

          plyr.media.stop = function () {
            instance.stopVideo();
            plyr.media.paused = true;
          };

          plyr.media.duration = instance.getDuration();
          plyr.media.paused = true;
          plyr.media.currentTime = 0;
          plyr.media.muted = instance.isMuted(); // Set title

          config.title = instance.getVideoData().title; // Set the tabindex

          if (plyr.supported.full) {
            plyr.media.querySelector('iframe').setAttribute('tabindex', '-1');
          } // Update UI


          _embedReady(); // Trigger timeupdate


          _triggerEvent(plyr.media, 'timeupdate'); // Trigger timeupdate


          _triggerEvent(plyr.media, 'durationchange'); // Reset timer


          window.clearInterval(timers.buffering); // Setup buffering

          timers.buffering = window.setInterval(function () {
            // Get loaded % from YouTube
            plyr.media.buffered = instance.getVideoLoadedFraction(); // Trigger progress only when we actually buffer something

            if (plyr.media.lastBuffered === null || plyr.media.lastBuffered < plyr.media.buffered) {
              _triggerEvent(plyr.media, 'progress');
            } // Set last buffer point


            plyr.media.lastBuffered = plyr.media.buffered; // Bail if we're at 100%

            if (plyr.media.buffered === 1) {
              window.clearInterval(timers.buffering); // Trigger event

              _triggerEvent(plyr.media, 'canplaythrough');
            }
          }, 200);
        },
        'onStateChange': function (event) {
          // Get the instance
          var instance = event.target; // Reset timer

          window.clearInterval(timers.playing); // Handle events
          // -1   Unstarted
          // 0    Ended
          // 1    Playing
          // 2    Paused
          // 3    Buffering
          // 5    Video cued

          switch (event.data) {
            case 0:
              plyr.media.paused = true;

              _triggerEvent(plyr.media, 'ended');

              break;

            case 1:
              plyr.media.paused = false; // If we were seeking, fire seeked event

              if (plyr.media.seeking) {
                _triggerEvent(plyr.media, 'seeked');
              }

              plyr.media.seeking = false;

              _triggerEvent(plyr.media, 'play');

              _triggerEvent(plyr.media, 'playing'); // Poll to get playback progress


              timers.playing = window.setInterval(function () {
                // Set the current time
                plyr.media.currentTime = instance.getCurrentTime(); // Trigger timeupdate

                _triggerEvent(plyr.media, 'timeupdate');
              }, 100); // Check duration again due to YouTube bug
              // https://github.com/sampotts/plyr/issues/374
              // https://code.google.com/p/gdata-issues/issues/detail?id=8690

              if (plyr.media.duration !== instance.getDuration()) {
                plyr.media.duration = instance.getDuration();

                _triggerEvent(plyr.media, 'durationchange');
              }

              break;

            case 2:
              plyr.media.paused = true;

              _triggerEvent(plyr.media, 'pause');

              break;
          }

          _triggerEvent(plyr.container, 'statechange', false, {
            code: event.data
          });
        }
      }
    });
  } // Vimeo ready


  function _vimeoReady(mediaId, container) {
    // Setup instance
    // https://github.com/vimeo/player.js
    plyr.embed = new window.Vimeo.Player(container, {
      id: parseInt(mediaId),
      loop: config.loop,
      autoplay: config.autoplay,
      byline: false,
      portrait: false,
      title: false
    }); // Create a faux HTML5 API using the Vimeo API

    plyr.media.play = function () {
      plyr.embed.play();
      plyr.media.paused = false;
    };

    plyr.media.pause = function () {
      plyr.embed.pause();
      plyr.media.paused = true;
    };

    plyr.media.stop = function () {
      plyr.embed.stop();
      plyr.media.paused = true;
    };

    plyr.media.paused = true;
    plyr.media.currentTime = 0; // Update UI

    _embedReady();

    plyr.embed.getCurrentTime().then(function (value) {
      plyr.media.currentTime = value; // Trigger timeupdate

      _triggerEvent(plyr.media, 'timeupdate');
    });
    plyr.embed.getDuration().then(function (value) {
      plyr.media.duration = value; // Trigger timeupdate

      _triggerEvent(plyr.media, 'durationchange');
    }); // TODO: Captions

    /*if (config.captions.defaultActive) {
        plyr.embed.enableTextTrack('en');
    }*/

    plyr.embed.on('loaded', function () {
      // Fix keyboard focus issues
      // https://github.com/sampotts/plyr/issues/317
      if (_is.htmlElement(plyr.embed.element) && plyr.supported.full) {
        plyr.embed.element.setAttribute('tabindex', '-1');
      }
    });
    plyr.embed.on('play', function () {
      plyr.media.paused = false;

      _triggerEvent(plyr.media, 'play');

      _triggerEvent(plyr.media, 'playing');
    });
    plyr.embed.on('pause', function () {
      plyr.media.paused = true;

      _triggerEvent(plyr.media, 'pause');
    });
    plyr.embed.on('timeupdate', function (data) {
      plyr.media.seeking = false;
      plyr.media.currentTime = data.seconds;

      _triggerEvent(plyr.media, 'timeupdate');
    });
    plyr.embed.on('progress', function (data) {
      plyr.media.buffered = data.percent;

      _triggerEvent(plyr.media, 'progress');

      if (parseInt(data.percent) === 1) {
        // Trigger event
        _triggerEvent(plyr.media, 'canplaythrough');
      }
    });
    plyr.embed.on('seeked', function () {
      plyr.media.seeking = false;

      _triggerEvent(plyr.media, 'seeked');

      _triggerEvent(plyr.media, 'play');
    });
    plyr.embed.on('ended', function () {
      plyr.media.paused = true;

      _triggerEvent(plyr.media, 'ended');
    });
  } // Soundcloud ready


  function _soundcloudReady() {
    /* jshint validthis: true */
    plyr.embed = window.SC.Widget(this); // Setup on ready

    plyr.embed.bind(window.SC.Widget.Events.READY, function () {
      // Create a faux HTML5 API using the Soundcloud API
      plyr.media.play = function () {
        plyr.embed.play();
        plyr.media.paused = false;
      };

      plyr.media.pause = function () {
        plyr.embed.pause();
        plyr.media.paused = true;
      };

      plyr.media.stop = function () {
        plyr.embed.seekTo(0);
        plyr.embed.pause();
        plyr.media.paused = true;
      };

      plyr.media.paused = true;
      plyr.media.currentTime = 0;
      plyr.embed.getDuration(function (value) {
        plyr.media.duration = value / 1000; // Update UI

        _embedReady();
      });
      plyr.embed.getPosition(function (value) {
        plyr.media.currentTime = value; // Trigger timeupdate

        _triggerEvent(plyr.media, 'timeupdate');
      });
      plyr.embed.bind(window.SC.Widget.Events.PLAY, function () {
        plyr.media.paused = false;

        _triggerEvent(plyr.media, 'play');

        _triggerEvent(plyr.media, 'playing');
      });
      plyr.embed.bind(window.SC.Widget.Events.PAUSE, function () {
        plyr.media.paused = true;

        _triggerEvent(plyr.media, 'pause');
      });
      plyr.embed.bind(window.SC.Widget.Events.PLAY_PROGRESS, function (data) {
        plyr.media.seeking = false;
        plyr.media.currentTime = data.currentPosition / 1000;

        _triggerEvent(plyr.media, 'timeupdate');
      });
      plyr.embed.bind(window.SC.Widget.Events.LOAD_PROGRESS, function (data) {
        plyr.media.buffered = data.loadProgress;

        _triggerEvent(plyr.media, 'progress');

        if (parseInt(data.loadProgress) === 1) {
          // Trigger event
          _triggerEvent(plyr.media, 'canplaythrough');
        }
      });
      plyr.embed.bind(window.SC.Widget.Events.FINISH, function () {
        plyr.media.paused = true;

        _triggerEvent(plyr.media, 'ended');
      });
    });
  } // Play media


  function _play() {
    if ('play' in plyr.media) {
      plyr.media.play();
    }
  } // Pause media


  function _pause() {
    if ('pause' in plyr.media) {
      plyr.media.pause();
    }
  } // Toggle playback


  function _togglePlay(toggle) {
    // True toggle
    if (!_is.boolean(toggle)) {
      toggle = plyr.media.paused;
    }

    if (toggle) {
      _play();
    } else {
      _pause();
    }

    return toggle;
  } // Rewind


  function _rewind(seekTime) {
    // Use default if needed
    if (!_is.number(seekTime)) {
      seekTime = config.seekTime;
    }

    _seek(plyr.media.currentTime - seekTime);
  } // Fast forward


  function _forward(seekTime) {
    // Use default if needed
    if (!_is.number(seekTime)) {
      seekTime = config.seekTime;
    }

    _seek(plyr.media.currentTime + seekTime);
  } // Seek to time
  // The input parameter can be an event or a number


  function _seek(input) {
    var targetTime = 0,
        paused = plyr.media.paused,
        duration = _getDuration();

    if (_is.number(input)) {
      targetTime = input;
    } else if (_is.object(input) && _inArray(['input', 'change'], input.type)) {
      // It's the seek slider
      // Seek to the selected time
      targetTime = input.target.value / input.target.max * duration;
    } // Normalise targetTime


    if (targetTime < 0) {
      targetTime = 0;
    } else if (targetTime > duration) {
      targetTime = duration;
    } // Update seek range and progress


    _updateSeekDisplay(targetTime); // Set the current time
    // Try/catch incase the media isn't set and we're calling seek() from source() and IE moans


    try {
      plyr.media.currentTime = targetTime.toFixed(4);
    } catch (e) {} // Embeds


    if (_inArray(config.types.embed, plyr.type)) {
      switch (plyr.type) {
        case 'youtube':
          plyr.embed.seekTo(targetTime);
          break;

        case 'vimeo':
          // Round to nearest second for vimeo
          plyr.embed.setCurrentTime(targetTime.toFixed(0));
          break;

        case 'soundcloud':
          plyr.embed.seekTo(targetTime * 1000);
          break;
      }

      if (paused) {
        _pause();
      } // Trigger timeupdate


      _triggerEvent(plyr.media, 'timeupdate'); // Set seeking flag


      plyr.media.seeking = true; // Trigger seeking

      _triggerEvent(plyr.media, 'seeking');
    } // Logging


    _log('Seeking to ' + plyr.media.currentTime + ' seconds'); // Special handling for 'manual' captions


    _seekManualCaptions(targetTime);
  } // Get the duration (or custom if set)


  function _getDuration() {
    // It should be a number, but parse it just incase
    var duration = parseInt(config.duration),
        // True duration
    mediaDuration = 0; // Only if duration available

    if (plyr.media.duration !== null && !isNaN(plyr.media.duration)) {
      mediaDuration = plyr.media.duration;
    } // If custom duration is funky, use regular duration


    return isNaN(duration) ? mediaDuration : duration;
  } // Check playing state


  function _checkPlaying() {
    _toggleClass(plyr.container, config.classes.playing, !plyr.media.paused);

    _toggleClass(plyr.container, config.classes.stopped, plyr.media.paused);

    _toggleControls(plyr.media.paused);
  } // Save scroll position


  function _saveScrollPosition() {
    scroll = {
      x: window.pageXOffset || 0,
      y: window.pageYOffset || 0
    };
  } // Restore scroll position


  function _restoreScrollPosition() {
    window.scrollTo(scroll.x, scroll.y);
  } // Toggle fullscreen


  function _toggleFullscreen(event) {
    // Check for native support
    var nativeSupport = fullscreen.supportsFullScreen;

    if (nativeSupport) {
      // If it's a fullscreen change event, update the UI
      if (event && event.type === fullscreen.fullScreenEventName) {
        plyr.isFullscreen = fullscreen.isFullScreen(plyr.container);
      } else {
        // Else it's a user request to enter or exit
        if (!fullscreen.isFullScreen(plyr.container)) {
          // Save scroll position
          _saveScrollPosition(); // Request full screen


          fullscreen.requestFullScreen(plyr.container);
        } else {
          // Bail from fullscreen
          fullscreen.cancelFullScreen();
        } // Check if we're actually full screen (it could fail)


        plyr.isFullscreen = fullscreen.isFullScreen(plyr.container);
        return;
      }
    } else {
      // Otherwise, it's a simple toggle
      plyr.isFullscreen = !plyr.isFullscreen; // Bind/unbind escape key

      document.body.style.overflow = plyr.isFullscreen ? 'hidden' : '';
    } // Set class hook


    _toggleClass(plyr.container, config.classes.fullscreen.active, plyr.isFullscreen); // Trap focus


    _focusTrap(plyr.isFullscreen); // Set button state


    if (plyr.buttons && plyr.buttons.fullscreen) {
      _toggleState(plyr.buttons.fullscreen, plyr.isFullscreen);
    } // Trigger an event


    _triggerEvent(plyr.container, plyr.isFullscreen ? 'enterfullscreen' : 'exitfullscreen', true); // Restore scroll position


    if (!plyr.isFullscreen && nativeSupport) {
      _restoreScrollPosition();
    }
  } // Mute


  function _toggleMute(muted) {
    // If the method is called without parameter, toggle based on current value
    if (!_is.boolean(muted)) {
      muted = !plyr.media.muted;
    } // Set button state


    _toggleState(plyr.buttons.mute, muted); // Set mute on the player


    plyr.media.muted = muted; // If volume is 0 after unmuting, set to default

    if (plyr.media.volume === 0) {
      _setVolume(config.volume);
    } // Embeds


    if (_inArray(config.types.embed, plyr.type)) {
      // YouTube
      switch (plyr.type) {
        case 'youtube':
          plyr.embed[plyr.media.muted ? 'mute' : 'unMute']();
          break;

        case 'vimeo':
        case 'soundcloud':
          plyr.embed.setVolume(plyr.media.muted ? 0 : parseFloat(config.volume / config.volumeMax));
          break;
      } // Trigger volumechange for embeds


      _triggerEvent(plyr.media, 'volumechange');
    }
  } // Set volume


  function _setVolume(volume) {
    var max = config.volumeMax,
        min = config.volumeMin; // Load volume from storage if no value specified

    if (_is.undefined(volume)) {
      volume = plyr.storage.volume;
    } // Use config if all else fails


    if (volume === null || isNaN(volume)) {
      volume = config.volume;
    } // Maximum is volumeMax


    if (volume > max) {
      volume = max;
    } // Minimum is volumeMin


    if (volume < min) {
      volume = min;
    } // Set the player volume


    plyr.media.volume = parseFloat(volume / max); // Set the display

    if (plyr.volume.display) {
      plyr.volume.display.value = volume;
    } // Embeds


    if (_inArray(config.types.embed, plyr.type)) {
      switch (plyr.type) {
        case 'youtube':
          plyr.embed.setVolume(plyr.media.volume * 100);
          break;

        case 'vimeo':
        case 'soundcloud':
          plyr.embed.setVolume(plyr.media.volume);
          break;
      } // Trigger volumechange for embeds


      _triggerEvent(plyr.media, 'volumechange');
    } // Toggle muted state


    if (volume === 0) {
      plyr.media.muted = true;
    } else if (plyr.media.muted && volume > 0) {
      _toggleMute();
    }
  } // Increase volume


  function _increaseVolume(step) {
    var volume = plyr.media.muted ? 0 : plyr.media.volume * config.volumeMax;

    if (!_is.number(step)) {
      step = config.volumeStep;
    }

    _setVolume(volume + step);
  } // Decrease volume


  function _decreaseVolume(step) {
    var volume = plyr.media.muted ? 0 : plyr.media.volume * config.volumeMax;

    if (!_is.number(step)) {
      step = config.volumeStep;
    }

    _setVolume(volume - step);
  } // Update volume UI and storage


  function _updateVolume() {
    // Get the current volume
    var volume = plyr.media.muted ? 0 : plyr.media.volume * config.volumeMax; // Update the <input type="range"> if present

    if (plyr.supported.full) {
      if (plyr.volume.input) {
        plyr.volume.input.value = volume;
      }

      if (plyr.volume.display) {
        plyr.volume.display.value = volume;
      }
    } // Update the volume in storage


    _updateStorage({
      volume: volume
    }); // Toggle class if muted


    _toggleClass(plyr.container, config.classes.muted, volume === 0); // Update checkbox for mute state


    if (plyr.supported.full && plyr.buttons.mute) {
      _toggleState(plyr.buttons.mute, volume === 0);
    }
  } // Toggle captions


  function _toggleCaptions(show) {
    // If there's no full support, or there's no caption toggle
    if (!plyr.supported.full || !plyr.buttons.captions) {
      return;
    } // If the method is called without parameter, toggle based on current value


    if (!_is.boolean(show)) {
      show = plyr.container.className.indexOf(config.classes.captions.active) === -1;
    } // Set global


    plyr.captionsEnabled = show; // Toggle state

    _toggleState(plyr.buttons.captions, plyr.captionsEnabled); // Add class hook


    _toggleClass(plyr.container, config.classes.captions.active, plyr.captionsEnabled); // Trigger an event


    _triggerEvent(plyr.container, plyr.captionsEnabled ? 'captionsenabled' : 'captionsdisabled', true); // Save captions state to localStorage


    _updateStorage({
      captionsEnabled: plyr.captionsEnabled
    });
  } // Check if media is loading


  function _checkLoading(event) {
    var loading = event.type === 'waiting'; // Clear timer

    clearTimeout(timers.loading); // Timer to prevent flicker when seeking

    timers.loading = setTimeout(function () {
      // Toggle container class hook
      _toggleClass(plyr.container, config.classes.loading, loading); // Show controls if loading, hide if done


      _toggleControls(loading);
    }, loading ? 250 : 0);
  } // Update <progress> elements


  function _updateProgress(event) {
    if (!plyr.supported.full) {
      return;
    }

    var progress = plyr.progress.played,
        value = 0,
        duration = _getDuration();

    if (event) {
      switch (event.type) {
        // Video playing
        case 'timeupdate':
        case 'seeking':
          if (plyr.controls.pressed) {
            return;
          }

          value = _getPercentage(plyr.media.currentTime, duration); // Set seek range value only if it's a 'natural' time event

          if (event.type === 'timeupdate' && plyr.buttons.seek) {
            plyr.buttons.seek.value = value;
          }

          break;
        // Check buffer status

        case 'playing':
        case 'progress':
          progress = plyr.progress.buffer;

          value = function () {
            var buffered = plyr.media.buffered;

            if (buffered && buffered.length) {
              // HTML5
              return _getPercentage(buffered.end(0), duration);
            } else if (_is.number(buffered)) {
              // YouTube returns between 0 and 1
              return buffered * 100;
            }

            return 0;
          }();

          break;
      }
    } // Set values


    _setProgress(progress, value);
  } // Set <progress> value


  function _setProgress(progress, value) {
    if (!plyr.supported.full) {
      return;
    } // Default to 0


    if (_is.undefined(value)) {
      value = 0;
    } // Default to buffer or bail


    if (_is.undefined(progress)) {
      if (plyr.progress && plyr.progress.buffer) {
        progress = plyr.progress.buffer;
      } else {
        return;
      }
    } // One progress element passed


    if (_is.htmlElement(progress)) {
      progress.value = value;
    } else if (progress) {
      // Object of progress + text element
      if (progress.bar) {
        progress.bar.value = value;
      }

      if (progress.text) {
        progress.text.innerHTML = value;
      }
    }
  } // Update the displayed time


  function _updateTimeDisplay(time, element) {
    // Bail if there's no duration display
    if (!element) {
      return;
    } // Fallback to 0


    if (isNaN(time)) {
      time = 0;
    }

    plyr.secs = parseInt(time % 60);
    plyr.mins = parseInt(time / 60 % 60);
    plyr.hours = parseInt(time / 60 / 60 % 60); // Do we need to display hours?

    var displayHours = parseInt(_getDuration() / 60 / 60 % 60) > 0; // Ensure it's two digits. For example, 03 rather than 3.

    plyr.secs = ('0' + plyr.secs).slice(-2);
    plyr.mins = ('0' + plyr.mins).slice(-2); // Render

    element.innerHTML = (displayHours ? plyr.hours + ':' : '') + plyr.mins + ':' + plyr.secs;
  } // Show the duration on metadataloaded


  function _displayDuration() {
    if (!plyr.supported.full) {
      return;
    } // Determine duration


    var duration = _getDuration() || 0; // If there's only one time display, display duration there

    if (!plyr.duration && config.displayDuration && plyr.media.paused) {
      _updateTimeDisplay(duration, plyr.currentTime);
    } // If there's a duration element, update content


    if (plyr.duration) {
      _updateTimeDisplay(duration, plyr.duration);
    } // Update the tooltip (if visible)


    _updateSeekTooltip();
  } // Handle time change event


  function _timeUpdate(event) {
    // Duration
    _updateTimeDisplay(plyr.media.currentTime, plyr.currentTime); // Ignore updates while seeking


    if (event && event.type === 'timeupdate' && plyr.media.seeking) {
      return;
    } // Playing progress


    _updateProgress(event);
  } // Update seek range and progress


  function _updateSeekDisplay(time) {
    // Default to 0
    if (!_is.number(time)) {
      time = 0;
    }

    var duration = _getDuration(),
        value = _getPercentage(time, duration); // Update progress


    if (plyr.progress && plyr.progress.played) {
      plyr.progress.played.value = value;
    } // Update seek range input


    if (plyr.buttons && plyr.buttons.seek) {
      plyr.buttons.seek.value = value;
    }
  } // Update hover tooltip for seeking


  function _updateSeekTooltip(event) {
    var duration = _getDuration(); // Bail if setting not true


    if (!config.tooltips.seek || !plyr.progress.container || duration === 0) {
      return;
    } // Calculate percentage


    var clientRect = plyr.progress.container.getBoundingClientRect(),
        percent = 0,
        visible = config.classes.tooltip + '--visible'; // Determine percentage, if already visible

    if (!event) {
      if (_hasClass(plyr.progress.tooltip, visible)) {
        percent = plyr.progress.tooltip.style.left.replace('%', '');
      } else {
        return;
      }
    } else {
      percent = 100 / clientRect.width * (event.pageX - clientRect.left);
    } // Set bounds


    if (percent < 0) {
      percent = 0;
    } else if (percent > 100) {
      percent = 100;
    } // Display the time a click would seek to


    _updateTimeDisplay(duration / 100 * percent, plyr.progress.tooltip); // Set position


    plyr.progress.tooltip.style.left = percent + "%"; // Show/hide the tooltip
    // If the event is a moues in/out and percentage is inside bounds

    if (event && _inArray(['mouseenter', 'mouseleave'], event.type)) {
      _toggleClass(plyr.progress.tooltip, visible, event.type === 'mouseenter');
    }
  } // Show the player controls in fullscreen mode


  function _toggleControls(toggle) {
    // Don't hide if config says not to, it's audio, or not ready or loading
    if (!config.hideControls || plyr.type === 'audio') {
      return;
    }

    var delay = 0,
        isEnterFullscreen = false,
        show = toggle,
        loading = _hasClass(plyr.container, config.classes.loading); // Default to false if no boolean


    if (!_is.boolean(toggle)) {
      if (toggle && toggle.type) {
        // Is the enter fullscreen event
        isEnterFullscreen = toggle.type === 'enterfullscreen'; // Whether to show controls

        show = _inArray(['mousemove', 'touchstart', 'mouseenter', 'focus'], toggle.type); // Delay hiding on move events

        if (_inArray(['mousemove', 'touchmove'], toggle.type)) {
          delay = 2000;
        } // Delay a little more for keyboard users


        if (toggle.type === 'focus') {
          delay = 3000;
        }
      } else {
        show = _hasClass(plyr.container, config.classes.hideControls);
      }
    } // Clear timer every movement


    window.clearTimeout(timers.hover); // If the mouse is not over the controls, set a timeout to hide them

    if (show || plyr.media.paused || loading) {
      _toggleClass(plyr.container, config.classes.hideControls, false); // Always show controls when paused or if touch


      if (plyr.media.paused || loading) {
        return;
      } // Delay for hiding on touch


      if (plyr.browser.isTouch) {
        delay = 3000;
      }
    } // If toggle is false or if we're playing (regardless of toggle),
    // then set the timer to hide the controls


    if (!show || !plyr.media.paused) {
      timers.hover = window.setTimeout(function () {
        // If the mouse is over the controls (and not entering fullscreen), bail
        if ((plyr.controls.pressed || plyr.controls.hover) && !isEnterFullscreen) {
          return;
        }

        _toggleClass(plyr.container, config.classes.hideControls, true);
      }, delay);
    }
  } // Add common function to retrieve media source


  function _source(source) {
    // If not null or undefined, parse it
    if (!_is.undefined(source)) {
      _updateSource(source);

      return;
    } // Return the current source


    var url;

    switch (plyr.type) {
      case 'youtube':
        url = plyr.embed.getVideoUrl();
        break;

      case 'vimeo':
        plyr.embed.getVideoUrl.then(function (value) {
          url = value;
        });
        break;

      case 'soundcloud':
        plyr.embed.getCurrentSound(function (object) {
          url = object.permalink_url;
        });
        break;

      default:
        url = plyr.media.currentSrc;
        break;
    }

    return url || '';
  } // Update source
  // Sources are not checked for support so be careful


  function _updateSource(source) {
    if (!_is.object(source) || !('sources' in source) || !source.sources.length) {
      _warn('Invalid source format');

      return;
    } // Remove ready class hook


    _toggleClass(plyr.container, config.classes.ready, false); // Pause playback


    _pause(); // Update seek range and progress


    _updateSeekDisplay(); // Reset buffer progress


    _setProgress(); // Cancel current network requests


    _cancelRequests(); // Setup new source


    function setup() {
      // Remove embed object
      plyr.embed = null; // Remove the old media

      _remove(plyr.media); // Remove video container


      if (plyr.type === 'video' && plyr.videoContainer) {
        _remove(plyr.videoContainer);
      } // Reset class name


      if (plyr.container) {
        plyr.container.removeAttribute('class');
      } // Set the type


      if ('type' in source) {
        plyr.type = source.type; // Get child type for video (it might be an embed)

        if (plyr.type === 'video') {
          var firstSource = source.sources[0];

          if ('type' in firstSource && _inArray(config.types.embed, firstSource.type)) {
            plyr.type = firstSource.type;
          }
        }
      } // Check for support


      plyr.supported = supported(plyr.type); // Create new markup

      switch (plyr.type) {
        case 'video':
          plyr.media = document.createElement('video');
          break;

        case 'audio':
          plyr.media = document.createElement('audio');
          break;

        case 'youtube':
        case 'vimeo':
        case 'soundcloud':
          plyr.media = document.createElement('div');
          plyr.embedId = source.sources[0].src;
          break;
      } // Inject the new element


      _prependChild(plyr.container, plyr.media); // Autoplay the new source?


      if (_is.boolean(source.autoplay)) {
        config.autoplay = source.autoplay;
      } // Set attributes for audio and video


      if (_inArray(config.types.html5, plyr.type)) {
        if (config.crossorigin) {
          plyr.media.setAttribute('crossorigin', '');
        }

        if (config.autoplay) {
          plyr.media.setAttribute('autoplay', '');
        }

        if ('poster' in source) {
          plyr.media.setAttribute('poster', source.poster);
        }

        if (config.loop) {
          plyr.media.setAttribute('loop', '');
        }
      } // Restore class hooks


      _toggleClass(plyr.container, config.classes.fullscreen.active, plyr.isFullscreen);

      _toggleClass(plyr.container, config.classes.captions.active, plyr.captionsEnabled);

      _toggleStyleHook(); // Set new sources for html5


      if (_inArray(config.types.html5, plyr.type)) {
        _insertChildElements('source', source.sources);
      } // Set up from scratch


      _setupMedia(); // HTML5 stuff


      if (_inArray(config.types.html5, plyr.type)) {
        // Setup captions
        if ('tracks' in source) {
          _insertChildElements('track', source.tracks);
        } // Load HTML5 sources


        plyr.media.load();
      } // If HTML5 or embed but not fully supported, setupInterface and call ready now


      if (_inArray(config.types.html5, plyr.type) || _inArray(config.types.embed, plyr.type) && !plyr.supported.full) {
        // Setup interface
        _setupInterface(); // Call ready


        _ready();
      } // Set aria title and iframe title


      config.title = source.title;

      _setTitle();
    } // Destroy instance adn wait for callback
    // Vimeo throws a wobbly if you don't wait


    _destroy(setup, false);
  } // Update poster


  function _updatePoster(source) {
    if (plyr.type === 'video') {
      plyr.media.setAttribute('poster', source);
    }
  } // Listen for control events


  function _controlListeners() {
    // IE doesn't support input event, so we fallback to change
    var inputEvent = plyr.browser.isIE ? 'change' : 'input'; // Click play/pause helper

    function togglePlay() {
      var play = _togglePlay(); // Determine which buttons


      var trigger = plyr.buttons[play ? 'play' : 'pause'],
          target = plyr.buttons[play ? 'pause' : 'play']; // Get the last play button to account for the large play button

      if (target && target.length > 1) {
        target = target[target.length - 1];
      } else {
        target = target[0];
      } // Setup focus and tab focus


      if (target) {
        var hadTabFocus = _hasClass(trigger, config.classes.tabFocus);

        setTimeout(function () {
          target.focus();

          if (hadTabFocus) {
            _toggleClass(trigger, config.classes.tabFocus, false);

            _toggleClass(target, config.classes.tabFocus, true);
          }
        }, 100);
      }
    } // Get the focused element


    function getFocusElement() {
      var focused = document.activeElement;

      if (!focused || focused === document.body) {
        focused = null;
      } else {
        focused = document.querySelector(':focus');
      }

      return focused;
    } // Get the key code for an event


    function getKeyCode(event) {
      return event.keyCode ? event.keyCode : event.which;
    } // Detect tab focus


    function checkTabFocus(focused) {
      for (var button in plyr.buttons) {
        var element = plyr.buttons[button];

        if (_is.nodeList(element)) {
          for (var i = 0; i < element.length; i++) {
            _toggleClass(element[i], config.classes.tabFocus, element[i] === focused);
          }
        } else {
          _toggleClass(element, config.classes.tabFocus, element === focused);
        }
      }
    } // Keyboard shortcuts


    if (config.keyboardShorcuts.focused) {
      var last = null; // Handle global presses

      if (config.keyboardShorcuts.global) {
        _on(window, 'keydown keyup', function (event) {
          var code = getKeyCode(event),
              focused = getFocusElement(),
              allowed = [48, 49, 50, 51, 52, 53, 54, 56, 57, 75, 77, 70, 67],
              count = get().length; // Only handle global key press if there's only one player
          // and the key is in the allowed keys
          // and if the focused element is not editable (e.g. text input)
          // and any that accept key input http://webaim.org/techniques/keyboard/

          if (count === 1 && _inArray(allowed, code) && (!_is.htmlElement(focused) || !_matches(focused, config.selectors.editable))) {
            handleKey(event);
          }
        });
      } // Handle presses on focused


      _on(plyr.container, 'keydown keyup', handleKey);
    }

    function handleKey(event) {
      var code = getKeyCode(event),
          pressed = event.type === 'keydown',
          held = pressed && code === last; // If the event is bubbled from the media element
      // Firefox doesn't get the keycode for whatever reason

      if (!_is.number(code)) {
        return;
      } // Seek by the number keys


      function seekByKey() {
        // Get current duration
        var duration = plyr.media.duration; // Bail if we have no duration set

        if (!_is.number(duration)) {
          return;
        } // Divide the max duration into 10th's and times by the number value


        _seek(duration / 10 * (code - 48));
      } // Handle the key on keydown
      // Reset on keyup


      if (pressed) {
        // Which keycodes should we prevent default
        var preventDefault = [48, 49, 50, 51, 52, 53, 54, 56, 57, 32, 75, 38, 40, 77, 39, 37, 70, 67]; // If the code is found prevent default (e.g. prevent scrolling for arrows)

        if (_inArray(preventDefault, code)) {
          event.preventDefault();
          event.stopPropagation();
        }

        switch (code) {
          // 0-9
          case 48:
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57:
            if (!held) {
              seekByKey();
            }

            break;
          // Space and K key

          case 32:
          case 75:
            if (!held) {
              _togglePlay();
            }

            break;
          // Arrow up

          case 38:
            _increaseVolume();

            break;
          // Arrow down

          case 40:
            _decreaseVolume();

            break;
          // M key

          case 77:
            if (!held) {
              _toggleMute();
            }

            break;
          // Arrow forward

          case 39:
            _forward();

            break;
          // Arrow back

          case 37:
            _rewind();

            break;
          // F key

          case 70:
            _toggleFullscreen();

            break;
          // C key

          case 67:
            if (!held) {
              _toggleCaptions();
            }

            break;
        } // Escape is handle natively when in full screen
        // So we only need to worry about non native


        if (!fullscreen.supportsFullScreen && plyr.isFullscreen && code === 27) {
          _toggleFullscreen();
        } // Store last code for next cycle


        last = code;
      } else {
        last = null;
      }
    } // Focus/tab management


    _on(window, 'keyup', function (event) {
      var code = getKeyCode(event),
          focused = getFocusElement();

      if (code === 9) {
        checkTabFocus(focused);
      }
    });

    _on(document.body, 'click', function () {
      _toggleClass(_getElement('.' + config.classes.tabFocus), config.classes.tabFocus, false);
    });

    for (var button in plyr.buttons) {
      var element = plyr.buttons[button];

      _on(element, 'blur', function () {
        _toggleClass(element, 'tab-focus', false);
      });
    } // Play


    _proxyListener(plyr.buttons.play, 'click', config.listeners.play, togglePlay); // Pause


    _proxyListener(plyr.buttons.pause, 'click', config.listeners.pause, togglePlay); // Restart


    _proxyListener(plyr.buttons.restart, 'click', config.listeners.restart, _seek); // Rewind


    _proxyListener(plyr.buttons.rewind, 'click', config.listeners.rewind, _rewind); // Fast forward


    _proxyListener(plyr.buttons.forward, 'click', config.listeners.forward, _forward); // Seek


    _proxyListener(plyr.buttons.seek, inputEvent, config.listeners.seek, _seek); // Set volume


    _proxyListener(plyr.volume.input, inputEvent, config.listeners.volume, function () {
      _setVolume(plyr.volume.input.value);
    }); // Mute


    _proxyListener(plyr.buttons.mute, 'click', config.listeners.mute, _toggleMute); // Fullscreen


    _proxyListener(plyr.buttons.fullscreen, 'click', config.listeners.fullscreen, _toggleFullscreen); // Handle user exiting fullscreen by escaping etc


    if (fullscreen.supportsFullScreen) {
      _on(document, fullscreen.fullScreenEventName, _toggleFullscreen);
    } // Captions


    _proxyListener(plyr.buttons.captions, 'click', config.listeners.captions, _toggleCaptions); // Seek tooltip


    _on(plyr.progress.container, 'mouseenter mouseleave mousemove', _updateSeekTooltip); // Toggle controls visibility based on mouse movement


    if (config.hideControls) {
      // Toggle controls on mouse events and entering fullscreen
      _on(plyr.container, 'mouseenter mouseleave mousemove touchstart touchend touchcancel touchmove enterfullscreen', _toggleControls); // Watch for cursor over controls so they don't hide when trying to interact


      _on(plyr.controls, 'mouseenter mouseleave', function (event) {
        plyr.controls.hover = event.type === 'mouseenter';
      }); // Watch for cursor over controls so they don't hide when trying to interact


      _on(plyr.controls, 'mousedown mouseup touchstart touchend touchcancel', function (event) {
        plyr.controls.pressed = _inArray(['mousedown', 'touchstart'], event.type);
      }); // Focus in/out on controls


      _on(plyr.controls, 'focus blur', _toggleControls, true);
    } // Adjust volume on scroll


    _on(plyr.volume.input, 'wheel', function (event) {
      event.preventDefault(); // Detect "natural" scroll - suppored on OS X Safari only
      // Other browsers on OS X will be inverted until support improves

      var inverted = event.webkitDirectionInvertedFromDevice,
          step = config.volumeStep / 5; // Scroll down (or up on natural) to decrease

      if (event.deltaY < 0 || event.deltaX > 0) {
        if (inverted) {
          _decreaseVolume(step);
        } else {
          _increaseVolume(step);
        }
      } // Scroll up (or down on natural) to increase


      if (event.deltaY > 0 || event.deltaX < 0) {
        if (inverted) {
          _increaseVolume(step);
        } else {
          _decreaseVolume(step);
        }
      }
    });
  } // Listen for media events


  function _mediaListeners() {
    // Time change on media
    _on(plyr.media, 'timeupdate seeking', _timeUpdate); // Update manual captions


    _on(plyr.media, 'timeupdate', _seekManualCaptions); // Display duration


    _on(plyr.media, 'durationchange loadedmetadata', _displayDuration); // Handle the media finishing


    _on(plyr.media, 'ended', function () {
      // Show poster on end
      if (plyr.type === 'video' && config.showPosterOnEnd) {
        // Clear
        if (plyr.type === 'video') {
          _setCaption();
        } // Restart


        _seek(); // Re-load media


        plyr.media.load();
      }
    }); // Check for buffer progress


    _on(plyr.media, 'progress playing', _updateProgress); // Handle native mute


    _on(plyr.media, 'volumechange', _updateVolume); // Handle native play/pause


    _on(plyr.media, 'play pause ended', _checkPlaying); // Loading


    _on(plyr.media, 'waiting canplay seeked', _checkLoading); // Click video


    if (config.clickToPlay && plyr.type !== 'audio') {
      // Re-fetch the wrapper
      var wrapper = _getElement('.' + config.classes.videoWrapper); // Bail if there's no wrapper (this should never happen)


      if (!wrapper) {
        return;
      } // Set cursor


      wrapper.style.cursor = "pointer"; // On click play, pause ore restart

      _on(wrapper, 'click', function () {
        // Touch devices will just show controls (if we're hiding controls)
        if (config.hideControls && plyr.browser.isTouch && !plyr.media.paused) {
          return;
        }

        if (plyr.media.paused) {
          _play();
        } else if (plyr.media.ended) {
          _seek();

          _play();
        } else {
          _pause();
        }
      });
    } // Disable right click


    if (config.disableContextMenu) {
      _on(plyr.media, 'contextmenu', function (event) {
        event.preventDefault();
      });
    } // Proxy events to container
    // Bubble up key events for Edge


    _on(plyr.media, config.events.concat(['keyup', 'keydown']).join(' '), function (event) {
      _triggerEvent(plyr.container, event.type, true);
    });
  } // Cancel current network requests
  // See https://github.com/sampotts/plyr/issues/174


  function _cancelRequests() {
    if (!_inArray(config.types.html5, plyr.type)) {
      return;
    } // Remove child sources


    var sources = plyr.media.querySelectorAll('source');

    for (var i = 0; i < sources.length; i++) {
      _remove(sources[i]);
    } // Set blank video src attribute
    // This is to prevent a MEDIA_ERR_SRC_NOT_SUPPORTED error
    // Info: http://stackoverflow.com/questions/32231579/how-to-properly-dispose-of-an-html5-video-and-close-socket-or-connection


    plyr.media.setAttribute('src', config.blankUrl); // Load the new empty source
    // This will cancel existing requests
    // See https://github.com/sampotts/plyr/issues/174

    plyr.media.load(); // Debugging

    _log('Cancelled network requests');
  } // Destroy an instance
  // Event listeners are removed when elements are removed
  // http://stackoverflow.com/questions/12528049/if-a-dom-element-is-removed-are-its-listeners-also-removed-from-memory


  function _destroy(callback, restore) {
    // Bail if the element is not initialized
    if (!plyr.init) {
      return null;
    } // Type specific stuff


    switch (plyr.type) {
      case 'youtube':
        // Clear timers
        window.clearInterval(timers.buffering);
        window.clearInterval(timers.playing); // Destroy YouTube API

        plyr.embed.destroy(); // Clean up

        cleanUp();
        break;

      case 'vimeo':
        // Destroy Vimeo API
        // then clean up (wait, to prevent postmessage errors)
        plyr.embed.unload().then(cleanUp); // Vimeo does not always return

        timers.cleanUp = window.setTimeout(cleanUp, 200);
        break;

      case 'video':
      case 'audio':
        // Restore native video controls
        _toggleNativeControls(true); // Clean up


        cleanUp();
        break;
    }

    function cleanUp() {
      clearTimeout(timers.cleanUp); // Default to restore original element

      if (!_is.boolean(restore)) {
        restore = true;
      } // Callback


      if (_is.function(callback)) {
        callback.call(original);
      } // Bail if we don't need to restore the original element


      if (!restore) {
        return;
      } // Remove init flag


      plyr.init = false; // Replace the container with the original element provided

      plyr.container.parentNode.replaceChild(original, plyr.container); // Allow overflow (set on fullscreen)

      document.body.style.overflow = ''; // Event

      _triggerEvent(original, 'destroyed', true);
    }
  } // Setup a player


  function _init() {
    // Bail if the element is initialized
    if (plyr.init) {
      return null;
    } // Setup the fullscreen api


    fullscreen = _fullscreen(); // Sniff out the browser

    plyr.browser = _browserSniff(); // Bail if nothing to setup

    if (!_is.htmlElement(plyr.media)) {
      return;
    } // Load saved settings from localStorage


    _setupStorage(); // Set media type based on tag or data attribute
    // Supported: video, audio, vimeo, youtube


    var tagName = media.tagName.toLowerCase();

    if (tagName === 'div') {
      plyr.type = media.getAttribute('data-type');
      plyr.embedId = media.getAttribute('data-video-id'); // Clean up

      media.removeAttribute('data-type');
      media.removeAttribute('data-video-id');
    } else {
      plyr.type = tagName;
      config.crossorigin = media.getAttribute('crossorigin') !== null;
      config.autoplay = config.autoplay || media.getAttribute('autoplay') !== null;
      config.loop = config.loop || media.getAttribute('loop') !== null;
    } // Check for support


    plyr.supported = supported(plyr.type); // If no native support, bail

    if (!plyr.supported.basic) {
      return;
    } // Wrap media


    plyr.container = _wrap(media, document.createElement('div')); // Allow focus to be captured

    plyr.container.setAttribute('tabindex', 0); // Add style hook

    _toggleStyleHook(); // Debug info


    _log('' + plyr.browser.name + ' ' + plyr.browser.version); // Setup media


    _setupMedia(); // Setup interface
    // If embed but not fully supported, setupInterface (to avoid flash of controls) and call ready now


    if (_inArray(config.types.html5, plyr.type) || _inArray(config.types.embed, plyr.type) && !plyr.supported.full) {
      // Setup UI
      _setupInterface(); // Call ready


      _ready(); // Set title on button and frame


      _setTitle();
    } // Successful setup


    plyr.init = true;
  } // Setup the UI


  function _setupInterface() {
    // Don't setup interface if no support
    if (!plyr.supported.full) {
      _warn('Basic support only', plyr.type); // Remove controls


      _remove(_getElement(config.selectors.controls.wrapper)); // Remove large play


      _remove(_getElement(config.selectors.buttons.play)); // Restore native controls


      _toggleNativeControls(true); // Bail


      return;
    } // Inject custom controls if not present


    var controlsMissing = !_getElements(config.selectors.controls.wrapper).length;

    if (controlsMissing) {
      // Inject custom controls
      _injectControls();
    } // Find the elements


    if (!_findElements()) {
      return;
    } // If the controls are injected, re-bind listeners for controls


    if (controlsMissing) {
      _controlListeners();
    } // Media element listeners


    _mediaListeners(); // Remove native controls


    _toggleNativeControls(); // Setup fullscreen


    _setupFullscreen(); // Captions


    _setupCaptions(); // Set volume


    _setVolume();

    _updateVolume(); // Reset time display


    _timeUpdate(); // Update the UI


    _checkPlaying();
  }

  api = {
    getOriginal: function () {
      return original;
    },
    getContainer: function () {
      return plyr.container;
    },
    getEmbed: function () {
      return plyr.embed;
    },
    getMedia: function () {
      return plyr.media;
    },
    getType: function () {
      return plyr.type;
    },
    getDuration: _getDuration,
    getCurrentTime: function () {
      return plyr.media.currentTime;
    },
    getVolume: function () {
      return plyr.media.volume;
    },
    isMuted: function () {
      return plyr.media.muted;
    },
    isReady: function () {
      return _hasClass(plyr.container, config.classes.ready);
    },
    isLoading: function () {
      return _hasClass(plyr.container, config.classes.loading);
    },
    isPaused: function () {
      return plyr.media.paused;
    },
    on: function (event, callback) {
      _on(plyr.container, event, callback);

      return this;
    },
    play: _play,
    pause: _pause,
    stop: function () {
      _pause();

      _seek();
    },
    restart: _seek,
    rewind: _rewind,
    forward: _forward,
    seek: _seek,
    source: _source,
    poster: _updatePoster,
    setVolume: _setVolume,
    togglePlay: _togglePlay,
    toggleMute: _toggleMute,
    toggleCaptions: _toggleCaptions,
    toggleFullscreen: _toggleFullscreen,
    toggleControls: _toggleControls,
    isFullscreen: function () {
      return plyr.isFullscreen || false;
    },
    support: function (mimeType) {
      return _supportMime(plyr, mimeType);
    },
    destroy: _destroy
  }; // Everything done

  function _ready() {
    // Ready event at end of execution stack
    window.setTimeout(function () {
      _triggerEvent(plyr.media, 'ready');
    }, 0); // Set class hook on media element

    _toggleClass(plyr.media, defaults.classes.setup, true); // Set container class for ready


    _toggleClass(plyr.container, config.classes.ready, true); // Store a refernce to instance


    plyr.media.plyr = api; // Autoplay

    if (config.autoplay) {
      _play();
    }
  } // Initialize instance


  _init(); // If init failed, return null


  if (!plyr.init) {
    return null;
  }

  return api;
} // Load a sprite


function loadSprite(url, id) {
  var x = new XMLHttpRequest(); // If the id is set and sprite exists, bail

  if (_is.string(id) && _is.htmlElement(document.querySelector('#' + id))) {
    return;
  } // Create placeholder (to prevent loading twice)


  var container = document.createElement('div');
  container.setAttribute('hidden', '');

  if (_is.string(id)) {
    container.setAttribute('id', id);
  }

  document.body.insertBefore(container, document.body.childNodes[0]); // Check for CORS support

  if ('withCredentials' in x) {
    x.open('GET', url, true);
  } else {
    return;
  } // Inject hidden div with sprite on load


  x.onload = function () {
    container.innerHTML = x.responseText;
  };

  x.send();
} // Check for support


function supported(type) {
  var browser = _browserSniff(),
      isOldIE = browser.isIE && browser.version <= 9,
      isIos = browser.isIos,
      isIphone = browser.isIphone,
      audioSupport = !!document.createElement('audio').canPlayType,
      videoSupport = !!document.createElement('video').canPlayType,
      basic = false,
      full = false;

  switch (type) {
    case 'video':
      basic = videoSupport;
      full = basic && !isOldIE && !isIphone;
      break;

    case 'audio':
      basic = audioSupport;
      full = basic && !isOldIE;
      break;
    // Vimeo does not seem to be supported on iOS via API
    // Issue raised https://github.com/vimeo/player.js/issues/87

    case 'vimeo':
      basic = true;
      full = !isOldIE && !isIos;
      break;

    case 'youtube':
      basic = true;
      full = !isOldIE && !isIos; // YouTube seems to work on iOS 10+ on iPad

      if (isIos && !isIphone && browser.version >= 10) {
        full = true;
      }

      break;

    case 'soundcloud':
      basic = true;
      full = !isOldIE && !isIphone;
      break;

    default:
      basic = audioSupport && videoSupport;
      full = basic && !isOldIE;
  }

  return {
    basic: basic,
    full: full
  };
} // Setup function


function setup(targets, options) {
  // Custom event polyfill
  // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
  if (typeof window.CustomEvent !== 'function') {
    function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
  } // Get the players


  var players = [],
      instances = [],
      selector = [defaults.selectors.html5, defaults.selectors.embed].join(','); // Select the elements

  if (_is.string(targets)) {
    // String selector passed
    targets = document.querySelectorAll(targets);
  } else if (_is.htmlElement(targets)) {
    // Single HTMLElement passed
    targets = [targets];
  } else if (!_is.nodeList(targets) && !_is.array(targets) && !_is.string(targets)) {
    // No selector passed, possibly options as first argument
    // If options are the first argument
    if (_is.undefined(options) && _is.object(targets)) {
      options = targets;
    } // Use default selector


    targets = document.querySelectorAll(selector);
  } // Convert NodeList to array


  if (_is.nodeList(targets)) {
    targets = Array.prototype.slice.call(targets);
  } // Bail if disabled or no basic support
  // You may want to disable certain UAs etc


  if (!supported().basic || !targets.length) {
    return false;
  } // Add to container list


  function add(target, media) {
    if (!_hasClass(media, defaults.classes.hook)) {
      players.push({
        // Always wrap in a <div> for styling
        //container:  _wrap(media, document.createElement('div')),
        // Could be a container or the media itself
        target: target,
        // This should be the <video>, <audio> or <div> (YouTube/Vimeo)
        media: media
      });
    }
  } // Check if the targets have multiple media elements


  for (var i = 0; i < targets.length; i++) {
    var target = targets[i]; // Get children

    var children = target.querySelectorAll(selector); // If there's more than one media element child, wrap them

    if (children.length) {
      for (var x = 0; x < children.length; x++) {
        add(target, children[x]);
      }
    } else if (_matches(target, selector)) {
      // Target is media element
      add(target, target);
    }
  } // Create a player instance for each element


  players.forEach(function (player) {
    var element = player.target,
        media = player.media,
        match = false; // The target element can also be the media element

    if (media === element) {
      match = true;
    } // Setup a player instance and add to the element
    // Create instance-specific config


    var data = {}; // Try parsing data attribute config

    try {
      data = JSON.parse(element.getAttribute('data-plyr'));
    } catch (e) {}

    var config = _extend({}, defaults, options, data); // Bail if not enabled


    if (!config.enabled) {
      return null;
    } // Create new instance


    var instance = new Plyr(media, config); // Go to next if setup failed

    if (!_is.object(instance)) {
      return;
    } // Listen for events if debugging


    if (config.debug) {
      var events = config.events.concat(['setup', 'statechange', 'enterfullscreen', 'exitfullscreen', 'captionsenabled', 'captionsdisabled']);

      _on(instance.getContainer(), events.join(' '), function (event) {
        console.log([config.logPrefix, 'event:', event.type].join(' '), event.detail.plyr);
      });
    } // Callback


    _event(instance.getContainer(), 'setup', true, {
      plyr: instance
    }); // Add to return array even if it's already setup


    instances.push(instance);
  });
  return instances;
} // Get all instances within a provided container


function get(container) {
  if (_is.string(container)) {
    // Get selector if string passed
    container = document.querySelector(container);
  } else if (_is.undefined(container)) {
    // Use body by default to get all on page
    container = document.body;
  } // If we have a HTML element


  if (_is.htmlElement(container)) {
    var elements = container.querySelectorAll('.' + defaults.classes.setup),
        instances = [];
    Array.prototype.slice.call(elements).forEach(function (element) {
      if (_is.object(element.plyr)) {
        instances.push(element.plyr);
      }
    });
    return instances;
  }

  return [];
}

/* harmony default export */ __webpack_exports__["a"] = ({
  setup: setup,
  supported: supported,
  loadSprite: loadSprite,
  get: get
});

/***/ }),
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue_responsive__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__routes__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__events__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__tool_cook__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__config__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__App__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__App___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__App__);









__webpack_require__(15);

__WEBPACK_IMPORTED_MODULE_0_vue__["a" /* default */].config.productionTip = false;
__WEBPACK_IMPORTED_MODULE_0_vue__["a" /* default */].use(__WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]);
__WEBPACK_IMPORTED_MODULE_0_vue__["a" /* default */].use(__WEBPACK_IMPORTED_MODULE_2_vue_responsive__["a" /* default */]);
__WEBPACK_IMPORTED_MODULE_3__routes__["a" /* default */].afterEach(function (to, from) {
  var title = to.meta.title;
  document.title = 'ROI/CPA optimizer' + (title != null && title != '' ? ' - ' + title : '');
});

window.isDate = function (d) {
  return Object.prototype.toString.call(d) === '[object Date]';
};

window.isArray = function (a) {
  return Object.prototype.toString.call(a) === '[object Array]';
};

window.isObject = function (a) {
  return !!a && a.constructor === Object;
};

if (!Math.sign) {
  Math.sign = function (x) {
    // If x is NaN, the result is NaN.
    // If x is -0, the result is -0.
    // If x is +0, the result is +0.
    // If x is negative and not -0, the result is -1.
    // If x is positive and not +0, the result is +1.
    x = +x; // convert to a number

    if (x === 0 || isNaN(x)) {
      return Number(x);
    }

    return x > 0 ? 1 : -1;
  };
} // auto-focus certain form field


__WEBPACK_IMPORTED_MODULE_0_vue__["a" /* default */].directive('focus', {
  inserted: function (el, binding, vnode) {
    __WEBPACK_IMPORTED_MODULE_0_vue__["a" /* default */].nextTick(function () {
      el.focus();
    });
  }
});
new __WEBPACK_IMPORTED_MODULE_0_vue__["a" /* default */]({
  el: '#app',
  router: __WEBPACK_IMPORTED_MODULE_3__routes__["a" /* default */],
  created: function () {
    this.info = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__tool_cook__["a" /* jsonCookieValue */])(__WEBPACK_IMPORTED_MODULE_6__config__["a" /* default */].cookie_info, {});
    __WEBPACK_IMPORTED_MODULE_4__events__["a" /* default */].$on('show_spin', this.showSpin);
    __WEBPACK_IMPORTED_MODULE_4__events__["a" /* default */].$on('hide_spin', this.hideSpin);
  },
  data: function () {
    var a = {
      info: {},
      spin_visible: 0,
      go_back: '' // where to return after successful login

    };
    return a;
  },
  computed: {
    is_loged: function () {
      return this.info != null && this.info.id != null && this.info.id != 0;
    },
    user_id: function () {
      if (this.info != null && this.info.id != null) return this.info.id;else return 0;
    },
    user_name: function () {
      if (this.info != null && this.info.full_name != null) return this.info.full_name;else return '';
    }
  },
  methods: {
    showSpin: function () {
      this.spin_visible++;
    },
    hideSpin: function () {
      if (this.spin_visible) this.spin_visible--;
    }
  },
  render: h => h(__WEBPACK_IMPORTED_MODULE_7__App___default.a)
});

/***/ }),
/* 57 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = clearFileInput;
/* unused harmony export encodeFilename */
// reset/clear FILE type inputs
function clearFileInput(ctrl) {
  try {
    ctrl.value = null;
  } catch (ex) {}

  if (ctrl.value) ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
} // RFC5987

function encodeFilename(str) {
  return encodeURIComponent(str). // Note that although RFC3986 reserves "!", RFC5987 does not,
  // so we do not need to escape it
  replace(/['()]/g, escape). // i.e., %27 %28 %29
  replace(/\*/g, '%2A'). // The following are not required for percent-encoding per RFC5987,
  // so we can allow for a little better readability over the wire: |`^
  replace(/%(?:7C|60|5E)/g, unescape);
}

/***/ }),
/* 58 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 59 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 60 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 61 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 62 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 63 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 64 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 65 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 66 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 67 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 68 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 69 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 70 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 71 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 72 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/CalR.0d76f45.svg";

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/graR.34aab78.svg";

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/oR.7efe50b.svg";

/***/ }),
/* 76 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+DQo8c3ZnIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4NCiAgPHJlY3QgeD0iNDYuNSIgeT0iNDAiIHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiIGZpbGw9IiMyOWE1ZDkiIHRyYW5zZm9ybT0icm90YXRlKDAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCkiLz4NCiAgPHJlY3QgeD0iNDYuNSIgeT0iNDAiIHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiIGZpbGw9IiMyOWE1ZDkiIHRyYW5zZm9ybT0icm90YXRlKDMwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApIi8+ICANCiAgPHJlY3QgeD0iNDYuNSIgeT0iNDAiIHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiIGZpbGw9IiMyOWE1ZDkiIHRyYW5zZm9ybT0icm90YXRlKDYwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApIi8+ICANCiAgPHJlY3QgeD0iNDYuNSIgeT0iNDAiIHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiIGZpbGw9IiMyOWE1ZDkiIHRyYW5zZm9ybT0icm90YXRlKDkwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApIi8+ICANCiAgPHJlY3QgeD0iNDYuNSIgeT0iNDAiIHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiIGZpbGw9IiMyOWE1ZDkiIHRyYW5zZm9ybT0icm90YXRlKDEyMCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSIvPiAgDQogIDxyZWN0IHg9IjQ2LjUiIHk9IjQwIiB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgcng9IjUiIHJ5PSI1IiBmaWxsPSIjMjlhNWQ5IiB0cmFuc2Zvcm09InJvdGF0ZSgxNTAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCkiLz4gIA0KICA8cmVjdCB4PSI0Ni41IiB5PSI0MCIgd2lkdGg9IjciIGhlaWdodD0iMjAiIHJ4PSI1IiByeT0iNSIgZmlsbD0iIzI5YTVkOSIgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApIi8+ICANCiAgPHJlY3QgeD0iNDYuNSIgeT0iNDAiIHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiIGZpbGw9IiMyOWE1ZDkiIHRyYW5zZm9ybT0icm90YXRlKDIxMCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSIvPiAgDQogIDxyZWN0IHg9IjQ2LjUiIHk9IjQwIiB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgcng9IjUiIHJ5PSI1IiBmaWxsPSIjMjlhNWQ5IiB0cmFuc2Zvcm09InJvdGF0ZSgyNDAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCkiLz4gIA0KICA8cmVjdCB4PSI0Ni41IiB5PSI0MCIgd2lkdGg9IjciIGhlaWdodD0iMjAiIHJ4PSI1IiByeT0iNSIgZmlsbD0iIzI5YTVkOSIgdHJhbnNmb3JtPSJyb3RhdGUoMjcwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApIi8+ICANCiAgPHJlY3QgeD0iNDYuNSIgeT0iNDAiIHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiIGZpbGw9IiMyOWE1ZDkiIHRyYW5zZm9ybT0icm90YXRlKDMwMCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSIvPiAgDQogIDxyZWN0IHg9IjQ2LjUiIHk9IjQwIiB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgcng9IjUiIHJ5PSI1IiBmaWxsPSIjMjlhNWQ5IiB0cmFuc2Zvcm09InJvdGF0ZSgzMzAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCkiLz4gIA0KPC9zdmc+ICAgCSAgICANCg=="

/***/ }),
/* 77 */,
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(61)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(31),
  /* template */
  __webpack_require__(102),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  null,
  /* template */
  __webpack_require__(110),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(33),
  /* template */
  __webpack_require__(117),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(34),
  /* template */
  __webpack_require__(104),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(60)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(35),
  /* template */
  __webpack_require__(101),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(36),
  /* template */
  __webpack_require__(119),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(37),
  /* template */
  __webpack_require__(106),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(38),
  /* template */
  __webpack_require__(107),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(63)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(39),
  /* template */
  __webpack_require__(108),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(70)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(40),
  /* template */
  __webpack_require__(120),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(62)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(41),
  /* template */
  __webpack_require__(103),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(71)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(43),
  /* template */
  __webpack_require__(122),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(45),
  /* template */
  __webpack_require__(112),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(46),
  /* template */
  __webpack_require__(115),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(47),
  /* template */
  __webpack_require__(100),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(48),
  /* template */
  __webpack_require__(99),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(69)
}
var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(49),
  /* template */
  __webpack_require__(118),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(72)
}
var Component = __webpack_require__(0)(
  /* script */
  null,
  /* template */
  __webpack_require__(123),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(52),
  /* template */
  __webpack_require__(105),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(54),
  /* template */
  __webpack_require__(121),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "inline"
  }, [_c('div', {
    staticClass: "op_main"
  }, [_c('h2', {
    staticClass: "solve_header"
  }, [_vm._v("Optimize the " + _vm._s(_vm.optimal_text))]), _vm._v(" "), _c('table', {
    staticClass: "solve_table",
    attrs: {
      "align": "center",
      "cellspacing": "0",
      "cellpadding": "4"
    }
  }, [_c('thead', [_vm._m(0), _vm._v(" "), _c('tr', [_c('th', [_vm._v(" ")]), _vm._v(" "), _c('th', {
    staticClass: "bord"
  }, [_vm._v("MIN cost/day")]), _vm._v(" "), _c('th', {
    staticClass: "bord"
  }, [_vm._v("MAX cost/day")]), _vm._v(" "), _c('td', {
    staticClass: "bord"
  }, [_vm._v("Expected improvement, %")]), _vm._v(" "), _c('th', {
    staticClass: "bord"
  }, [_vm._v("Cost/day")]), _vm._v(" "), _c('th', {
    staticClass: "bord"
  }, [_vm._v("Projected " + _vm._s(_vm.text_kind))]), _vm._v(" "), _c('th', {
    staticClass: "bord"
  }, [_vm._v("Projected " + _vm._s(_vm.optimal_text))])])]), _vm._v(" "), _c('tbody', _vm._l((_vm.list), function(item) {
    return _c('tr', {
      attrs: {
        "align": "center"
      }
    }, [_c('td', {
      attrs: {
        "align": "right"
      }
    }, [_vm._v(_vm._s(item.title) + ":")]), _vm._v(" "), _c('td', {
      staticClass: "bl"
    }, [_c('input', {
      directives: [{
        name: "model",
        rawName: "v-model",
        value: (item.min_cost),
        expression: "item.min_cost"
      }],
      staticClass: "num_field",
      attrs: {
        "type": "number",
        "onClick": "this.select()"
      },
      domProps: {
        "value": (item.min_cost)
      },
      on: {
        "input": function($event) {
          if ($event.target.composing) { return; }
          item.min_cost = $event.target.value
        }
      }
    })]), _vm._v(" "), _c('td', {
      staticClass: "bl br"
    }, [_c('input', {
      directives: [{
        name: "model",
        rawName: "v-model",
        value: (item.max_cost),
        expression: "item.max_cost"
      }],
      staticClass: "num_field",
      attrs: {
        "type": "number",
        "onClick": "this.select()"
      },
      domProps: {
        "value": (item.max_cost)
      },
      on: {
        "input": function($event) {
          if ($event.target.composing) { return; }
          item.max_cost = $event.target.value
        }
      }
    })]), _vm._v(" "), _c('td', {
      staticClass: "br"
    }, [_c('input', {
      directives: [{
        name: "model",
        rawName: "v-model",
        value: (item.improve),
        expression: "item.improve"
      }],
      staticClass: "num_field",
      attrs: {
        "type": "number",
        "onClick": "this.select()"
      },
      domProps: {
        "value": (item.improve)
      },
      on: {
        "input": function($event) {
          if ($event.target.composing) { return; }
          item.improve = $event.target.value
        }
      }
    })]), _vm._v(" "), _c('td', {
      staticClass: "br"
    }, [_c('div', {
      staticClass: "const_total"
    }, [_vm._v(_vm._s(_vm._f("filterNum")(item.optimal_cost)))])]), _vm._v(" "), _c('td', {
      staticClass: "br"
    }, [_c('div', {
      staticClass: "const_total"
    }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.depend(item))))])]), _vm._v(" "), _c('td', {
      staticClass: "br"
    }, [_c('div', {
      staticClass: "const_total"
    }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.projected(item))) + _vm._s(_vm.kind == 1 ? '%' : ''))])])])
  })), _vm._v(" "), _c('tfoot', [_c('tr', {
    attrs: {
      "align": "center"
    }
  }, [_c('td', {
    attrs: {
      "align": "right"
    }
  }, [_vm._v("Total:")]), _vm._v(" "), _c('td', {
    staticClass: "bt"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.min_total),
      expression: "min_total"
    }],
    staticClass: "num_field",
    attrs: {
      "type": "number"
    },
    domProps: {
      "value": (_vm.min_total)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.min_total = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('td', {
    staticClass: "bt"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.max_total),
      expression: "max_total"
    }],
    staticClass: "num_field",
    attrs: {
      "type": "number"
    },
    domProps: {
      "value": (_vm.max_total)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.max_total = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('td', {
    staticClass: "bt"
  }, [_c('button', {
    staticClass: "btn btn_calc",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.doSolve
    }
  }, [_vm._v("Optimize")])]), _vm._v(" "), _c('td', {
    staticClass: "bt"
  }, [_c('div', {
    staticClass: "const_total"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.total_cost)))])]), _vm._v(" "), _c('td', {
    staticClass: "bt"
  }, [_c('div', {
    staticClass: "const_total"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.total_result)))])]), _vm._v(" "), _c('td', {
    staticClass: "bt help_sign"
  }, [_c('div', {
    staticClass: "major_total"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.total_optimal)) + _vm._s(_vm.kind == 1 ? '%' : ''))]), _vm._v(" "), _vm._m(1)])])])])])])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('th', [_vm._v(" ")]), _vm._v(" "), _c('th', {
    staticClass: "bord",
    attrs: {
      "colspan": "2"
    }
  }, [_vm._v("\n            CONSTRAINTS\n            "), _c('span', {
    staticClass: "tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "Input minimum & maximum budgets for each campaign and for the entire account."
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])]), _vm._v(" "), _c('th', {
    staticClass: "bord"
  }, [_vm._v("\n            IMPROVEMENT\n            "), _c('span', {
    staticClass: "tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "Input expected improvement to account for upcoming events such as a sale"
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])]), _vm._v(" "), _c('th', {
    staticClass: "bord",
    attrs: {
      "colspan": "3"
    }
  }, [_vm._v("OUTPUT")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "tooltip-top tooltip",
    attrs: {
      "data-tooltip": "We are optimizing for maximum ROI or minimum CPA of the whole account by adjusting daily budgets at the campaign level"
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
}]}

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "login_panel center_screen"
  }, [_vm._m(0), _vm._v(" "), _c('form', {
    on: {
      "submit": function($event) {
        $event.preventDefault();
        _vm.doSignup($event)
      }
    }
  }, [_c('h2', [_vm._v("Sign up for new account")]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_mail"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "focus",
      rawName: "v-focus"
    }, {
      name: "model",
      rawName: "v-model",
      value: (_vm.username),
      expression: "username"
    }],
    ref: "username",
    staticClass: "full_width",
    attrs: {
      "type": "email",
      "name": "user_name",
      "placeholder": "Email Address",
      "required": ""
    },
    domProps: {
      "value": (_vm.username)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.username = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_pass"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.password),
      expression: "password"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "password",
      "placeholder": "Password",
      "required": ""
    },
    domProps: {
      "value": (_vm.password)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.password = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_pass2"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.password2),
      expression: "password2"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "password",
      "placeholder": "Password (again)",
      "required": ""
    },
    domProps: {
      "value": (_vm.password2)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.password2 = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.industry_id),
      expression: "industry_id"
    }],
    staticClass: "full_width",
    on: {
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.industry_id = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, [_c('option', {
    attrs: {
      "value": "0",
      "disabled": ""
    }
  }, [_vm._v("-- Choose industry --")]), _vm._v(" "), _vm._l((_vm.list_industry), function(item) {
    return _c('option', {
      domProps: {
        "value": item.id
      }
    }, [_vm._v(_vm._s(item.title))])
  })], 2)]), _vm._v(" "), _c('div', {
    staticClass: "field"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.permit_agregate),
      expression: "permit_agregate"
    }],
    attrs: {
      "type": "checkbox",
      "id": "permit"
    },
    domProps: {
      "checked": Array.isArray(_vm.permit_agregate) ? _vm._i(_vm.permit_agregate, null) > -1 : (_vm.permit_agregate)
    },
    on: {
      "__c": function($event) {
        var $$a = _vm.permit_agregate,
          $$el = $event.target,
          $$c = $$el.checked ? (true) : (false);
        if (Array.isArray($$a)) {
          var $$v = null,
            $$i = _vm._i($$a, $$v);
          if ($$el.checked) {
            $$i < 0 && (_vm.permit_agregate = $$a.concat($$v))
          } else {
            $$i > -1 && (_vm.permit_agregate = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
          }
        } else {
          _vm.permit_agregate = $$c
        }
      }
    }
  }), _vm._v(" "), _c('label', {
    attrs: {
      "for": "permit"
    }
  }, [_vm._v("I permit the usage of my campaigns for industry aggregated reporting")])]), _vm._v(" "), _vm._m(1)]), _vm._v(" "), (_vm.cant_signup != '') ? _c('div', {
    staticClass: "error_message",
    domProps: {
      "innerHTML": _vm._s(_vm.cant_signup)
    }
  }) : _vm._e()])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "logo_big"
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(5),
      "alt": "Logo",
      "height": "40"
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field"
  }, [_c('button', {
    staticClass: "btn-login"
  }, [_vm._v("Sign up")])])
}]}

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "login_panel center_screen"
  }, [_vm._m(0), _vm._v(" "), (!_vm.sent) ? _c('form', {
    on: {
      "submit": function($event) {
        $event.preventDefault();
        _vm.doSignup($event)
      }
    }
  }, [_c('h2', [_vm._v("Forgotten password")]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_mail"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "focus",
      rawName: "v-focus"
    }, {
      name: "model",
      rawName: "v-model",
      value: (_vm.username),
      expression: "username"
    }],
    ref: "username",
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "name": "user_name",
      "placeholder": "Email Address",
      "required": ""
    },
    domProps: {
      "value": (_vm.username)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.username = $event.target.value
      }
    }
  })]), _vm._v(" "), _vm._m(1)]) : _c('div', [_c('h2', [_vm._v("Password Reset email sent")]), _vm._v(" "), _c('p', [_vm._v("\n      If your email address matched an account we have sent you an email with a link to reset your password.\n    ")])]), _vm._v(" "), (_vm.cant_reset != '') ? _c('div', {
    staticClass: "error_message",
    domProps: {
      "innerHTML": _vm._s(_vm.cant_reset)
    }
  }) : _vm._e()])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "logo_big"
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(5),
      "alt": "Logo",
      "height": "40"
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field"
  }, [_c('button', {
    staticClass: "btn-login"
  }, [_vm._v("Reset Password")])])
}]}

/***/ }),
/* 101 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "center_screen panel"
  }, [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), (_vm.cancelled || !_vm.subscribed) ? [_vm._m(0), _vm._v(" "), _c('br'), _vm._v(" "), _c('div', {
    staticClass: "center"
  }, [_vm._v("You will be redirected to the PayPal website.")]), _vm._v(" "), _vm._m(1)] : [_vm._m(2), _vm._v(" "), _c('br'), _vm._v(" "), _vm._m(3)]], 2)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_vm._v("\n      You are currently using our "), _c('b', [_vm._v("Free Plan")]), _vm._v(".\n      "), _c('p', [_vm._v("With its limit of up to "), _c('b', [_vm._v("10")]), _vm._v(" campaigns it is primarily intended to get you an idea about our platform and how you can benefit by using it."), _c('br'), _vm._v("\n        For a more effective use of the platform we encourage you to become a paid subscriber - for "), _c('b', [_vm._v("10 USD/month")]), _vm._v(" you will be able to optimize the budget of unlimited number of campaigns.")]), _vm._v(" "), _c('p', [_vm._v("You may cancel your subscription at any time - your data will stay intact until you renew the subscription. If you cancel in the middle of your 30-day billing cycle -"), _c('br'), _vm._v("\n        your subscription will remain active until the end of the billing cycle.")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('form', {
    staticClass: "center",
    attrs: {
      "action": "api/paypal/upgrade.php",
      "method": "POST",
      "target": "_blank"
    }
  }, [_c('button', {
    staticClass: "btn_yes",
    attrs: {
      "type": "submit"
    }
  }, [_vm._v("Upgrade")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_vm._v("\n      You are currently using our "), _c('b', [_vm._v("Paid Subscription Plan")]), _vm._v(".\n      "), _c('p', [_vm._v("You are able to optimize the budget of unlimited number of campaigns.")]), _vm._v(" "), _c('p', [_vm._v("You may cancel your subscription at any time - your data will stay intact until you renew the subscription. If you cancel in the middle of your billing cycle -"), _c('br'), _vm._v("\n        the subscription will remain active until the end of the billing cycle.")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('form', {
    staticClass: "center",
    attrs: {
      "action": "api/paypal/downgrade.php",
      "method": "POST",
      "target": "_blank"
    }
  }, [_c('button', {
    staticClass: "btn_no",
    attrs: {
      "type": "submit"
    }
  }, [_vm._v("Downgrade")])])
}]}

/***/ }),
/* 102 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "collapse collapse-item",
    class: {
      'is-active': _vm.active
    }
  }, [_c('div', {
    staticClass: "collapse-header touchable",
    attrs: {
      "role": "tab",
      "aria-expanded": _vm.active ? 'true' : 'fase'
    },
    on: {
      "click": function($event) {
        $event.preventDefault();
        _vm.toggle($event)
      }
    }
  }, [_vm._t("collapse-header")], 2), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [(_vm.active) ? _c('div', {
    staticClass: "collapse-content"
  }, [_c('div', {
    staticClass: "collapse-content-box"
  }, [_vm._t("collapse-body")], 2)]) : _vm._e()])], 1)
},staticRenderFns: []}

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('nav', {
    staticClass: "campaign_toolbar"
  }, [(_vm.cur_tab != 1) ? _c('button', {
    staticClass: "btn_camp",
    on: {
      "click": function($event) {
        _vm.cur_tab = 1
      }
    }
  }, [_vm._v("Combined data")]) : _vm._e(), _vm._v(" "), (_vm.cur_tab == 1) ? _c('div', {
    staticClass: "btn_camp_cur"
  }, [_vm._v("Combined data\n      "), _vm._m(0)]) : _vm._e(), _vm._v(" "), (_vm.cur_tab != 3) ? _c('button', {
    staticClass: "btn_camp",
    on: {
      "click": function($event) {
        _vm.cur_tab = 3
      }
    }
  }, [_vm._v("Optimisation table")]) : _vm._e(), _vm._v(" "), (_vm.cur_tab == 3) ? _c('div', {
    staticClass: "btn_camp_cur"
  }, [_vm._v("Optimisation table")]) : _vm._e()]), _vm._v(" "), (_vm.cur_tab == 1) ? _c('div', {
    staticClass: "campaign_item"
  }, [_c('keep-alive', [(_vm.combined && _vm.solved) ? _c('camp', {
    attrs: {
      "campaign": _vm.combined,
      "kind": _vm.kind,
      "type_reg": _vm.regression,
      "reg_names": _vm.reg_names
    }
  }) : _vm._e()], 1)], 1) : _vm._e(), _vm._v(" "), (_vm.cur_tab == 2) ? _c('div', [(_vm.individual.length && _vm.solved) ? _c('table', {
    attrs: {
      "align": "center"
    }
  }, [_c('tr', [_c('td', [_c('div', {
    staticClass: "campaign_list"
  }, [_vm._l((_vm.individual), function(camp, idx) {
    return [_c('keep-alive', [_c('camp', {
      key: camp.id,
      attrs: {
        "campaign": camp,
        "kind": camp.kind,
        "idx": idx,
        "type_reg": _vm.regression,
        "reg_names": _vm.reg_names
      }
    })], 1)]
  })], 2)])])]) : _vm._e()]) : _vm._e(), _vm._v(" "), (_vm.cur_tab == 3) ? _c('div', {
    staticClass: "campaign_item"
  }, [(_vm.individual.length && _vm.solved) ? _c('solve', {
    attrs: {
      "list": _vm.individual,
      "kind": _vm.kind,
      "type_reg": _vm.regression ? _vm.regression : _vm.combined.best_fit
    },
    on: {
      "failure": _vm.showErr,
      "optimize": _vm.solverResult
    }
  }) : _vm._e()], 1) : _vm._e()])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "center help_sign tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "This output combines campaigns and plots them together.  Here you are able to quickly see overall account performance"
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
}]}

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "login_panel center_screen"
  }, [_vm._m(0), _vm._v(" "), _c('form', {
    staticClass: "inline",
    on: {
      "submit": function($event) {
        $event.preventDefault();
        _vm.doSave($event)
      }
    }
  }, [_c('h2', [_vm._v("My profile")]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_user"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.username),
      expression: "username"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "name": "user_name",
      "placeholder": "Username",
      "disabled": ""
    },
    domProps: {
      "value": (_vm.username)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.username = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_pass"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.password),
      expression: "password"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "placeholder": "Password"
    },
    domProps: {
      "value": (_vm.password)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.password = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_pass2"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.password2),
      expression: "password2"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "placeholder": "Password (again)"
    },
    domProps: {
      "value": (_vm.password2)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.password2 = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.full_name),
      expression: "full_name"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "name": "full_name",
      "placeholder": "Full name",
      "required": ""
    },
    domProps: {
      "value": (_vm.full_name)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.full_name = $event.target.value
      }
    }
  })]), _vm._v(" "), (_vm.confirmed && _vm.confirmed != '') ? _c('div', {
    staticClass: "field"
  }, [_c('span', [_vm._v("Please check your mailbox for our confirmation letter - and click on the link there.")]), _vm._v(" "), _c('button', {
    staticClass: "btn-login",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.resendMail
    }
  }, [_vm._v("Resend activation e-mail")])]) : _vm._e(), _vm._v(" "), _vm._m(1), _vm._v(" "), _vm._m(2)]), _vm._v(" "), (_vm.cant_signup != '') ? _c('div', {
    staticClass: "error_message",
    domProps: {
      "innerHTML": _vm._s(_vm.cant_signup)
    }
  }) : _vm._e(), _vm._v(" "), (!_vm.subscribed && _vm.confirmed == '') ? _c('div', {
    staticClass: "field"
  }, [_vm._v("\n    You are currently using our "), _c('b', [_vm._v("Free Plan")]), _vm._v(" which allows up to "), _c('b', [_vm._v("10")]), _vm._v(" campaigns at any given time"), _c('br'), _vm._v("(so you may delete old campaigns and upload new ones - up to "), _c('b', [_vm._v("10")]), _vm._v(").\n    "), _c('br'), _c('br'), _vm._v("You can "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#/upgrade"
    }
  }, [_vm._v("upgrade")]), _vm._v(" to our paid subscription ("), _c('b', [_vm._v("10 USD")]), _vm._v("/month) for "), _c('u', [_vm._v("unlimited")]), _vm._v(" campaigns.\n  ")]) : _vm._e(), _vm._v(" "), (_vm.subscribed) ? _c('div', {
    staticClass: "field"
  }, [_vm._v("\n    You are currently using our "), _c('b', [_vm._v("Paid Subscription Plan")]), _vm._v(" which allows for unlimited number of campaigns.\n    "), _c('br'), _vm._v("You may "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#/upgrade"
    }
  }, [_vm._v("cancel")]), _vm._v(" your subscription - your data will stay intact until you renew it.\n  ")]) : _vm._e()])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "logo_big"
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(5),
      "alt": "Logo",
      "height": "40"
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field"
  }, [_vm._v("Leave the "), _c('b', [_vm._v("password fields")]), _vm._v(" empty if you"), _c('br'), _vm._v("do not want to change your password.")])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field"
  }, [_c('button', {
    staticClass: "btn-login"
  }, [_vm._v("Save changes")])])
}]}

/***/ }),
/* 105 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "sup_container"
  }, [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "center"
  }, [_c('h2', [_vm._v("Get in Touch")]), _vm._v(" "), _c('hr', {
    attrs: {
      "size": "1",
      "width": "64px",
      "color": "black"
    }
  }), _vm._v(" "), _c('p', [_vm._v("Please fill out the quick form and we will be in touch with lightning speed.")]), _vm._v(" "), _c('form', {
    staticClass: "contact_form",
    on: {
      "submit": function($event) {
        $event.preventDefault();
        _vm.doContact($event)
      }
    }
  }, [_c('table', {
    attrs: {
      "cellpadding": "5"
    }
  }, [_vm._m(0), _vm._v(" "), _c('tr', [_c('td', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.first_name),
      expression: "first_name"
    }],
    staticClass: "field_half",
    attrs: {
      "type": "text",
      "required": ""
    },
    domProps: {
      "value": (_vm.first_name)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.first_name = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('td', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.last_name),
      expression: "last_name"
    }],
    staticClass: "field_half",
    attrs: {
      "type": "text",
      "required": ""
    },
    domProps: {
      "value": (_vm.last_name)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.last_name = $event.target.value
      }
    }
  })])]), _vm._v(" "), _vm._m(1), _vm._v(" "), _c('tr', [_c('td', {
    attrs: {
      "colspan": "2"
    }
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.email),
      expression: "email"
    }],
    staticClass: "field_full",
    attrs: {
      "type": "email",
      "required": ""
    },
    domProps: {
      "value": (_vm.email)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.email = $event.target.value
      }
    }
  })])]), _vm._v(" "), _vm._m(2), _vm._v(" "), _c('tr', [_c('td', {
    attrs: {
      "colspan": "2"
    }
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.country_id),
      expression: "country_id"
    }],
    staticClass: "field_full",
    attrs: {
      "required": ""
    },
    on: {
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.country_id = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, [_c('option', {
    attrs: {
      "value": "0"
    }
  }, [_vm._v("- Please select -")]), _vm._v(" "), _vm._l((_vm.sortedCountry), function(item) {
    return _c('option', {
      domProps: {
        "value": item.id
      }
    }, [_vm._v(_vm._s(item.name))])
  })], 2)])]), _vm._v(" "), _vm._m(3), _vm._v(" "), _c('tr', [_c('td', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.company),
      expression: "company"
    }],
    staticClass: "field_half",
    attrs: {
      "type": "text"
    },
    domProps: {
      "value": (_vm.company)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.company = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('td', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.phone),
      expression: "phone"
    }],
    staticClass: "field_half",
    attrs: {
      "type": "text"
    },
    domProps: {
      "value": (_vm.phone)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.phone = $event.target.value
      }
    }
  })])]), _vm._v(" "), _vm._m(4), _vm._v(" "), _c('tr', [_c('td', {
    attrs: {
      "colspan": "2"
    }
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.job_title),
      expression: "job_title"
    }],
    staticClass: "field_full",
    attrs: {
      "type": "text"
    },
    domProps: {
      "value": (_vm.job_title)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.job_title = $event.target.value
      }
    }
  })])]), _vm._v(" "), _vm._m(5), _vm._v(" "), _c('tr', [_c('td', {
    attrs: {
      "colspan": "2"
    }
  }, [_c('textarea', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.message),
      expression: "message"
    }],
    staticClass: "field_full",
    attrs: {
      "rows": "8"
    },
    domProps: {
      "value": (_vm.message)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.message = $event.target.value
      }
    }
  })])])]), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "send"
    }
  }, [(_vm.form_error != '') ? _c('div', {
    staticClass: "error_message center",
    domProps: {
      "innerHTML": _vm._s(_vm.form_error)
    }
  }) : _vm._e()]), _vm._v(" "), _c('button', {
    staticClass: "btn-login small_margin",
    attrs: {
      "type": "submit"
    }
  }, [_vm._v("Submit")])], 1)]), _vm._v(" "), _c('instruct')], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', {
    attrs: {
      "width": "50%"
    }
  }, [_c('strong', [_vm._v("First name")]), _vm._v(" (required)")]), _vm._v(" "), _c('td', {
    attrs: {
      "width": "50%"
    }
  }, [_c('strong', [_vm._v("Last name")]), _vm._v(" (required)")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', {
    attrs: {
      "colspan": "2"
    }
  }, [_c('strong', [_vm._v("Email")]), _vm._v(" (required)")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', {
    attrs: {
      "colspan": "2"
    }
  }, [_c('strong', [_vm._v("Country")]), _vm._v(" (required)")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', [_vm._v("Company")]), _vm._v(" "), _c('td', [_vm._v("Phone number")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', {
    attrs: {
      "colspan": "2"
    }
  }, [_vm._v("Job title")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', {
    attrs: {
      "colspan": "2"
    }
  }, [_c('strong', [_vm._v("Your message")]), _vm._v(" (required)")])])
}]}

/***/ }),
/* 106 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field"
  }, [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), _c('h2', {
    attrs: {
      "align": "center"
    }
  }, [_vm._v("Subscription plans")]), _vm._v(" "), _c('table', {
    staticClass: "acc_stat",
    attrs: {
      "align": "center"
    }
  }, [_vm._m(0), _vm._v(" "), _c('tbody', [_c('tr', {
    attrs: {
      "bgcolor": "#dcdcdc"
    }
  }, [_c('td', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model.trim",
      value: (_vm.plan_name),
      expression: "plan_name",
      modifiers: {
        "trim": true
      }
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "minlength": "3",
      "required": "",
      "title": "Monthly billing for Budget Optimize"
    },
    domProps: {
      "value": (_vm.plan_name)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.plan_name = $event.target.value.trim()
      },
      "blur": function($event) {
        _vm.$forceUpdate()
      }
    }
  })]), _vm._v(" "), _c('td', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model.trim",
      value: (_vm.plan_desc),
      expression: "plan_desc",
      modifiers: {
        "trim": true
      }
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "minlength": "5",
      "required": "",
      "title": "Monthly Subscription for the One Egg AdWords budget optimizer"
    },
    domProps: {
      "value": (_vm.plan_desc)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.plan_desc = $event.target.value.trim()
      },
      "blur": function($event) {
        _vm.$forceUpdate()
      }
    }
  })]), _vm._v(" "), _c('td', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model.trim",
      value: (_vm.pay_name),
      expression: "pay_name",
      modifiers: {
        "trim": true
      }
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "minlength": "3",
      "required": "",
      "placeholder": "Regular Payments"
    },
    domProps: {
      "value": (_vm.pay_name)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.pay_name = $event.target.value.trim()
      },
      "blur": function($event) {
        _vm.$forceUpdate()
      }
    }
  })]), _vm._v(" "), _c('td', [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.freq),
      expression: "freq"
    }],
    staticClass: "full_width",
    attrs: {
      "required": ""
    },
    on: {
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.freq = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, _vm._l((_vm.freq_list), function(freqs) {
    return _c('option', {
      domProps: {
        "value": freqs
      }
    }, [_vm._v(_vm._s(freqs))])
  }))]), _vm._v(" "), _c('td', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model.trim.number",
      value: (_vm.amount),
      expression: "amount",
      modifiers: {
        "trim": true,
        "number": true
      }
    }],
    staticClass: "full_width",
    attrs: {
      "type": "number",
      "min": "1",
      "max": "1000",
      "required": ""
    },
    domProps: {
      "value": (_vm.amount)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.amount = _vm._n($event.target.value.trim())
      },
      "blur": function($event) {
        _vm.$forceUpdate()
      }
    }
  })]), _vm._v(" "), _c('td', [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.currency),
      expression: "currency"
    }],
    staticClass: "full_width",
    attrs: {
      "required": ""
    },
    on: {
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.currency = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, _vm._l((_vm.curr_list), function(curr) {
    return _c('option', {
      domProps: {
        "value": curr
      }
    }, [_vm._v(_vm._s(curr))])
  }))]), _vm._v(" "), _c('td', [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.max_fail),
      expression: "max_fail"
    }],
    staticClass: "full_width",
    attrs: {
      "required": ""
    },
    on: {
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.max_fail = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, [_c('option', {
    attrs: {
      "value": "0"
    }
  }, [_vm._v("Infinite")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "1"
    }
  }, [_vm._v("Once")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "2"
    }
  }, [_vm._v("Twice")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "3"
    }
  }, [_vm._v("Triple")])])]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('button', {
    staticClass: "btn btn_yes",
    on: {
      "click": _vm.newPlan
    }
  }, [_vm._v("Create")])]), _vm._v(" "), _c('td', [_vm._v(" ")])])]), _vm._v(" "), _c('tfoot', _vm._l((_vm.plans), function(item) {
    return _c('tr', [_c('td', [_vm._v(_vm._s(item.name))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.description))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.paydef))]), _vm._v(" "), _c('td', {
      attrs: {
        "align": "center"
      }
    }, [_vm._v(_vm._s(item.frequency))]), _vm._v(" "), _c('td', {
      attrs: {
        "align": "right"
      }
    }, [_vm._v(_vm._s((+item.amount).toFixed(2)))]), _vm._v(" "), _c('td', {
      attrs: {
        "align": "center"
      }
    }, [_vm._v(_vm._s(item.currency))]), _vm._v(" "), _c('td', {
      attrs: {
        "align": "center"
      }
    }, [_vm._v(_vm._s(item.max_fail))]), _vm._v(" "), _c('td', {
      attrs: {
        "align": "center"
      }
    }, [_c('button', {
      staticClass: "btn btn_dark",
      on: {
        "click": function($event) {
          _vm.planDuplicate(item)
        }
      }
    }, [_vm._v("Duplicate")])]), _vm._v(" "), _c('td', {
      attrs: {
        "align": "center"
      }
    }, [(!item.active) ? _c('button', {
      staticClass: "btn btn_no",
      on: {
        "click": function($event) {
          _vm.planActive(item)
        }
      }
    }, [_vm._v("Activate")]) : _c('span', [_vm._v("Active")])])])
  }))]), _vm._v(" "), _c('h2', {
    attrs: {
      "align": "center"
    }
  }, [_vm._v("Web hooks")]), _vm._v(" "), _c('table', {
    staticClass: "acc_stat",
    attrs: {
      "align": "center"
    }
  }, [_vm._m(1), _vm._v(" "), _c('tbody', [_c('tr', {
    attrs: {
      "bgcolor": "#dcdcdc"
    }
  }, [_c('td', [_vm._v(" ")]), _vm._v(" "), _c('td', [_vm._v(_vm._s(_vm.window.location.href) + "/api/paypal/web_hook.php")]), _vm._v(" "), _vm._m(2), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('button', {
    staticClass: "btn btn_yes",
    on: {
      "click": _vm.newHook
    }
  }, [_vm._v("Create")])])])]), _vm._v(" "), _c('tfoot', _vm._l((_vm.hooks), function(item) {
    return _c('tr', [_c('td', [_vm._v(_vm._s(item.id))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.url))]), _vm._v(" "), _c('td', [_c('ul', _vm._l((item.event_types), function(event) {
      return _c('li', [_vm._v(_vm._s(event.name))])
    }))]), _vm._v(" "), _c('td', {
      attrs: {
        "align": "center"
      }
    }, [_c('button', {
      staticClass: "btn btn_no",
      on: {
        "click": function($event) {
          _vm.hookDelete(item)
        }
      }
    }, [_vm._v("Delete")])])])
  }))])], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('thead', [_c('tr', [_c('th', [_vm._v("Subscription Name")]), _vm._v(" "), _c('th', [_vm._v("Description")]), _vm._v(" "), _c('th', [_vm._v("Payment Name")]), _vm._v(" "), _c('th', [_vm._v("Payment frequency")]), _vm._v(" "), _c('th', [_vm._v("Amount")]), _vm._v(" "), _c('th', [_vm._v("Currency")]), _vm._v(" "), _c('th', [_vm._v("Max failed billing attempts")]), _vm._v(" "), _c('th', [_vm._v("Action")]), _vm._v(" "), _c('th', [_vm._v("Status")])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('thead', [_c('tr', [_c('th', [_vm._v("ID")]), _vm._v(" "), _c('th', [_vm._v("URL")]), _vm._v(" "), _c('th', [_vm._v("Events")]), _vm._v(" "), _c('th', [_vm._v("Action")])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('td', [_c('ul', [_c('li', [_vm._v("BILLING.SUBSCRIPTION.CREATED")]), _vm._v(" "), _c('li', [_vm._v("BILLING.SUBSCRIPTION.CANCELLED")]), _vm._v(" "), _c('li', [_vm._v("BILLING.SUBSCRIPTION.RE-ACTIVATED")]), _vm._v(" "), _c('li', [_vm._v("BILLING.SUBSCRIPTION.SUSPENDED")])])])
}]}

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), _c('h2', {
    attrs: {
      "align": "center"
    }
  }, [_vm._v("Account statistics")]), _vm._v(" "), _c('table', {
    staticClass: "acc_stat",
    attrs: {
      "align": "center"
    }
  }, [_vm._m(0), _vm._v(" "), _c('tbody', _vm._l((_vm.list), function(item) {
    return _c('tr', {
      attrs: {
        "align": "center"
      }
    }, [_c('td', {
      attrs: {
        "align": "left"
      }
    }, [_c('a', {
      staticClass: "link",
      attrs: {
        "href": '#/data/' + item.id
      }
    }, [_vm._v(_vm._s(item.user_name))])]), _vm._v(" "), _c('td', [(item.confirmed) ? _c('img', {
      attrs: {
        "src": __webpack_require__(23),
        "width": "16",
        "height": "16"
      }
    }) : _c('img', {
      attrs: {
        "src": __webpack_require__(22),
        "width": "16",
        "height": "16"
      }
    })]), _vm._v(" "), _c('td', {
      attrs: {
        "align": "left"
      }
    }, [_vm._v(_vm._s(item.full_name))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.created))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(_vm._f("thousand")(item.roi_campaign)))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(_vm._f("thousand")(item.cpa_campaign)))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(_vm._f("thousand")(item.roi_data)))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(_vm._f("thousand")(item.cpa_data)))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.ckind + '  /  ' + item.cupload))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.industry))]), _vm._v(" "), _c('td', [(item.permit) ? _c('img', {
      attrs: {
        "src": __webpack_require__(23),
        "width": "16",
        "height": "16"
      }
    }) : _c('img', {
      attrs: {
        "src": __webpack_require__(22),
        "width": "16",
        "height": "16"
      }
    })]), _vm._v(" "), _c('td', [_c('a', {
      staticClass: "link",
      attrs: {
        "href": '#/events/' + item.id
      }
    }, [_vm._v(_vm._s(item.last_login))])]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.last_ip))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.login_wrong))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.login_disabled))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.login_pending))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.login_ok))])])
  }))]), _vm._v(" "), _c('br'), _vm._v(" "), _vm._m(1)], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('thead', [_c('tr', [_c('th', [_vm._v("Username")]), _vm._v(" "), _c('th', [_vm._v("Confirmed")]), _vm._v(" "), _c('th', [_vm._v("Full name")]), _vm._v(" "), _c('th', [_vm._v("Created")]), _vm._v(" "), _c('th', [_vm._v("ROI campaigns")]), _vm._v(" "), _c('th', [_vm._v("CPA campaigns")]), _vm._v(" "), _c('th', [_vm._v("ROI data-points")]), _vm._v(" "), _c('th', [_vm._v("CPA data-points")]), _vm._v(" "), _c('th', [_vm._v("Campaign upload")]), _vm._v(" "), _c('th', [_vm._v("Industry")]), _vm._v(" "), _c('th', [_vm._v("Aggregate data")]), _vm._v(" "), _c('th', [_vm._v("Last login")]), _vm._v(" "), _c('th', [_vm._v("Last IP address")]), _vm._v(" "), _c('th', [_vm._v("Wrong password")]), _vm._v(" "), _c('th', [_vm._v("Disabled logins")]), _vm._v(" "), _c('th', [_vm._v("Unconfirmed logins")]), _vm._v(" "), _c('th', [_vm._v("Normal logins")])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "center"
  }, [_c('a', {
    staticClass: "link",
    attrs: {
      "href": "api/admin/acc_stat.php?export=1",
      "download": "users.csv"
    }
  }, [_vm._v("Download as CSV")])])
}]}

/***/ }),
/* 108 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _vm._m(0)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "center_screen bad_route"
  }, [_c('h1', [_vm._v("Page Not Found")]), _c('p', [_vm._v("Sorry, but the page you were trying to view does not exist.")])])
}]}

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "vue_app"
  }, [_c('nav', {
    staticClass: "mainmenu",
    attrs: {
      "id": "myTopnav"
    }
  }, [_vm._m(0), _vm._v(" "), (_vm.$root.is_loged) ? [_c('div', {
    on: {
      "click": function($event) {
        _vm.func1()
      }
    }
  }, [_c('a', {
    attrs: {
      "href": ""
    }
  }), _vm._v(" "), _vm._l((_vm.$router.options.routes), function(page) {
    return (page.meta != null && (page.meta.menu || (page.meta.admin && _vm.$root.info && _vm.$root.info.is_admin == true))) ? _c('router-link', {
      key: page.path,
      attrs: {
        "to": page.path
      }
    }, [_vm._v(" " + _vm._s(page.meta.title))]) : _vm._e()
  })], 2), _vm._v(" "), _c('a', [_c('span', {
    staticClass: "log_info"
  }, [_vm._v("Welcome, " + _vm._s(_vm.$root.user_name != '' ? _vm.$root.user_name : 'dear customer'))])]), _vm._v(" "), _c('a', {
    staticClass: "login pointer",
    attrs: {
      "href": "api/login/logout.php"
    }
  }, [_vm._v("Logout")])] : [_c('span', {
    staticClass: "log_info"
  }, [_vm._v(" ")]), _vm._v(" "), _c('div', {
    staticClass: "btn_right"
  }, [_c('a', {
    attrs: {
      "href": ""
    }
  }), _vm._v(" "), _c('a', {
    staticClass: "login btn",
    attrs: {
      "href": "#login"
    },
    on: {
      "click": function($event) {
        _vm.func1()
      }
    }
  }, [_vm._v("Login")]), _vm._v(" "), _c('a', {
    staticClass: "login btn",
    attrs: {
      "href": "#feature"
    },
    on: {
      "click": function($event) {
        _vm.func1()
      }
    }
  }, [_vm._v("Features")]), _vm._v(" "), _c('a', {
    staticClass: "login btn",
    attrs: {
      "href": "#about"
    },
    on: {
      "click": function($event) {
        _vm.func1()
      }
    }
  }, [_vm._v("About")])])], _vm._v(" "), _c('a', {
    staticClass: "icon",
    attrs: {
      "href": "javascript:void(0);"
    },
    on: {
      "click": function($event) {
        _vm.myFunction()
      }
    }
  }, [_c('i', {
    staticClass: "fa fa-bars",
    staticStyle: {
      "color": "#00a0b9",
      "font-size": "30px"
    }
  })]), _vm._v(" "), _c('a', {
    staticClass: "icon1",
    attrs: {
      "href": "javascript:void(0);"
    },
    on: {
      "click": function($event) {
        _vm.myFunction()
      }
    }
  }, [_c('i', {
    staticClass: "fa fa-times-circle-o",
    staticStyle: {
      "font-size": "33px"
    }
  })])], 2), _vm._v(" "), _c('div', {
    staticClass: "content"
  }, [_c('router-view')], 1), _vm._v(" "), _vm._m(1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.$root.spin_visible > 0),
      expression: "$root.spin_visible>0"
    }],
    staticClass: "loading",
    attrs: {
      "id": "spinner"
    }
  }, [_vm._m(2)])])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('a', {
    staticClass: "logo",
    attrs: {
      "href": "#/"
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(5)
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "copyright"
  }, [_c('div', {
    staticClass: "grow center"
  }, [_c('a', {
    staticClass: "link",
    attrs: {
      "href": "#/privacy"
    }
  }, [_vm._v("Privacy Policy")])]), _vm._v(" "), _c('div', {
    attrs: {
      "align": "right"
    }
  }, [_vm._v("Copyright Ⓒ 2017 Budget Optimize - All Rights Reserved")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('img', {
    attrs: {
      "src": __webpack_require__(76),
      "width": "100px",
      "height": "100px",
      "border": "0",
      "alt": "spinner"
    }
  })])
}]}

/***/ }),
/* 110 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_vm._v("not ready")])
},staticRenderFns: []}

/***/ }),
/* 111 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return (_vm.msg != null && _vm.msg != '') ? _c('div', {
    class: ['msg', _vm.warn ? 'warning' : 'notification'],
    domProps: {
      "innerHTML": _vm._s(_vm.msg)
    }
  }) : _vm._e()
},staticRenderFns: []}

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "login_panel center_screen"
  }, [_vm._m(0), _vm._v(" "), _c('form', {
    on: {
      "submit": function($event) {
        $event.preventDefault();
        _vm.doLogin($event)
      }
    }
  }, [_c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_mail"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "focus",
      rawName: "v-focus"
    }, {
      name: "model",
      rawName: "v-model",
      value: (_vm.username),
      expression: "username"
    }],
    ref: "username",
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "name": "user_name",
      "placeholder": "Email Address",
      "required": ""
    },
    domProps: {
      "value": (_vm.username)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.username = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_pass"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.password),
      expression: "password"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "password",
      "placeholder": "Password",
      "required": ""
    },
    domProps: {
      "value": (_vm.password)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.password = $event.target.value
      }
    }
  })]), _vm._v(" "), _vm._m(1), _vm._v(" "), _vm._m(2)]), _vm._v(" "), (_vm.cant_login != '') ? _c('div', {
    staticClass: "error_message",
    domProps: {
      "innerHTML": _vm._s(_vm.cant_login)
    }
  }) : _vm._e()])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "logo_big"
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(5),
      "alt": "Logo",
      "height": "40"
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field"
  }, [_c('button', {
    staticClass: "btn-login"
  }, [_vm._v("Login")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field"
  }, [_c('a', {
    staticClass: "link small",
    attrs: {
      "href": "#/reset"
    }
  }, [_vm._v("Forgotten password")])])
}]}

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "op_main"
  }, [_c('div', {
    staticClass: "op_detail"
  }, [_c('div', {
    staticClass: "op_top"
  }, [_c('table', {
    staticClass: "collap_data",
    attrs: {
      "align": "center"
    }
  }, [_c('tr', [_c('td', {
    attrs: {
      "align": "center"
    }
  }), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_vm._v("Cost/day")]), _vm._v(" "), _c('td'), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_vm._v(_vm._s(_vm.text_kind))]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_vm._v(_vm._s(_vm.campaign_kind))])]), _vm._v(" "), _c('tr', [_vm._m(0), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "const_field"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.optimal_cost)))])]), _vm._v(" "), _c('td', [_c('div', {
    staticClass: "item_content"
  }, [_c('button', {
    staticClass: "btn btn_dark btn-shadow",
    staticStyle: {
      "padding": "3px 6px 4px"
    },
    on: {
      "click": function($event) {
        _vm.moveGreenLine()
      }
    }
  }, [_c('svg', {
    attrs: {
      "width": "16px",
      "height": "22px",
      "viewBox": "0 0 16 22",
      "xmlns": "http://www.w3.org/2000/svg"
    }
  }, [_c('path', {
    attrs: {
      "fill": "#fff",
      "d": "M8,3 L8,0 L4,4 L8,8 L8,5 C11.3,5 14,7.7 14,11 C14,12 13.7,13 13.3,13.8 L14.8,15.3\n              C15.5,14 16,12.6 16,11 C16,6.6 12.4,3 8,3 L8,3 Z M8,17 C4.7,17 2,14.3 2,11 C2,10 2.3,9 2.7,8.2 L1.2,6.7\n              C0.5,8 0,9.4 0,11 C0,15.4 3.6,19 8,19 L8,22 L12,18 L8,14 L8,17 L8,17 Z"
    }
  })])]), _vm._m(1)])]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "const_field"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.optimal_value)))])]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "const_field"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.optimum)) + _vm._s(_vm.kind == 1 ? '%' : ''))])])]), _vm._v(" "), _vm._m(2), _vm._v(" "), _c('tr', [_c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "center full_width"
  }, [_vm._v("\n                Calculate your projected  "), _c('strong', [_vm._v(_vm._s(_vm.optimal_text))]), _vm._v("  at different cost:\n                "), _vm._m(3)])]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.var_cost),
      expression: "var_cost"
    }],
    staticClass: "num_field",
    attrs: {
      "type": "number",
      "onClick": "this.select()"
    },
    domProps: {
      "value": (_vm.var_cost)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.var_cost = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('td'), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "const_field"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.projected_value(_vm.var_cost))))])]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "const_field"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.projected_roi(_vm.var_cost, _vm.projected_value(_vm.var_cost)))) + _vm._s(_vm.kind == 1 ? '%' : ''))])])]), _vm._v(" "), _c('tr', [_c('td'), _vm._v(" "), _c('td', {
    attrs: {
      "colspan": "4"
    }
  }, [_c('div', {
    staticClass: "slider_panel"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.var_cost),
      expression: "var_cost"
    }],
    staticClass: "slider no_bord",
    attrs: {
      "type": "range",
      "min": "0",
      "max": _vm.maxValue,
      "step": "0.01"
    },
    domProps: {
      "value": (_vm.var_cost)
    },
    on: {
      "input": function($event) {
        _vm.setPoint()
      },
      "__r": function($event) {
        _vm.var_cost = $event.target.value
      }
    }
  })])])]), _vm._v(" "), _vm._m(4)])])]), _vm._v(" "), _c('div', {
    staticClass: "graphs"
  }, [_c('div', {
    staticClass: "op_title"
  }, [_c('h4', {
    staticClass: "op_header",
    attrs: {
      "title": _vm.campaign.title
    }
  }, [_vm._v(_vm._s(_vm.campaign.title))])]), _vm._v(" "), _c('div', {
    staticClass: "op_graph"
  }, [_c('div', {
    staticClass: "graph_panel",
    attrs: {
      "id": 'graph' + _vm._uid
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "top_space"
  }, [_vm._v("\n          Regression formula: "), _c('strong', {
    staticClass: "code"
  }, [_vm._v(_vm._s(_vm.regression.string))]), _vm._v(" "), _vm._m(5)]), _vm._v(" "), _c('div', {
    staticClass: "top_space"
  }, [_vm._v("\n          Confidence of regression: "), _c('span', {
    class: {
      r_low: _vm.regression.r2 < 0.1
    }
  }, [_c('strong', {
    staticClass: "code"
  }, [_vm._v("R"), _c('span', {
    staticClass: "super"
  }, [_vm._v("2")]), _vm._v(" = " + _vm._s(_vm._f("filterNum")(_vm.regression.r2)))])]), _vm._v("  (" + _vm._s(_vm.campaign.points.length) + " pts)\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "top_space"
  }, [_vm._v("\n          Kind of regression: "), _c('strong', {
    staticClass: "code"
  }, [_vm._v(_vm._s(_vm.reg_names[_vm.type_reg ? _vm.type_reg : _vm.campaign.best_fit]))])])]), _vm._v(" "), _c('div', {
    staticClass: "op_graph second_graph"
  }, [_c('div', {
    staticClass: "graph_panel",
    attrs: {
      "id": 'graph1' + _vm._uid
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "top_space"
  }, [_vm._v("\n          " + _vm._s(_vm.campaign_kind) + ": "), _c('strong', {
    staticClass: "code"
  }, [_vm._v(_vm._s(_vm.campaign_kind == 'CPA' ? _vm.regression.string1 : _vm.regression.string2))]), _vm._v(" "), _vm._m(6)]), _vm._v(" "), _c('div', {
    staticClass: "top_space"
  }, [_vm._v("\n          Based on: "), _c('strong', {
    staticClass: "code"
  }, [_vm._v(_vm._s(_vm.reg_names[_vm.type_reg ? _vm.type_reg : _vm.campaign.best_fit]))]), _vm._v(" regression\n        ")])])])])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "full_width"
  }, [_vm._v("\n                Your optimal result for this campaign is:\n                "), _c('div', {
    staticClass: "help_sign tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "The solver has found the optimal daily spend to achieve max ROI or min CP"
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "full_width center help_sign tooltip-bottom",
    attrs: {
      "data-tooltip": "Recalculate data from the lowest observed cost on reg. line for more realistic results"
    }
  }, [_c('img', {
    staticStyle: {
      "padding-top": "6px"
    },
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', {
    attrs: {
      "colspan": "5"
    }
  }, [_c('div', {
    staticClass: "bitLine"
  })])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "help_sign tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "Calculate ROI or CPA at different spends by moving the slider or input a certain cost.  View results also on the graph"
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', {
    attrs: {
      "colspan": "5"
    }
  }, [_c('div', {
    staticClass: "bitLine"
  })])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "help_sign tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "The regression formula is generated from the selected model.  This function is graphed above"
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "help_sign tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "The graph above is a plot of this function, it helps you visualise optimal solutions"
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
}]}

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "wrapper"
  }, [_vm._m(0), _vm._v(" "), _vm._m(1), _vm._v(" "), _c('div', {
    staticClass: "video"
  }, _vm._l((_vm.videos), function(item) {
    return _c('div', {
      staticClass: "center"
    }, [_c('h3', [_vm._v(_vm._s(item.title))]), _vm._v(" "), _c('iframe', {
      attrs: {
        "src": 'https://www.youtube.com/embed/' + item.video,
        "frameborder": "0",
        "allowfullscreen": ""
      }
    })])
  }))])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "explain"
  }, [_c('div', {
    staticClass: "help_panel"
  }, [_c('div', {
    staticClass: "help_title"
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2),
      "width": "32"
    }
  }), _vm._v(" "), _c('b', [_c('u', [_vm._v("Steps for Importing Data")])])]), _vm._v(" "), _c('ol', [_c('li', [_vm._v("Within "), _c('a', {
    attrs: {
      "href": "https://adwords.google.com/"
    }
  }, [_vm._v("AdWords")]), _vm._v(" Navigate to the reporting section and select "), _c('b', [_vm._v("predefined reports")]), _vm._v(" (in the old AdWords interface this is found under the "), _c('b', [_vm._v("dimension")]), _vm._v(" tab)")]), _vm._v(" "), _c('li', [_vm._v("Set the report to "), _c('b', [_vm._v("Time » Day")])]), _vm._v(" "), _c('li', [_vm._v("Have "), _c('b', [_vm._v("4")]), _vm._v(" (and "), _c('b', [_vm._v("only 4")]), _vm._v(") column headings setup in the following order: "), _c('b', [_vm._v("Day")]), _vm._v(", "), _c('b', [_vm._v("Campaign")]), _vm._v(", "), _c('b', [_vm._v("Cost")]), _vm._v(", "), _c('b', [_vm._v("All Conv. Value")]), _vm._v(" OR "), _c('b', [_vm._v("Conversions")]), _vm._v(" "), _c('ol', {
    attrs: {
      "type": "a"
    }
  }, [_c('li', [_c('b', [_vm._v("All Conv. Value")]), _vm._v(" is your revenue figure, you can switch it for "), _c('b', [_vm._v("total conv. Value")])]), _vm._v(" "), _c('li', [_vm._v("Choose either the "), _c('b', [_vm._v("Conv. Value")]), _vm._v(" metric or the "), _c('b', [_vm._v("Conversions")]), _vm._v(" metric but not both. This depends on whether you are optimising for a "), _c('b', [_vm._v("high ROI")]), _vm._v(" or a "), _c('b', [_vm._v("low CPA")]), _vm._v(". Decide on "), _c('u', [_vm._v("ONE.")])])])]), _vm._v(" "), _c('li', [_vm._v("Set Date Range – Ideally at least "), _c('b', [_vm._v("3 months")]), _vm._v(" back")]), _vm._v(" "), _c('li', [_vm._v("Export as "), _c('b', [_vm._v(".CSV")])]), _vm._v(" "), _c('li', [_vm._v("Navigate to the "), _c('a', {
    attrs: {
      "href": "#/import"
    }
  }, [_vm._v("import page")])]), _vm._v(" "), _c('li', [_vm._v("If you downloaded "), _c('b', [_vm._v("Conv. Value")]), _vm._v(" (revenue) use revenue side column, if you downloaded "), _c('b', [_vm._v("conversion data")]), _vm._v(" use conversion side column – they are identical")]), _vm._v(" "), _c('li', [_vm._v("Select "), _c('b', [_vm._v("Choose file")]), _vm._v(", give this group an identifying name and then select upload")]), _vm._v(" "), _c('li', [_vm._v("Navigate to the "), _c('a', {
    attrs: {
      "href": "#/campaigns"
    }
  }, [_vm._v("campaigns page")])]), _vm._v(" "), _c('li', [_vm._v("Select the campaigns you wish to analyse and click the blue button at the top to optimize")])])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_vm._v(" "), _c('br'), _vm._v(" ")])
}]}

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "login_panel center_screen"
  }, [_vm._m(0), _vm._v(" "), _c('form', {
    on: {
      "submit": function($event) {
        $event.preventDefault();
        _vm.doSignup($event)
      }
    }
  }, [_c('h2', [_vm._v("Reset your password")]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_pass"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.password),
      expression: "password"
    }, {
      name: "focus",
      rawName: "v-focus"
    }],
    ref: "password",
    staticClass: "full_width",
    attrs: {
      "type": "password",
      "placeholder": "Password",
      "required": ""
    },
    domProps: {
      "value": (_vm.password)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.password = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "field relative"
  }, [_c('i', {
    staticClass: "icon_pass2"
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.password2),
      expression: "password2"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "password",
      "placeholder": "Password (again)",
      "required": ""
    },
    domProps: {
      "value": (_vm.password2)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.password2 = $event.target.value
      }
    }
  })]), _vm._v(" "), _vm._m(1)]), _vm._v(" "), (_vm.cant_reset != '') ? _c('div', {
    staticClass: "error_message",
    domProps: {
      "innerHTML": _vm._s(_vm.cant_reset)
    }
  }) : _vm._e()])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "logo_big"
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(5),
      "alt": "Logo",
      "height": "40"
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field"
  }, [_c('button', {
    staticClass: "btn-login"
  }, [_vm._v("Reset password")])])
}]}

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "landing_wrapper"
  }, [_c('div', {
    staticClass: "land_header"
  }, [_c('div', {
    staticClass: "container_left"
  }, [_c('div', {
    staticClass: "graph_panel",
    attrs: {
      "id": 'graph' + _vm._uid
    }
  }), _vm._v(" "), _c('table', {
    attrs: {
      "align": "center"
    }
  }, [_vm._m(0), _vm._v(" "), _c('tr', [_c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "const_field"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.optimal_cost)))])]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "const_field"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.optimal_value)))])]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "center"
    }
  }, [_c('div', {
    staticClass: "const_field"
  }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.optimum)) + _vm._s(_vm.kind == 1 ? '%' : ''))])])])])]), _vm._v(" "), _c('div', {
    staticClass: "container_right"
  }, [_c('h2', [_vm._v("Optimize Budget allocation, forecast performance & predict results with Machine Learning")]), _vm._v(" "), _c('div', {
    staticClass: "slider_panel"
  }, [_c('label', [_vm._v("See how it works:")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.var_cost),
      expression: "var_cost"
    }],
    staticClass: "slider no_bord",
    attrs: {
      "type": "range",
      "min": "0",
      "max": "5000",
      "step": "0.01"
    },
    domProps: {
      "value": (_vm.var_cost)
    },
    on: {
      "input": function($event) {
        _vm.setPoint()
      },
      "__r": function($event) {
        _vm.var_cost = $event.target.value
      }
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "create_content"
  }, [_c('a', {
    staticClass: "login btn create_account",
    attrs: {
      "href": "#/signup"
    },
    on: {
      "click": function($event) {
        _vm.func1()
      }
    }
  }, [_vm._v("Create a free account")])])])])]), _vm._v(" "), _vm._m(1), _vm._v(" "), _vm._m(2), _vm._v(" "), _c('div', {
    staticClass: "video_panel"
  }, _vm._l((_vm.video_list), function(item) {
    return _c('div', {
      staticClass: "youtube-player"
    }, [_c('h3', [_vm._v(_vm._s(item.title))]), _vm._v(" "), _c('iframe', {
      attrs: {
        "src": 'https://www.youtube.com/embed/' + item.video,
        "frameborder": "0",
        "allowfullscreen": ""
      }
    })])
  })), _vm._v(" "), _vm._m(3)])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', {
    attrs: {
      "align": "right"
    }
  }, [_vm._v("Cost/day")]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "right"
    }
  }, [_vm._v("Conversion")]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "right"
    }
  }, [_vm._v("ROI")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "text_content"
  }, [_c('br'), _vm._v(" "), _c('h1', [_vm._v("Budget Optimize can answer these questions::")]), _vm._v(" "), _c('ul', [_c('li', [_vm._v("What should I spend for my campaign to achieve it's optimal ROI or CPA?")]), _vm._v(" "), _c('li', [_vm._v("How should I allocate budgets between my campaigns to achieve an overall optimal ROI outcome?")]), _vm._v(" "), _c('li', [_vm._v("My campaign is currently spending $x per day, if I was to increase to $y / day, what kind of Revenue & ROI/CPA change should I expect?")])]), _vm._v(" "), _c('br')])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "word_content"
  }, [_c('br'), _vm._v(" "), _c('h1', [_vm._v("What our customers say")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "sample_optimize"
  }, [_c('div', [_c('h1', [_vm._v("Map campaigns using regression models to find optimal performance")]), _vm._v(" "), _c('img', {
    staticClass: "first_img",
    attrs: {
      "src": __webpack_require__(74)
    }
  })]), _vm._v(" "), _c('div', [_c('h1', [_vm._v("Forecast performance with increased budgets")]), _vm._v(" "), _c('img', {
    staticClass: "second_img",
    attrs: {
      "src": __webpack_require__(73)
    }
  })]), _vm._v(" "), _c('div', [_c('h1', [_vm._v("Find optimal campaign budget allocation that you can plug back into your account")]), _vm._v(" "), _c('img', {
    staticClass: "third_img",
    attrs: {
      "src": __webpack_require__(75)
    }
  })])])
}]}

/***/ }),
/* 117 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('form', {
    attrs: {
      "action": "api/admin/campaign_csv.php",
      "method": "POST"
    }
  }, [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), _c('h2', {
    attrs: {
      "align": "center"
    }
  }, [_vm._v("ROI campaigns for "), _c('span', {
    staticClass: "user_name"
  }, [_vm._v(_vm._s(_vm.user_name))])]), _vm._v(" "), _c('div', {
    staticClass: "center bot_space"
  }, [_c('button', {
    staticClass: "btn btn_yes",
    attrs: {
      "name": "cmdROI",
      "disabled": !_vm.selected_roi.length
    }
  }, [_vm._v("Export selected campaigns")])]), _vm._v(" "), _c('table', {
    staticClass: "acc_stat",
    attrs: {
      "align": "center"
    }
  }, [_c('thead', [_c('tr', [_c('th', [_c('input', {
    attrs: {
      "type": "checkbox"
    },
    domProps: {
      "checked": _vm.data_roi.length && _vm.selected_roi.length == _vm.data_roi.length
    },
    on: {
      "click": _vm.roi_all
    }
  })]), _vm._v(" "), _c('th', [_vm._v("Group name")]), _vm._v(" "), _c('th', [_vm._v("Campaign title - ROI")]), _vm._v(" "), _c('th', [_vm._v("Export")])])]), _vm._v(" "), _c('tbody', _vm._l((_vm.sortedROI), function(item) {
    return _c('tr', [_c('td', {
      attrs: {
        "align": "center"
      }
    }, [_c('input', {
      directives: [{
        name: "model",
        rawName: "v-model",
        value: (_vm.selected_roi),
        expression: "selected_roi"
      }],
      attrs: {
        "type": "checkbox",
        "name": "cid[]",
        "id": 'roi_' + item.id
      },
      domProps: {
        "value": item.id,
        "checked": Array.isArray(_vm.selected_roi) ? _vm._i(_vm.selected_roi, item.id) > -1 : (_vm.selected_roi)
      },
      on: {
        "__c": function($event) {
          var $$a = _vm.selected_roi,
            $$el = $event.target,
            $$c = $$el.checked ? (true) : (false);
          if (Array.isArray($$a)) {
            var $$v = item.id,
              $$i = _vm._i($$a, $$v);
            if ($$el.checked) {
              $$i < 0 && (_vm.selected_roi = $$a.concat($$v))
            } else {
              $$i > -1 && (_vm.selected_roi = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
            }
          } else {
            _vm.selected_roi = $$c
          }
        }
      }
    })]), _vm._v(" "), _c('td', [_c('label', {
      attrs: {
        "for": 'roi_' + item.id
      }
    }, [_vm._v(_vm._s(item.group))])]), _vm._v(" "), _c('td', [_c('label', {
      attrs: {
        "for": 'roi_' + item.id
      }
    }, [_vm._v(_vm._s(item.title))])]), _vm._v(" "), _c('td', [_c('a', {
      staticClass: "link",
      attrs: {
        "href": 'api/admin/campaign_csv.php?id=' + item.id
      }
    }, [_vm._v("Get CSV")])])])
  }))]), _vm._v(" "), _c('h2', {
    attrs: {
      "align": "center"
    }
  }, [_vm._v("CPA campaigns for "), _c('span', {
    staticClass: "user_name"
  }, [_vm._v(_vm._s(_vm.user_name))])]), _vm._v(" "), _c('div', {
    staticClass: "center bot_space"
  }, [_c('button', {
    staticClass: "btn btn_yes",
    attrs: {
      "name": "cmdCPA",
      "disabled": !_vm.selected_cpa.length
    }
  }, [_vm._v("Export selected campaigns")])]), _vm._v(" "), _c('table', {
    staticClass: "acc_stat",
    attrs: {
      "align": "center"
    }
  }, [_c('thead', [_c('tr', [_c('th', [_c('input', {
    attrs: {
      "type": "checkbox"
    },
    domProps: {
      "checked": _vm.data_cpa.length && _vm.selected_cpa.length == _vm.data_cpa.length
    },
    on: {
      "click": _vm.cpa_all
    }
  })]), _vm._v(" "), _c('th', [_vm._v("Group name")]), _vm._v(" "), _c('th', [_vm._v("Campaign title - CPA")]), _vm._v(" "), _c('th', [_vm._v("Export")])])]), _vm._v(" "), _c('tbody', _vm._l((_vm.sortedCPA), function(item) {
    return _c('tr', [_c('td', {
      attrs: {
        "align": "center"
      }
    }, [_c('input', {
      directives: [{
        name: "model",
        rawName: "v-model",
        value: (_vm.selected_cpa),
        expression: "selected_cpa"
      }],
      attrs: {
        "type": "checkbox",
        "name": "cid[]",
        "id": 'cpa_' + item.id
      },
      domProps: {
        "value": item.id,
        "checked": Array.isArray(_vm.selected_cpa) ? _vm._i(_vm.selected_cpa, item.id) > -1 : (_vm.selected_cpa)
      },
      on: {
        "__c": function($event) {
          var $$a = _vm.selected_cpa,
            $$el = $event.target,
            $$c = $$el.checked ? (true) : (false);
          if (Array.isArray($$a)) {
            var $$v = item.id,
              $$i = _vm._i($$a, $$v);
            if ($$el.checked) {
              $$i < 0 && (_vm.selected_cpa = $$a.concat($$v))
            } else {
              $$i > -1 && (_vm.selected_cpa = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
            }
          } else {
            _vm.selected_cpa = $$c
          }
        }
      }
    })]), _vm._v(" "), _c('td', [_c('label', {
      attrs: {
        "for": 'cpa_' + item.id
      }
    }, [_vm._v(_vm._s(item.group))])]), _vm._v(" "), _c('td', [_c('label', {
      attrs: {
        "for": 'cpa_' + item.id
      }
    }, [_vm._v(_vm._s(item.title))])]), _vm._v(" "), _c('td', [_c('a', {
      staticClass: "link",
      attrs: {
        "href": 'api/admin/campaign_csv.php?id=' + item.id
      }
    }, [_vm._v("Get CSV")])])])
  }))]), _vm._v(" "), _c('br')], 1)
},staticRenderFns: []}

/***/ }),
/* 118 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), _c('table', {
    attrs: {
      "align": "center"
    }
  }, [_c('tr', [_c('td', [_c('div', {
    staticClass: "campaign_list"
  }, _vm._l((_vm.info), function(camp, idx) {
    return _c('camp', {
      key: camp.id,
      attrs: {
        "points": camp.points,
        "title": camp.title,
        "kind": camp.kind,
        "idx": idx
      },
      on: {
        "regress": _vm.solverParam
      }
    })
  }))])])]), _vm._v(" "), _c('div', {
    staticClass: "screen_width center"
  }, [(_vm.info.length >= 1 && _vm.solved == 0) ? _c('solve', {
    attrs: {
      "list": _vm.info.length > 1 ? _vm.reg_data.slice(1) : _vm.reg_data,
      "kind": _vm.info[0].kind
    },
    on: {
      "failure": _vm.showErr,
      "optimize": _vm.solverResult
    }
  }) : _vm._e()], 1)], 1)
},staticRenderFns: []}

/***/ }),
/* 119 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), _c('h2', {
    attrs: {
      "align": "center"
    }
  }, [_vm._v("Event log for "), _c('span', {
    staticClass: "user_name"
  }, [_vm._v(_vm._s(_vm.user_name))])]), _vm._v(" "), _c('table', {
    staticClass: "acc_stat",
    attrs: {
      "align": "center"
    }
  }, [_vm._m(0), _vm._v(" "), _c('tbody', _vm._l((_vm.events), function(item) {
    return _c('tr', [_c('td', [_vm._v(_vm._s(item.stamp))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.ip))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.title))]), _vm._v(" "), _c('td', [_vm._v(_vm._s(item.data))])])
  }))])], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('thead', [_c('tr', [_c('th', [_vm._v("Timestamp")]), _vm._v(" "), _c('th', [_vm._v("IP address")]), _vm._v(" "), _c('th', [_vm._v("Event type")]), _vm._v(" "), _c('th', [_vm._v("Event details")])])])
}]}

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "campaigns_screen"
  }, [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "campaign_sidebar_wrapper"
  }, [_c('div', {
    staticClass: "campaign_left",
    class: {
      active: _vm.active
    }
  }, [_c('div', {
    staticClass: "sidebar_tap_wrapper"
  }, [(_vm.roi_or_cpa != 1) ? _c('button', {
    staticClass: "roi_content"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.roi_or_cpa),
      expression: "roi_or_cpa"
    }],
    attrs: {
      "type": "radio",
      "id": "roi_optimial",
      "value": "1"
    },
    domProps: {
      "checked": _vm._q(_vm.roi_or_cpa, "1")
    },
    on: {
      "click": function($event) {
        _vm.doOptimal(_vm.roi_or_cpa == 1 ? _vm.select_roi : _vm.select_cpa)
      },
      "__c": function($event) {
        _vm.roi_or_cpa = "1"
      }
    }
  }), _vm._v(" "), _c('label', {
    attrs: {
      "for": "roi_optimial"
    }
  }, [_vm._v("ROI")]), _vm._v(" "), _vm._m(0)]) : _vm._e(), _vm._v(" "), (_vm.roi_or_cpa == 1) ? _c('div', {
    staticClass: "roi_content actived_tav"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.roi_or_cpa),
      expression: "roi_or_cpa"
    }],
    attrs: {
      "type": "radio",
      "id": "roi_optimial",
      "value": "1"
    },
    domProps: {
      "checked": _vm._q(_vm.roi_or_cpa, "1")
    },
    on: {
      "click": function($event) {
        _vm.doOptimal(_vm.roi_or_cpa == 1 ? _vm.select_roi : _vm.select_cpa)
      },
      "__c": function($event) {
        _vm.roi_or_cpa = "1"
      }
    }
  }), _vm._v(" "), _c('label', {
    attrs: {
      "for": "roi_optimial"
    }
  }, [_vm._v("ROI")]), _vm._v(" "), _vm._m(1)]) : _vm._e(), _vm._v(" "), (_vm.roi_or_cpa != 0) ? _c('button', {
    staticClass: "cpa_content"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.roi_or_cpa),
      expression: "roi_or_cpa"
    }],
    attrs: {
      "type": "radio",
      "id": "cpa_optimial",
      "value": "0"
    },
    domProps: {
      "checked": _vm._q(_vm.roi_or_cpa, "0")
    },
    on: {
      "click": function($event) {
        _vm.doOptimal(_vm.roi_or_cpa == 1 ? _vm.select_roi : _vm.select_cpa)
      },
      "__c": function($event) {
        _vm.roi_or_cpa = "0"
      }
    }
  }), _vm._v(" "), _c('label', {
    attrs: {
      "for": "cpa_optimial"
    }
  }, [_vm._v("CPA")]), _vm._v(" "), _vm._m(2)]) : _vm._e(), _vm._v(" "), (_vm.roi_or_cpa == 0) ? _c('div', {
    staticClass: "cpa_content actived_tav"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.roi_or_cpa),
      expression: "roi_or_cpa"
    }],
    attrs: {
      "type": "radio",
      "id": "cpa_optimial",
      "value": "0"
    },
    domProps: {
      "checked": _vm._q(_vm.roi_or_cpa, "0")
    },
    on: {
      "click": function($event) {
        _vm.doOptimal(_vm.roi_or_cpa == 1 ? _vm.select_roi : _vm.select_cpa)
      },
      "__c": function($event) {
        _vm.roi_or_cpa = "0"
      }
    }
  }), _vm._v(" "), _c('label', {
    attrs: {
      "for": "cpa_optimial"
    }
  }, [_vm._v("CPA")]), _vm._v(" "), _vm._m(3)]) : _vm._e()]), _vm._v(" "), _c('div', {
    staticClass: "campaign_panel"
  }, [_c('div', {
    staticClass: "campaign_listing"
  }, [_vm._m(4), _vm._v(" "), _c('div', {
    staticClass: "search-wrapper"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.search),
      expression: "search"
    }],
    attrs: {
      "type": "text",
      "placeholder": "Search campaign.."
    },
    domProps: {
      "value": (_vm.search)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.search = $event.target.value
      }
    }
  }), _vm._v(" "), _c('label', [_vm._v("Search title:")]), _vm._v(" "), _c('i', {
    staticClass: "fa fa-search",
    attrs: {
      "aria-hidden": "true"
    }
  })]), _vm._v(" "), (_vm.roi_or_cpa == 1) ? [_vm._l((_vm.groupsROI), function(grp) {
    return [_c('div', {
      staticClass: "group_title"
    }, [(grp.collapsed) ? _c('div', [_c('input', {
      attrs: {
        "type": "checkbox"
      },
      domProps: {
        "checked": grp.checked == _vm.campaign_roi[grp.id].length
      },
      on: {
        "click": function($event) {
          _vm.toggleSelected(_vm.campaign_roi[grp.id], _vm.select_roi, grp)
        }
      }
    })]) : _vm._e(), _vm._v(" "), _c('div', {
      staticClass: "group_name",
      on: {
        "click": function($event) {
          _vm.toggleCollapsed(grp)
        }
      }
    }, [_c('i', {
      staticClass: "fa fa-angle-up",
      attrs: {
        "id": grp.id,
        "aria-hidden": "true"
      }
    }), _vm._v("\n                  " + _vm._s((grp.title != '' ? grp.title : 'NO GROUP')) + "\n                ")]), _vm._v(" "), _c('i', {
      staticClass: "fa fa-remove cus_remove",
      on: {
        "click": function($event) {
          _vm.removeElement($event, grp)
        }
      }
    })]), _vm._v(" "), (grp.collapsed) ? _c('ul', {
      staticClass: "no_list camp_group",
      attrs: {
        "id": grp.id + 'list'
      }
    }, _vm._l((_vm.sortedROI(grp)), function(item) {
      return _c('li', [_c('input', {
        directives: [{
          name: "model",
          rawName: "v-model",
          value: (_vm.select_roi),
          expression: "select_roi"
        }],
        attrs: {
          "disabled": item.unpaid && !_vm.$root.info.is_admin,
          "type": "checkbox",
          "id": 'roi_' + item.id
        },
        domProps: {
          "value": item.id,
          "checked": Array.isArray(_vm.select_roi) ? _vm._i(_vm.select_roi, item.id) > -1 : (_vm.select_roi)
        },
        on: {
          "click": function($event) {
            grp.checked += ($event.target.checked ? +1 : -1)
          },
          "__c": function($event) {
            var $$a = _vm.select_roi,
              $$el = $event.target,
              $$c = $$el.checked ? (true) : (false);
            if (Array.isArray($$a)) {
              var $$v = item.id,
                $$i = _vm._i($$a, $$v);
              if ($$el.checked) {
                $$i < 0 && (_vm.select_roi = $$a.concat($$v))
              } else {
                $$i > -1 && (_vm.select_roi = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
              }
            } else {
              _vm.select_roi = $$c
            }
          }
        }
      }), _vm._v(" "), _c('label', {
        attrs: {
          "for": 'roi_' + item.id
        }
      }, [_vm._v(" " + _vm._s(item.title))])])
    })) : _vm._e()]
  })] : [_vm._l((_vm.groupsCPA), function(grp) {
    return [_c('div', {
      staticClass: "group_title"
    }, [(grp.collapsed) ? _c('div', [_c('input', {
      attrs: {
        "type": "checkbox"
      },
      domProps: {
        "checked": grp.checked == _vm.campaign_cpa[grp.id].length
      },
      on: {
        "click": function($event) {
          _vm.toggleSelected(_vm.campaign_cpa[grp.id], _vm.select_cpa, grp)
        }
      }
    })]) : _vm._e(), _vm._v(" "), _c('div', {
      staticClass: "group_name",
      on: {
        "click": function($event) {
          _vm.toggleCollapsed(grp)
        }
      }
    }, [_c('i', {
      staticClass: "fa fa-angle-up",
      attrs: {
        "id": grp.id,
        "aria-hidden": "true"
      }
    }), _vm._v("\n                  " + _vm._s((grp.title != '' ? grp.title : 'NO GROUP')) + "\n                ")]), _vm._v(" "), _c('i', {
      staticClass: "fa fa-remove cus_remove",
      on: {
        "click": function($event) {
          _vm.removeElement($event, grp)
        }
      }
    })]), _vm._v(" "), (grp.collapsed) ? _c('ul', {
      staticClass: "no_list camp_group",
      attrs: {
        "id": grp.id
      }
    }, _vm._l((_vm.sortedCPA(grp)), function(item) {
      return _c('li', [_c('input', {
        directives: [{
          name: "model",
          rawName: "v-model",
          value: (_vm.select_cpa),
          expression: "select_cpa"
        }],
        attrs: {
          "disabled": item.unpaid && !_vm.$root.info.is_admin,
          "type": "checkbox",
          "id": 'cpa_' + item.id
        },
        domProps: {
          "value": item.id,
          "checked": Array.isArray(_vm.select_cpa) ? _vm._i(_vm.select_cpa, item.id) > -1 : (_vm.select_cpa)
        },
        on: {
          "click": function($event) {
            grp.checked += ($event.target.checked ? +1 : -1)
          },
          "__c": function($event) {
            var $$a = _vm.select_cpa,
              $$el = $event.target,
              $$c = $$el.checked ? (true) : (false);
            if (Array.isArray($$a)) {
              var $$v = item.id,
                $$i = _vm._i($$a, $$v);
              if ($$el.checked) {
                $$i < 0 && (_vm.select_cpa = $$a.concat($$v))
              } else {
                $$i > -1 && (_vm.select_cpa = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
              }
            } else {
              _vm.select_cpa = $$c
            }
          }
        }
      }), _vm._v(" "), _c('label', {
        attrs: {
          "for": 'cpa_' + item.id
        }
      }, [_vm._v(" " + _vm._s(item.title))])])
    })) : _vm._e()]
  })]], 2), _vm._v(" "), (_vm.valid_msg != '') ? _c('div', {
    staticClass: "error_message",
    domProps: {
      "innerHTML": _vm._s(_vm.valid_msg)
    }
  }) : _vm._e(), _vm._v(" "), ((_vm.roi_or_cpa == 1 && _vm.campaign_roi.length == 0) || (_vm.roi_or_cpa != 1 && _vm.campaign_cpa.length == 0)) ? _c('div', {
    staticClass: "error_message"
  }, [_vm._v("\n          Please "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#/import"
    }
  }, [_vm._v("import")]), _vm._v(" some data\n        ")]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "campaign_dates"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.from_date),
      expression: "from_date"
    }],
    attrs: {
      "type": "date"
    },
    domProps: {
      "value": (_vm.from_date)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.from_date = $event.target.value
      }
    }
  }), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.to_date),
      expression: "to_date"
    }],
    attrs: {
      "type": "date"
    },
    domProps: {
      "value": (_vm.to_date)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.to_date = $event.target.value
      }
    }
  }), _vm._v(" "), _c('button', {
    staticClass: "btn btn_dark btn-shadow",
    staticStyle: {
      "padding": "3px 6px 4px"
    },
    on: {
      "click": function($event) {
        _vm.doOptimal(_vm.roi_or_cpa == 1 ? _vm.select_roi : _vm.select_cpa)
      }
    }
  }, [_c('svg', {
    attrs: {
      "width": "16px",
      "height": "22px",
      "viewBox": "0 0 16 22",
      "xmlns": "http://www.w3.org/2000/svg"
    }
  }, [_c('path', {
    attrs: {
      "fill": "#fff",
      "d": "M8,3 L8,0 L4,4 L8,8 L8,5 C11.3,5 14,7.7 14,11 C14,12 13.7,13 13.3,13.8 L14.8,15.3\n                C15.5,14 16,12.6 16,11 C16,6.6 12.4,3 8,3 L8,3 Z M8,17 C4.7,17 2,14.3 2,11 C2,10 2.3,9 2.7,8.2 L1.2,6.7\n                C0.5,8 0,9.4 0,11 C0,15.4 3.6,19 8,19 L8,22 L12,18 L8,14 L8,17 L8,17 Z"
    }
  })])])])]), _vm._v(" "), _c('div', {
    staticClass: "campaign_optimize"
  }, [_c('div', {
    slot: "collapse-body"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.outlier),
      expression: "outlier"
    }],
    attrs: {
      "type": "checkbox",
      "id": "remove_outlier"
    },
    domProps: {
      "checked": Array.isArray(_vm.outlier) ? _vm._i(_vm.outlier, null) > -1 : (_vm.outlier)
    },
    on: {
      "__c": function($event) {
        var $$a = _vm.outlier,
          $$el = $event.target,
          $$c = $$el.checked ? (true) : (false);
        if (Array.isArray($$a)) {
          var $$v = null,
            $$i = _vm._i($$a, $$v);
          if ($$el.checked) {
            $$i < 0 && (_vm.outlier = $$a.concat($$v))
          } else {
            $$i > -1 && (_vm.outlier = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
          }
        } else {
          _vm.outlier = $$c
        }
      }
    }
  }), _vm._v(" "), _c('label', {
    attrs: {
      "for": "remove_outlier"
    }
  }, [_vm._v("Remove outliers")]), _vm._v(" "), _vm._m(5), _vm._v(" "), (_vm.roi_or_cpa == 1 && _vm.select_roi.length > 0) ? _c('button', {
    staticClass: "campaign_delete btn btn_dark",
    on: {
      "click": function($event) {
        _vm.delCampaign(_vm.select_roi)
      }
    }
  }, [_vm._v("Delete selected")]) : _vm._e(), _vm._v(" "), (_vm.roi_or_cpa == 0 && _vm.select_cpa.length > 0) ? _c('button', {
    staticClass: "campaign_delete btn btn_dark",
    on: {
      "click": function($event) {
        _vm.delCampaign(_vm.select_cpa)
      }
    }
  }, [_vm._v("Delete selected")]) : _vm._e()])]), _vm._v(" "), _c('div', {
    staticClass: "campaign_regress"
  }, [_c('collapse', {
    attrs: {
      "selected": false
    }
  }, [_c('div', {
    slot: "collapse-header"
  }, [_c('b', [_vm._v("Regression Model for best fit")]), _vm._v(" "), _c('span', {
    staticClass: "center help_sign tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "r-squared is a statistical measure of how close the regression line fits the data points.  R-squared lies between 0 & 1.  The higher the r-squared value the better the fit.  We have auto selected the model with the highest r-squared value, however you can adjust the model."
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])]), _vm._v(" "), _c('div', {
    slot: "collapse-body"
  }, [_c('table', [_c('tr', [_c('td', [_vm._v(" ")]), _vm._v(" "), _c('td', [_vm._v(" ")]), _vm._v(" "), _c('td', {
    attrs: {
      "align": "right"
    }
  }, [_vm._v("R"), _c('span', {
    staticClass: "super"
  }, [_vm._v("2")])])]), _vm._v(" "), _vm._l((_vm.regressions), function(reg, idx) {
    return _c('tr', [_c('td', [_c('input', {
      directives: [{
        name: "model",
        rawName: "v-model",
        value: (_vm.kind_regress),
        expression: "kind_regress"
      }],
      attrs: {
        "type": "radio",
        "id": 'regid_' + idx
      },
      domProps: {
        "value": idx,
        "checked": _vm._q(_vm.kind_regress, idx)
      },
      on: {
        "__c": function($event) {
          _vm.kind_regress = idx
        }
      }
    })]), _vm._v(" "), _c('td', [_c('label', {
      attrs: {
        "for": 'regid_' + idx
      }
    }, [_vm._v(_vm._s(reg))])]), _vm._v(" "), _c('td', {
      attrs: {
        "align": "right"
      }
    }, [_vm._v(_vm._s(_vm._f("filterNum")(_vm.r2[idx])))])])
  })], 2)])])], 1), _vm._v(" "), _c('div', {
    staticClass: "campaign_actual"
  }, [_c('collapse', {
    attrs: {
      "selected": false
    }
  }, [_c('div', {
    slot: "collapse-header"
  }, [_c('b', [_vm._v("Actual Historical Results"), _c('br'), _vm._v("during this period")]), _vm._v(" "), _c('div', {
    staticClass: "center help_sign tooltip-bottom tooltip custom-help",
    attrs: {
      "data-tooltip": "These are actual results from your data within the selected time frame.  Compare these numbers with results from the model to see the difference in the predictions vs actual results."
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])]), _vm._v(" "), _c('div', {
    slot: "collapse-body"
  }, [_c('div', {
    staticClass: "actual_body"
  }, [_vm._v("\n              Total Spent = " + _vm._s(_vm._f("filterNum")(_vm.total_spent))), _c('br'), _vm._v("Avg Spent = " + _vm._s(_vm._f("filterNum")(_vm.avg_spent)) + "\n            ")]), _vm._v(" "), _c('div', {
    staticClass: "actual_body"
  }, [_vm._v("\n              Total " + _vm._s(_vm.roi_or_cpa == 1 ? 'Revenue = ' : 'Conversions = ') + _vm._s(_vm._f("filterNum")(_vm.total_revenue)) + "\n              "), _c('br'), _vm._v("\n              Avg " + _vm._s(_vm.roi_or_cpa == 1 ? 'revenue' : 'conv') + " / day = " + _vm._s(_vm._f("filterNum")(_vm.avg_revenue)) + "\n            ")]), _vm._v(" "), _c('div', {
    staticClass: "actual_body"
  }, [_vm._v("\n              Total " + _vm._s(_vm.roi_or_cpa == 1 ? 'ROI' : 'CPA') + " for period = " + _vm._s(_vm._f("filterNum")(_vm.total_roi)) + _vm._s(_vm.roi_or_cpa == 1 ? '%' : '') + "\n              "), _c('br'), _vm._v("\n              Avg daily " + _vm._s(_vm.roi_or_cpa == 1 ? 'ROI' : 'CPA') + " = " + _vm._s(_vm._f("filterNum")(_vm.avg_roi)) + _vm._s(_vm.roi_or_cpa == 1 ? '%' : '') + "\n            ")])])])], 1)]), _vm._v(" "), _c('div', {
    staticClass: "sidebar_collapse",
    on: {
      "click": function($event) {
        _vm.toggleNav($event)
      }
    }
  }, [_c('i', {
    staticClass: "fa fa-caret-left custom_collapse",
    attrs: {
      "id": "collapseIcon",
      "aria-hidden": "true"
    }
  })])]), _vm._v(" "), _c('div', {
    staticClass: "campaign_center"
  }, [_c('optimizer', {
    attrs: {
      "kind": parseInt(_vm.roi_or_cpa),
      "regression": _vm.kind_regress,
      "campaigns": _vm.optimizer_list,
      "outliers": _vm.outlier,
      "start": _vm.from_date,
      "end": _vm.to_date,
      "reg_names": _vm.regressions
    },
    on: {
      "error": _vm.showError,
      "history": _vm.updHistory
    }
  })], 1)], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "Select campaign data that contains revenue to optimise for ROI (Return on Investment)."
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "Select campaign data that contains revenue to optimise for ROI (Return on Investment)."
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "Select Campaign data that contains ‘conversions’ to optimise for CPA (Cost Per Aquisition)."
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "Select Campaign data that contains ‘conversions’ to optimise for CPA (Cost Per Aquisition)."
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "campaign_header"
  }, [_c('h3', [_vm._v("Campaigns")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "tooltip-bottom tooltip",
    attrs: {
      "data-tooltip": "Outliers are abnormal observations that can skew results. Removing outliers is recommended."
    }
  }, [_c('img', {
    attrs: {
      "src": __webpack_require__(2)
    }
  })])
}]}

/***/ }),
/* 121 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "sup_container"
  }, [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "center"
  }, [_c('h2', [_vm._v("Get in Touch")]), _vm._v(" "), _c('hr', {
    attrs: {
      "size": "1",
      "width": "64px",
      "color": "black"
    }
  }), _vm._v(" "), _c('p', [_vm._v("Please fill out the quick form and we will be in touch with lightning speed.")]), _vm._v(" "), _c('form', {
    staticClass: "contact_form",
    on: {
      "submit": function($event) {
        $event.preventDefault();
        _vm.doContact($event)
      }
    }
  }, [_c('table', {
    attrs: {
      "cellpadding": "5"
    }
  }, [_vm._m(0), _vm._v(" "), _c('tr', [_c('td', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.subject),
      expression: "subject"
    }],
    staticClass: "field_full",
    attrs: {
      "type": "text"
    },
    domProps: {
      "value": (_vm.subject)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.subject = $event.target.value
      }
    }
  })])]), _vm._v(" "), _vm._m(1), _vm._v(" "), _c('tr', [_c('td', [_c('textarea', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.message),
      expression: "message"
    }],
    staticClass: "field_full",
    attrs: {
      "wrap": "soft",
      "rows": "8",
      "cols": "55"
    },
    domProps: {
      "value": (_vm.message)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.message = $event.target.value
      }
    }
  })])])]), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "send"
    }
  }, [(_vm.form_error != '') ? _c('div', {
    staticClass: "error_message center",
    domProps: {
      "innerHTML": _vm._s(_vm.form_error)
    }
  }) : _vm._e()]), _vm._v(" "), _c('button', {
    staticClass: "btn-login small_margin",
    attrs: {
      "type": "submit"
    }
  }, [_vm._v("Submit")])], 1)]), _vm._v(" "), _c('instruct')], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', [_c('strong', [_vm._v("Subject")]), _vm._v(" (required)")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('tr', [_c('td', [_c('strong', [_vm._v("Message")]), _vm._v(" (required)")])])
}]}

/***/ }),
/* 122 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "margin_box"
  }, [_c('err-panel', {
    attrs: {
      "warn": _vm.is_warn
    },
    model: {
      value: (_vm.warn_text),
      callback: function($$v) {
        _vm.warn_text = $$v
      },
      expression: "warn_text"
    }
  }), _vm._v(" "), (!(_vm.$root.info && _vm.$root.info.confirmed)) ? _c('div', {
    staticClass: "center_screen error_message"
  }, [_vm._v("\n    Forbidden - you have not confirmed your email address."), _c('br'), _vm._v("\n    Confirm your e-mail or "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#/profile"
    }
  }, [_vm._v("re-issue")]), _vm._v(" new activation.\n  ")]) : _vm._e(), _vm._v(" "), (_vm.unpaid) ? _c('div', {
    staticClass: "center"
  }, [_c('b', {
    staticStyle: {
      "color": "#E528B0"
    }
  }, [_vm._v("Warning")]), _c('br'), _vm._v("You have reached the upper limit for our "), _c('b', [_vm._v("Free Plan")]), _vm._v(".\n    "), _c('br'), _vm._v("Please "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": "#/upgrade"
    }
  }, [_vm._v("upgrade")]), _vm._v(" to our paid subscription ("), _c('b', [_vm._v("10 USD")]), _vm._v("/month) for "), _c('u', [_vm._v("unlimited")]), _vm._v(" campaigns.\n  ")]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "import_container full_width"
  }, [(_vm.$root.info && _vm.$root.info.confirmed) ? _c('div', {
    staticClass: "panel"
  }, [_vm._m(0), _vm._v(" "), _vm._m(1), _vm._v(" "), _c('br'), _vm._v(" "), _c('fieldset', {
    staticClass: "new_campaign"
  }, [_c('legend', [_vm._v(" New campaign ")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.new_roi),
      expression: "new_roi"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "placeholder": "Group name for campaign(s)"
    },
    domProps: {
      "value": (_vm.new_roi)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.new_roi = $event.target.value
      }
    }
  }), _vm._v(" "), _c('label', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.no_multi_roi),
      expression: "no_multi_roi"
    }],
    attrs: {
      "type": "checkbox"
    },
    domProps: {
      "checked": Array.isArray(_vm.no_multi_roi) ? _vm._i(_vm.no_multi_roi, null) > -1 : (_vm.no_multi_roi)
    },
    on: {
      "__c": function($event) {
        var $$a = _vm.no_multi_roi,
          $$el = $event.target,
          $$c = $$el.checked ? (true) : (false);
        if (Array.isArray($$a)) {
          var $$v = null,
            $$i = _vm._i($$a, $$v);
          if ($$el.checked) {
            $$i < 0 && (_vm.no_multi_roi = $$a.concat($$v))
          } else {
            $$i > -1 && (_vm.no_multi_roi = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
          }
        } else {
          _vm.no_multi_roi = $$c
        }
      }
    }
  }), _vm._v(" Treat a file with multiple campaigns as a single campaign")]), _vm._v(" "), _c('label', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.combine_roi),
      expression: "combine_roi"
    }],
    attrs: {
      "type": "checkbox"
    },
    domProps: {
      "checked": Array.isArray(_vm.combine_roi) ? _vm._i(_vm.combine_roi, null) > -1 : (_vm.combine_roi)
    },
    on: {
      "__c": function($event) {
        var $$a = _vm.combine_roi,
          $$el = $event.target,
          $$c = $$el.checked ? (true) : (false);
        if (Array.isArray($$a)) {
          var $$v = null,
            $$i = _vm._i($$a, $$v);
          if ($$el.checked) {
            $$i < 0 && (_vm.combine_roi = $$a.concat($$v))
          } else {
            $$i > -1 && (_vm.combine_roi = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
          }
        } else {
          _vm.combine_roi = $$c
        }
      }
    }
  }), _vm._v(" Combine multiple file uploads into 1 file for 1 campaign")]), _vm._v(" "), _c('input', {
    ref: "file_new_roi",
    staticClass: "file",
    attrs: {
      "type": "file",
      "id": "file_roi_new",
      "accept": ".csv,.xlsx",
      "multiple": ""
    },
    on: {
      "change": _vm.newFileROI
    }
  }), _vm._v(" "), _vm._m(2), _vm._v(" "), (_vm.file_roi_new.length) ? _c('ol', {
    staticClass: "list"
  }, _vm._l((_vm.file_roi_new), function(item) {
    return _c('li', [_vm._v(_vm._s(item.name))])
  })) : _vm._e(), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.uploadROI
    }
  }, [_vm._v("UPLOAD")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.roi_client_customer_id),
      expression: "roi_client_customer_id"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "placeholder": "Customer Client ID for your adwords account"
    },
    domProps: {
      "value": (_vm.roi_client_customer_id)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.roi_client_customer_id = $event.target.value
      }
    }
  }), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.connectROIAPI
    }
  }, [_vm._v("Connect API")])]), _vm._v(" "), _c('h2', {
    staticClass: "center"
  }, [_vm._v("OR")]), _vm._v(" "), _c('fieldset', {
    staticClass: "new_campaign"
  }, [_c('legend', [_vm._v(" Old campaign ")]), _vm._v(" "), _c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.old_roi),
      expression: "old_roi"
    }],
    staticClass: "full_width",
    on: {
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.old_roi = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, [_c('option', {
    attrs: {
      "value": "0"
    }
  }, [_vm._v("- Select campaign -")]), _vm._v(" "), _vm._l((_vm.groupsROI), function(grp) {
    return _c('optgroup', {
      attrs: {
        "label": grp.title || 'NO GROUP'
      }
    }, _vm._l((_vm.sortedROI(grp)), function(item) {
      return _c('option', {
        domProps: {
          "value": item.id
        }
      }, [_vm._v(_vm._s(item.title))])
    }))
  })], 2), _vm._v(" "), _c('input', {
    ref: "file_old_roi",
    staticClass: "file",
    attrs: {
      "type": "file",
      "id": "file_roi_old",
      "accept": ".csv,.xlsx"
    },
    on: {
      "change": _vm.oldFileROI
    }
  }), _vm._v(" "), _vm._m(3), _vm._v(" "), (_vm.file_roi_old.length) ? _c('ol', {
    staticClass: "list"
  }, _vm._l((_vm.file_roi_old), function(item) {
    return _c('li', [_vm._v(_vm._s(item.name))])
  })) : _vm._e(), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.appendROI
    }
  }, [_vm._v("Append to existing data")]), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.updateROI
    }
  }, [_vm._v("Update existing data")]), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.replaceROI
    }
  }, [_vm._v("Replace existing data")])])]) : _vm._e(), _vm._v(" "), (_vm.$root.info && _vm.$root.info.confirmed) ? _c('div', {
    staticClass: "panel"
  }, [_vm._m(4), _vm._v(" "), _vm._m(5), _vm._v(" "), _c('br'), _vm._v(" "), _c('fieldset', {
    staticClass: "new_campaign"
  }, [_c('legend', [_vm._v(" New campaign ")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.new_cpa),
      expression: "new_cpa"
    }],
    staticClass: "full_width field",
    attrs: {
      "type": "text",
      "placeholder": "Group name for campaign(s)"
    },
    domProps: {
      "value": (_vm.new_cpa)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.new_cpa = $event.target.value
      }
    }
  }), _vm._v(" "), _c('label', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.no_multi_cpa),
      expression: "no_multi_cpa"
    }],
    attrs: {
      "type": "checkbox"
    },
    domProps: {
      "checked": Array.isArray(_vm.no_multi_cpa) ? _vm._i(_vm.no_multi_cpa, null) > -1 : (_vm.no_multi_cpa)
    },
    on: {
      "__c": function($event) {
        var $$a = _vm.no_multi_cpa,
          $$el = $event.target,
          $$c = $$el.checked ? (true) : (false);
        if (Array.isArray($$a)) {
          var $$v = null,
            $$i = _vm._i($$a, $$v);
          if ($$el.checked) {
            $$i < 0 && (_vm.no_multi_cpa = $$a.concat($$v))
          } else {
            $$i > -1 && (_vm.no_multi_cpa = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
          }
        } else {
          _vm.no_multi_cpa = $$c
        }
      }
    }
  }), _vm._v(" Treat a file with multiple campaigns as a single campaign")]), _vm._v(" "), _c('label', [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.combine_cpa),
      expression: "combine_cpa"
    }],
    attrs: {
      "type": "checkbox"
    },
    domProps: {
      "checked": Array.isArray(_vm.combine_cpa) ? _vm._i(_vm.combine_cpa, null) > -1 : (_vm.combine_cpa)
    },
    on: {
      "__c": function($event) {
        var $$a = _vm.combine_cpa,
          $$el = $event.target,
          $$c = $$el.checked ? (true) : (false);
        if (Array.isArray($$a)) {
          var $$v = null,
            $$i = _vm._i($$a, $$v);
          if ($$el.checked) {
            $$i < 0 && (_vm.combine_cpa = $$a.concat($$v))
          } else {
            $$i > -1 && (_vm.combine_cpa = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
          }
        } else {
          _vm.combine_cpa = $$c
        }
      }
    }
  }), _vm._v(" Combine multiple file uploads into 1 file for 1 campaign")]), _vm._v(" "), _c('input', {
    ref: "file_new_cpa",
    staticClass: "file",
    attrs: {
      "type": "file",
      "id": "file_cpa_new",
      "accept": ".csv,.xlsx",
      "multiple": ""
    },
    on: {
      "change": _vm.newFileCPA
    }
  }), _vm._v(" "), _vm._m(6), _vm._v(" "), (_vm.file_cpa_new.length) ? _c('ol', {
    staticClass: "list"
  }, _vm._l((_vm.file_cpa_new), function(item) {
    return _c('li', [_vm._v(_vm._s(item.name))])
  })) : _vm._e(), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.uploadCPA
    }
  }, [_vm._v("UPLOAD")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.cpa_client_customer_id),
      expression: "cpa_client_customer_id"
    }],
    staticClass: "full_width",
    attrs: {
      "type": "text",
      "placeholder": "Customer Client ID for your adwords account"
    },
    domProps: {
      "value": (_vm.cpa_client_customer_id)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.cpa_client_customer_id = $event.target.value
      }
    }
  }), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.connectConversionAPI
    }
  }, [_vm._v("Connect API")])]), _vm._v(" "), _c('h2', {
    staticClass: "center"
  }, [_vm._v("OR")]), _vm._v(" "), _c('fieldset', {
    staticClass: "new_campaign"
  }, [_c('legend', [_vm._v(" Old campaign ")]), _vm._v(" "), _c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.old_cpa),
      expression: "old_cpa"
    }],
    staticClass: "full_width",
    on: {
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.old_cpa = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, [_c('option', {
    attrs: {
      "value": "0"
    }
  }, [_vm._v("- Select campaign -")]), _vm._v(" "), _vm._l((_vm.groupsCPA), function(grp) {
    return _c('optgroup', {
      attrs: {
        "label": grp.title || 'NO GROUP'
      }
    }, _vm._l((_vm.sortedCPA(grp)), function(item) {
      return _c('option', {
        domProps: {
          "value": item.id
        }
      }, [_vm._v(_vm._s(item.title))])
    }))
  })], 2), _vm._v(" "), _c('input', {
    ref: "file_old_cpa",
    staticClass: "file",
    attrs: {
      "type": "file",
      "id": "file_cpa_old",
      "accept": ".csv,.xlsx"
    },
    on: {
      "change": _vm.oldFileCPA
    }
  }), _vm._v(" "), _vm._m(7), _vm._v(" "), (_vm.file_cpa_old.length) ? _c('ol', {
    staticClass: "list"
  }, _vm._l((_vm.file_cpa_old), function(item) {
    return _c('li', [_vm._v(_vm._s(item.name))])
  })) : _vm._e(), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.appendCPA
    }
  }, [_vm._v("Append to existing data")]), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.updateCPA
    }
  }, [_vm._v("Update existing data")]), _vm._v(" "), _c('button', {
    staticClass: "btn-login block top_space",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.replaceCPA
    }
  }, [_vm._v("Replace existing data")])])]) : _vm._e()])], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('h2', {
    staticClass: "panel_title"
  }, [_vm._v("Importing "), _c('strong', [_vm._v("Revenue")]), _vm._v(" data")])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "help"
  }, [_vm._v("\n        Only "), _c('strong', [_vm._v("CSV")]), _vm._v(" and "), _c('strong', [_vm._v("XLSX")]), _vm._v(" files are supported."), _c('br'), _vm._v("\n        Header is "), _c('u', [_vm._v("optional")]), _vm._v(". All "), _c('u', [_vm._v("non-empty")]), _vm._v(" sheets will be processed."), _c('br'), _vm._v("\n        Cost and Revenue must "), _c('u', [_vm._v("not")]), _vm._v(" contain currency."), _c('br'), _vm._v("\n        The first "), _c('strong', [_vm._v("3")]), _vm._v(" columns for files containing "), _c('strong', [_vm._v("1 campaign")]), _vm._v(" must be:"), _c('br'), _vm._v(" "), _c('span', {
    staticClass: "bg_cols"
  }, [_vm._v("Day | Cost | Revenue")]), _vm._v(" - in this order. "), _c('a', {
    staticClass: "example_file",
    attrs: {
      "href": "Revenue_for_a_single_campaign.xlsx"
    }
  }, [_vm._v("Example")]), _c('br'), _vm._v("\n        The first "), _c('strong', [_vm._v("4")]), _vm._v(" columns for files containing "), _c('strong', [_vm._v("several campaigns")]), _vm._v(" must be:"), _c('br'), _vm._v(" "), _c('span', {
    staticClass: "bg_cols"
  }, [_vm._v("Day | Campaign Name | Cost | Revenue")]), _vm._v(" - in this order. "), _c('a', {
    staticClass: "example_file",
    attrs: {
      "href": "Revenue_for_several_campaigns.xlsx"
    }
  }, [_vm._v("Example")]), _c('br'), _vm._v(" "), _c('strong', [_vm._v("Append")]), _vm._v(" = old data isn't touched, new data is added"), _c('br'), _vm._v(" "), _c('strong', [_vm._v("Update")]), _vm._v(" = old data is updated, new data is added"), _c('br'), _vm._v(" "), _c('strong', [_vm._v("Replace")]), _vm._v(" = old data is removed, new data is added"), _c('br')])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "center"
  }, [_c('label', {
    staticClass: "file full_width",
    attrs: {
      "for": "file_roi_new"
    }
  }, [_vm._v("Choose file(s)")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "center"
  }, [_c('label', {
    staticClass: "file full_width",
    attrs: {
      "for": "file_roi_old"
    }
  }, [_vm._v("Choose a file")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('h2', {
    staticClass: "panel_title"
  }, [_vm._v("Importing "), _c('strong', [_vm._v("Conversion")]), _vm._v(" data")])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "help"
  }, [_vm._v("\n        Only "), _c('strong', [_vm._v("CSV")]), _vm._v(" and "), _c('strong', [_vm._v("XLSX")]), _vm._v(" files are supported."), _c('br'), _vm._v("\n        Header is "), _c('u', [_vm._v("optional")]), _vm._v(". All "), _c('u', [_vm._v("non-empty")]), _vm._v(" sheets will be processed."), _c('br'), _vm._v("\n        Cost must "), _c('u', [_vm._v("not")]), _vm._v(" contain currency."), _c('br'), _vm._v("\n        The first "), _c('strong', [_vm._v("3")]), _vm._v(" columns for files containing "), _c('strong', [_vm._v("1 campaign")]), _vm._v(" must be:"), _c('br'), _vm._v(" "), _c('span', {
    staticClass: "bg_cols"
  }, [_vm._v("Day | Cost | Conversions")]), _vm._v(" - in this order. "), _c('a', {
    staticClass: "example_file",
    attrs: {
      "href": "Conversions_for_a_single_campaign.xlsx"
    }
  }, [_vm._v("Example")]), _c('br'), _vm._v("\n        The first "), _c('strong', [_vm._v("4")]), _vm._v(" columns for files containing "), _c('strong', [_vm._v("several campaigns")]), _vm._v(" must be:"), _c('br'), _vm._v(" "), _c('span', {
    staticClass: "bg_cols"
  }, [_vm._v("Day | Campaign Name | Cost | Conversions")]), _vm._v(" - in this order. "), _c('a', {
    staticClass: "example_file",
    attrs: {
      "href": "Conversions_for_several_campaigns.xlsx"
    }
  }, [_vm._v("Example")]), _c('br'), _vm._v(" "), _c('strong', [_vm._v("Append")]), _vm._v(" = old data isn't touched, new data is added"), _c('br'), _vm._v(" "), _c('strong', [_vm._v("Update")]), _vm._v(" = old data is updated, new data is added"), _c('br'), _vm._v(" "), _c('strong', [_vm._v("Replace")]), _vm._v(" = old data is removed, new data is added"), _c('br')])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "center"
  }, [_c('label', {
    staticClass: "file full_width",
    attrs: {
      "for": "file_cpa_new"
    }
  }, [_vm._v("Choose file(s)")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "center"
  }, [_c('label', {
    staticClass: "file full_width",
    attrs: {
      "for": "file_cpa_old"
    }
  }, [_vm._v("Choose a file")])])
}]}

/***/ }),
/* 123 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('div', {
    staticClass: "privacy"
  }, [_c('h1', [_vm._v("Privacy Notice")]), _vm._v(" "), _vm._m(0), _vm._v(" "), _c('h2', [_vm._v("Information Collection, Use, and Sharing")]), _vm._v(" "), _c('p', [_vm._v("We are the sole owners of the information collected on this site. We only have access to/collect information that you voluntarily give us via email or other direct contact from you. We will not sell or rent this information to anyone.")]), _vm._v(" "), _c('p', [_vm._v("\n      We will use your information to respond to you, regarding the reason you contacted us. We will not share your information with any third party outside of our organization, other than as necessary to fulfill your request, e.g. to ship an order.\n    ")]), _vm._v(" "), _c('p', [_vm._v("\n      Unless you ask us not to, we may contact you via email in the future to tell you about specials, new products or services, or changes to this privacy policy.\n    ")]), _vm._v(" "), _c('h2', [_vm._v("Your Access to and Control Over Information")]), _vm._v(" "), _c('div', [_vm._v("\n      You may opt out of any future contacts from us at any time. You can do the following at any time by contacting us via the "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": '#/' + (_vm.$root.is_loged ? 'support' : 'contact')
    }
  }, [_vm._v("our contact form")]), _vm._v(":\n      "), _vm._m(1)]), _vm._v(" "), _c('h2', [_vm._v("Registration")]), _vm._v(" "), _c('p', [_vm._v("In order to use this website, a user must first complete the registration form. During registration a user is required to give certain information (such as name and email address, and optionally the industry).\n      This information is used exclusively to separate and isolate your campaigns from the campaigns of the other customers.")]), _vm._v(" "), _c('h2', [_vm._v("Security")]), _vm._v(" "), _c('p', [_vm._v("\n      We take precautions to protect your information. When you submit sensitive information via the website, your information is protected both online and offline.\n    ")]), _vm._v(" "), _c('p', [_vm._v("\n      We never ask you for sensitive information such as credit card data - we rely on 3rd party payment processors gateways. This website uses HTTPS encrypted connections. You can verify this by looking for a lock icon in the address bar and looking for \"https\" at the beginning of the address of the Web page.\n    ")]), _vm._v(" "), _c('h2', [_vm._v("If you feel that we are not abiding by this privacy policy, you should contact us immediately via "), _c('a', {
    staticClass: "link",
    attrs: {
      "href": '#/' + (_vm.$root.is_loged ? 'support' : 'contact')
    }
  }, [_vm._v("our contact form")]), _vm._v(".")])])])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_vm._v("\n      This privacy notice applies solely to information collected by this website. It will notify you of the following:\n      "), _c('ol', [_c('li', [_vm._v("What personally identifiable information is collected from you through the website, how it is used and with whom it may be shared.")]), _vm._v(" "), _c('li', [_vm._v("What choices are available to you regarding the use of your data.")]), _vm._v(" "), _c('li', [_vm._v("The security procedures in place to protect the misuse of your information.")]), _vm._v(" "), _c('li', [_vm._v("How you can correct any inaccuracies in the information.")])])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('ul', [_c('li', [_vm._v("See what data we have about you, if any.")]), _vm._v(" "), _c('li', [_vm._v("Change/correct any data we have about you.")]), _vm._v(" "), _c('li', [_vm._v("Have us delete any data we have about you.")]), _vm._v(" "), _c('li', [_vm._v("Express any concern you have about our use of your data.")])])
}]}

/***/ }),
/* 124 */,
/* 125 */,
/* 126 */
/***/ (function(module, exports) {

module.exports = [{"id":5311,"kind":1,"title":"FC-Revenue","points":[[565.7400000000002,2213.5],[603.05,5575.2],[776.26,6373.599999999999],[738.7700000000002,6261.5],[1400.5300000000007,14218.3],[164.08,1165.3],[1263.1000000000001,818.2],[1323.23,5486.1],[922.4200000000001,1795.01],[1251.39,9440.62],[296.4399999999998,340.860000000001],[563.7799999999997,7956.09],[1533.46,12923.36],[1396.31,12917.94],[984.6099999999999,5472.87],[1352.8100000000002,10580.179999999997],[629.1400000000003,3359.339999999998],[1393.73,10490.27],[1538.6699999999998,7540.399999999998],[1254.6299999999997,3949.1],[1518.3200000000002,15076.699999999999],[1103.8799999999999,9087.84],[1351.55,12038.02],[641.94,7238.289999999998],[1278.0299999999997,11858.17],[1437.1700000000003,12985.02],[1408.3800000000003,7122.69],[1177.7099999999998,5273.46],[985.1000000000003,4115.6900000000005],[1198.5100000000002,7902.539999999998],[1243.7999999999997,6931.179999999998],[1249.18,9911.81],[1147.51,3526.55],[1329.8099999999997,10461.709999999997],[1324.34,13258.64],[953.27,9737.179999999998],[1042.5300000000002,8710.21],[906.42,4468.96],[1439.9500000000007,5109.58],[1134.2099999999998,4426.53],[1158.8800000000003,9747.15],[1285.4599999999994,11412.66],[977.270000000001,7137.999999999999]]}]

/***/ })
],[56]);