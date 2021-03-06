

const DEFAULT_OPTIONS = { order: 2, precision: 2, period: null };

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
    return a + (difference * difference);
  }, 0); //************* SStot value *************//


  const sse = observations.reduce((accum, observation, index) => {
    const prediction = predictions[index];
    const residual = observation[1] - prediction[1];
    return accum + (residual * residual);
  }, 0); //*********** SSres value **************//

  const ssresid = observations.reduce((accum, observation, index) => {
    const prediction = predictions[index];
    const residual = prediction[1] - mean;
    return accum + (residual * residual);
  }, 0);

  const rmse = sse / observations.length;
  // const r2 = 1 - observations.length * rmse /ssyy;
  // console.log("first "+(1 - (sse / ssyy))+" sec "+ssresid / ssyy);
  //return ssresid / ssyy;
  // return 1 - (sse / ssyy);
  const r2 = ssresid/ssyy;
 return {r2, rmse};
 // return ssresid/ssyy;
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
        matrix[k][j] -= (matrix[k][i] * matrix[i][j]) / matrix[i][i];
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
export default {
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

    const run = ((len * sum[2]) - (sum[0] * sum[0]));
    const rise = ((len * sum[3]) - (sum[0] * sum[1]));
    const gradient = run === 0 ? 0 : round(rise / run, DEFAULT_OPTIONS.precision);
    const intercept = round((sum[1] / len) - ((gradient * sum[0]) / len), DEFAULT_OPTIONS.precision);

    const predict = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round((gradient * x) + intercept, DEFAULT_OPTIONS.precision)]
    );

    const points = data.map(point => predict(point[0]));

    const predict1 = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round(x/((gradient * x) + intercept), DEFAULT_OPTIONS.precision)]
    );

    const points1 = data.map(point => predict1(point[0]));
    console.log(round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision), "r-square")
    return {
      points,
      predict,
      points1,
      equation: [gradient, intercept],
      r2: round(determinationCoefficient(data, points).r2, DEFAULT_OPTIONS.precision),
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision),
      string: intercept === 0 ? `Y = ${gradient} * X` : `Y = ${gradient} * X` + (intercept<0 ? ' ' : ' + ') + `${intercept}`,
      string1: intercept === 0 ? `Y = X / ${gradient} * X` : `Y = X / (${gradient} * X` + (intercept<0 ? ' ' : ' + ') + `${intercept})`,
      string2: intercept === 0 ? `Y =  ${gradient - 1} * X / X` : `Y =  (${gradient - 1} * X` + (intercept<0 ? ' ' : ' + ') + `${intercept}) / X`,
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
    const intercept = (poly[1] * poly[3] - poly[0] * poly[2]) / (len * poly[3] - poly[0] * poly[0]);
    // const b1 = round(Math.exp(m), DEFAULT_OPTIONS.precision);
    // const a1 = round(Math.exp(intercept), DEFAULT_OPTIONS.precision);
    const b1 = round(m, DEFAULT_OPTIONS.precision);
    const a1 = round(Math.exp(intercept), DEFAULT_OPTIONS.precision);

    const denominator = ((sum[1] * sum[2]) - (sum[5] * sum[5]));
    const a = Math.exp(((sum[2] * sum[3]) - (sum[5] * sum[4])) / denominator);
    const b = ((sum[1] * sum[4]) - (sum[5] * sum[3])) / denominator;
    const coeffA = round(a, DEFAULT_OPTIONS.precision);
    const coeffB = round(b, DEFAULT_OPTIONS.precision);

    // console.log("first "+coeffA+" "+coeffB+" second "+a1+" "+b1);
    // const predict = x => ([
    //   round(x, DEFAULT_OPTIONS.precision),
    //   round(a1 * Math.pow(b1, x), DEFAULT_OPTIONS.precision),
    // ]);
    // const predict = x => ([
    //   round(x, DEFAULT_OPTIONS.precision),
    //   round(a1 * Math.exp(b1 * x), DEFAULT_OPTIONS.precision),
    // ]);
    const predict = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round(coeffA * Math.exp(coeffB * x), DEFAULT_OPTIONS.precision),
    ]);
    // const predict = x => ([
    //   round(x, DEFAULT_OPTIONS.precision),
    //   round(a1 * Math.exp(b1 * x), DEFAULT_OPTIONS.precision),
    // ]);

    const points = data.map(point => predict(point[0]));

    const predict1 = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round(x/(coeffA * Math.exp(coeffB * x)), DEFAULT_OPTIONS.precision),
    ]);

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
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision),
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
        sum[3] += (Math.log(data[n][0]) ** 2);
      }
    }

    const a = ((len * sum[1]) - (sum[2] * sum[0])) / ((len * sum[3]) - (sum[0] * sum[0]));
    const coeffB = round(a, DEFAULT_OPTIONS.precision);
    const coeffA = round((sum[2] - (coeffB * sum[0])) / len, DEFAULT_OPTIONS.precision);

    const predict = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round(round(coeffA + (coeffB * Math.log(x)), DEFAULT_OPTIONS.precision), DEFAULT_OPTIONS.precision),
    ]);

    const points = data.map(point => predict(point[0]));

    const predict1 = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round(round(x/(coeffA + (coeffB * Math.log(x))), DEFAULT_OPTIONS.precision), DEFAULT_OPTIONS.precision),
    ]);

    const points1 = data.map(point => predict1(point[0]));

    return {
      points,
      predict,
      points1,
      equation: [coeffA, coeffB],
      string: `Y = ${coeffB} * Ln(X)` + (coeffA<0 ? ' ' : ' + ') + `${coeffA}`,
      string1: `Y = X / (${coeffB} * Ln(X)` + (coeffA<0 ? ' ' : ' + ') + `${coeffA})`,
      string2: `Y = (${coeffB} * Ln(X)` + ' - X ' + (coeffA<0 ? ' ' : ' + ') + `${coeffA}) / X`,
      r2: round(determinationCoefficient(data, points).r2, DEFAULT_OPTIONS.precision),
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision),
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
        sum[3] += (Math.log(data[n][0]) ** 2);
      }
    }

    const b = ((len * sum[1]) - (sum[0] * sum[2])) / ((len * sum[3]) - (sum[0] ** 2));
    const a = ((sum[2] - (b * sum[0])) / len);
    const coeffA = round(Math.exp(a), DEFAULT_OPTIONS.precision);
    const coeffB = round(b, DEFAULT_OPTIONS.precision);

    const predict = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round(round(coeffA * (x ** coeffB), DEFAULT_OPTIONS.precision), DEFAULT_OPTIONS.precision),
    ]);

    const points = data.map(point => predict(point[0]));

    const predict1 = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round(round(x/(coeffA * (x ** coeffB)), DEFAULT_OPTIONS.precision), DEFAULT_OPTIONS.precision),
    ]);

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
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision),
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
          a += (data[l][0] ** i) * data[l][1];
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

    const predict = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round(
        coefficients.reduce((sum, coeff, power) => sum + (coeff * (x ** power)), 0),
        DEFAULT_OPTIONS.precision,
      ),
    ]);

    const points = data.map(point => predict(point[0]));

    const predict1 = x => ([
      round(x, DEFAULT_OPTIONS.precision),
      round(
        x/(coefficients.reduce((sum, coeff, power) => sum + (coeff * (x ** power)), 0)),
        DEFAULT_OPTIONS.precision,
      ),
    ]);

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
        string1 += coefficients[i]+')';
      }
    }

    let string2 = 'Y = (';
    for (let i = coefficients.length - 1; i >= 0; i--) {
      if (i > 1) {
        string2 += `${coefficients[i]} * X ^ ${i} + `;
      } else if (i === 1) {
        string2 += `${coefficients[i] - 1} * X + `;
      } else {
        string2 += coefficients[i]+') / X';
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
      rmse: round(determinationCoefficient(data, points).rmse, DEFAULT_OPTIONS.precision),
    };
  },
};

export { DEFAULT_OPTIONS };

export function predict(cost,reg_kind,reg_coef)
{
  if(cost<=0) return 0;
  let t = 0;
  switch(reg_kind)
  {
    case 1: // linear
      t = cost * reg_coef[0] + reg_coef[1];
      break;
    case 2: // exponential
      t = reg_coef[0] * Math.exp(cost * reg_coef[1]);
      break;
    case 3: // logarithmic
      t = reg_coef[0] + reg_coef[1] * Math.log(cost);
      break;
    case 4: // polynomial
      t = reg_coef.reverse().reduce((sum, coeff, power) => sum + coeff * Math.pow(cost, power), 0);
      break;
    case 5: // power
      t = reg_coef[0] * Math.pow(cost,reg_coef[1]);
      break;
  }
  return t <= 0 ? 0 : t;
}
