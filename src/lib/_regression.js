// 
// Modified by Ivaylo Gelov to fit the project requirements

/**
* Determine the coefficient of determination (r^2) of a fit from the observations
* and predictions.
*
* @param {Array<Array<number>>} data - Pairs of observed x-y values
* @param {Array<Array<number>>} results - Pairs of observed predicted x-y values
*
* @return {number} - The r^2 value, or NaN if one cannot be calculated.
*/
function determinationCoefficient(data, results) 
{
  const predictions = [];
  const observations = [];

  data.forEach((d, i) => 
  {
    if (d[1] !== null) 
    {
      observations.push(d);
      predictions.push(results[i]);
    }
  });

  const sum = observations.reduce((a, observation) => a + observation[1], 0);
  const mean = sum / observations.length;

  const ssyy = observations.reduce((a, observation) => 
  {
    const difference = observation[1] - mean;
    return a + (difference * difference);
  }, 0);

  const sse = observations.reduce((accum, observation, index) => 
  {
    const prediction = predictions[index];
    const residual = observation[1] - prediction[1];
    return accum + (residual * residual);
  }, 0);

  return 1 - (sse / ssyy);
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
function round(number, precision = 2) 
{
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}


/**
* The set of all fitting methods
*
* @namespace
*/
export default 
{
  logarithmic(data, options) 
  {
    const sum = [0, 0, 0, 0];
    const len = data.length;
    let cnt = 0;

    for (let n = 0; n < len; n++) 
    {
      if (data[n][1] !== null) 
      {
			  if(data[n][0]==0)	sum[2] += data[n][1]; // IVO GELOV - prevent Log(0)
			  else
			  {
			    let t = Math.log(data[n][0]);
			    cnt++;
  			  sum[0] += t;
          sum[1] += data[n][1] * t;
          sum[2] += data[n][1];
          sum[3] += (t * t);
        }
      }
    }

    const a = (cnt * sum[1] - sum[2] * sum[0]) / (cnt * sum[3] - sum[0] * sum[0]);
    const coeffB = a;
    const coeffA = (sum[2] - coeffB * sum[0]) / cnt

    const predict = x => (
    [
      Math.max(0,x), // IVO GELOV
      Math.max(0,coeffA + coeffB * Math.log(x)), // IVO GELOV
    ]);

    const points = data.map(point => predict(point[0]));

    return {
      points,
      predict,
      equation: [coeffA, coeffB],
      string: "Y = " + round(coeffB) + " * Ln(x) " + (coeffA<0 ? "" : "+") + round(coeffA),
      r2: determinationCoefficient(data, points),
    };
  },

}
