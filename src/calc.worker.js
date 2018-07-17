import regress from '@/lib/regression'

// Setup an event listener that will handle messages sent to the worker.
self.addEventListener('message', function(e)
{
  if(e.data && e.data.cmd) switch(e.data.cmd)
  {
    case 1: // regression of combined data
      setTimeout(function()
      {
        combined(e.data);
      },20);
      break;
    case 2: // regressions of individual campaigns
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
    campaign.points.sort(function(a,b)
    {
      let c = a[1] - b[1];
      if(c==0) c = a[0] - b[0];
      return c;
    });
    // find median, 1st and 3rd quartiles - http://www.mathwords.com/f/first_quartile.htm
    let pts = campaign.points, leng = pts.length, len1 = Math.floor(leng/4), len3 = Math.floor(leng*3/4),
        q1 = (leng % 4 ? pts[len1][1] : (pts[len1][1] + pts[len1-1][1])/2),
        q2 = (leng % 4 ? pts[len3][1] : (pts[len3][1] + pts[len3-1][1])/2),
        iqr = (q2 - q1) * 1.5; // inter-quartile range
    // remove any point below "q1 - iqr" or above "q2 + iqr"
    campaign.points = campaign.points.filter(function(item)
    {
      return item[1] >= q1 - iqr && item[1] <= q2 + iqr;
    });
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
        campaign.regressions[1] = regress.linear(campaign.points);
        break;
      case 2: // exponential
        campaign.regressions[2] = regress.exponential(campaign.points);
        break;
      default:
        auto_reg = 3;
      case 3: // logarithmic
        campaign.regressions[3] = regress.logarithmic(campaign.points);
        break;
      case 4: // polynomial
        campaign.regressions[4] = regress.polynomial(campaign.points);
        break;
      case 5: // power
        campaign.regressions[5] = regress.power(campaign.points);
        break;
    }
  }
  else
  {
    // best auto-fit
    campaign.regressions[1] = regress.linear(campaign.points);
    campaign.regressions[2] = regress.exponential(campaign.points);
    campaign.regressions[3] = regress.logarithmic(campaign.points);
    campaign.regressions[4] = regress.polynomial(campaign.points);
    campaign.regressions[5] = regress.power(campaign.points);
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
