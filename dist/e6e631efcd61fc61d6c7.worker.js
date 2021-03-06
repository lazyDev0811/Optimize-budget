/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export DEFAULT_OPTIONS */
/* unused harmony export predict */
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
  }, 0); //************* SStot value *************//

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
  const rmse = sse / observations.length; // const r2 = 1 - observations.length * rmse /ssyy;
  // console.log("first "+(1 - (sse / ssyy))+" sec "+ssresid / ssyy);
  //return ssresid / ssyy;
  // return 1 - (sse / ssyy);

  const r2 = ssresid / ssyy;
  return {
    r2,
    rmse
  }; // return ssresid/ssyy;
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


/* harmony default export */ __webpack_exports__["a"] = ({
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
    console.log(round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision), "r-square");
    return {
      points,
      predict,
      points1,
      equation: [gradient, intercept],
      r2: round(determinationCoefficient(data, points).r2, DEFAULT_OPTIONS.precision),
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision),
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
      r2: round(determinationCoefficient(data, points).r2, DEFAULT_OPTIONS.precision),
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision)
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
      r2: round(determinationCoefficient(data, points).r2, DEFAULT_OPTIONS.precision),
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision)
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
      r2: round(determinationCoefficient(data, points).r2, DEFAULT_OPTIONS.precision),
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision)
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
      r2: round(determinationCoefficient(data, points).r2, DEFAULT_OPTIONS.precision),
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision)
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
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_regression__ = __webpack_require__(0);


// Setup an event listener that will handle messages sent to the worker.
self.addEventListener('message', function(e)
{
  console.log(e);
  if(e.data && e.data.cmd) switch(e.data.cmd)
  {
    case 1: // regression of combined data
      console.log("1")
      setTimeout(function()
      {
        combined(e.data);
      },20);
      break;
    case 2: // regressions of individual campaigns
      console.log("2")
      setTimeout(function()
      {
        individual(e.data);
      },20);
      break;
  }
}, false);

let
  auto_reg = 0; // index into "regressions" with the largest confidence

function combined(data)
{
  do_regress(data.regression,data.param,data.outliers);
  self.postMessage(data);
}

function individual(data)
{
  let i;
  for(i=0;i<data.param.length;i++) do_regress(data.regression,data.param[i],data.outliers);
  self.postMessage(data);
}

function do_regress(reg_type,campaign,outliers)
{
  if(outliers)
  {

    // remove the outliers

    if(campaign.points.length > 0){
        // remove the outliers
        campaign.points.sort(function(a,b)
        {
          let c = a[1] - b[1];
          if(c==0) c = a[0] - b[0];
          return c;
        });
        // find median, 1st and 3rd quartiles - http://www.mathwords.com/f/first_quartile.htm
        let pts = campaign.points, leng = pts.length, len1 = Math.floor(leng/4), len3 = Math.floor(leng*3/4),
          lenh = Math.round(leng/2), leng2= Math.floor(leng/4),
            q1 = 0, q2 = 0, iqr = 0;

            if(leng % 4 == 0){
              q1 = (pts[len1][1] + pts[len1-1][1]) / 2;
              q2 = (pts[len3][1] + pts[len3-1][1]) / 2;
            }
            else if(leng % 4 == 1){
              q1 = (pts[len1][1]);
              
              if(leng > 5){
                q2 = (pts[len3][1] + pts[len3+1][1]) / 2;
              }else{
                q2 = pts[len3][1];
              }
              
            } 
            else if(leng % 4 == 2 || leng % 4 == 3){
              q1 = (pts[len1][1]);
              q2 = (pts[len1+lenh][1]);
            }
            
            iqr = (q2 - q1) * 1.5;
            console.log(campaign.points, "this is a outliter points")
        // remove any point below "q1 - iqr" or above "q2 + iqr"
        campaign.points = campaign.points.filter(function(item)
        {
          return item[1] >= q1 - iqr && item[1] <= q2 + iqr;
        });
    }
  }
  // find regression
  campaign.regressions = new Array(6);
  if(reg_type && reg_type>0)
  {
    // specific regression method
    auto_reg = reg_type;
    switch(reg_type)
    {
      case 1: // linear
        campaign.regressions[1] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].linear(campaign.points);
        console.log("linear");
        break;
      case 2: // exponential
        campaign.regressions[2] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].exponential(campaign.points);
        break;
      default:
        auto_reg = 3;
      case 3: // logarithmic
        campaign.regressions[3] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].logarithmic(campaign.points);
        break;
      case 4: // polynomial
        campaign.regressions[4] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].polynomial(campaign.points);
        break;
      case 5: // power
        campaign.regressions[5] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].power(campaign.points);
        break;
    }
  }
  else
  {
    // best auto-fit
    console.log("worst linear")
    campaign.regressions[1] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].linear(campaign.points);
    campaign.regressions[2] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].exponential(campaign.points);
    campaign.regressions[3] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].logarithmic(campaign.points);
    campaign.regressions[4] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].polynomial(campaign.points);
    campaign.regressions[5] = __WEBPACK_IMPORTED_MODULE_0__lib_regression__["a" /* default */].power(campaign.points);
    let confidence = 0, i, len = campaign.regressions.length;
    for(i=1;i<len;i++)
      if(!isNaN(campaign.regressions[i].r2) && campaign.regressions[i].r2 > confidence)
      {
        auto_reg = i;
        confidence = campaign.regressions[i].r2;
      }
  }
  campaign.regressions[0] = campaign.regressions[auto_reg];
  campaign.best_fit = auto_reg;
  // remove the un-clonable functions predict()
  let i, len = campaign.regressions.length;
  for(i=0;i<len;i++) if(campaign.regressions[i]) campaign.regressions[i].predict = null;
  // add properties which will be populated later by the AMPL solver
  campaign.improve = 0;
  campaign.min_cost = 0;
  campaign.max_cost = 0;
  campaign.optimal_cost = 0;
}


/***/ })
/******/ ]);