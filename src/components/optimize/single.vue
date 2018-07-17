<template>
  <div class="op_main">
    <div class="op_title help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
      <h2 class="op_header" :title="campaign.title" >{{ campaign.title }}<img src="~@/img/help.svg"/></h2>
    </div>
    <div :id="'graph'+_uid" class="graph_panel"></div>
    <div class="top_space help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
      Regression formula: <strong class="code">{{ regression.string }}</strong>
      <img src="~@/img/help.svg"/>
    </div>
    <div class="top_space">
      Confidence of regression: <span :class="{r_low: regression.r2 < 0.1}"><strong class="code">R<span class="super">2</span> = {{ regression.r2 | filterNum }}</strong></span>&nbsp; ({{ campaign.points.length }} pts)
    </div>
    <div class="top_space">
      Kind of regression: <strong class="code">{{ reg_names[type_reg ? type_reg : campaign.best_fit] }}</strong>
    </div>
    <hr size="2" width="100%" color="#70AD47"/>
    <div class="full_width center help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
      Your optimal result for this campaign is:
      <img src="~@/img/help.svg"/>
    </div>
    <table align="center">
      <tr>
        <td align="right">Cost/day</td>
        <td align="center"><div class="const_field">{{ optimal_cost | filterNum }}</div></td>
      </tr>
      <tr>
        <td align="right">{{ text_kind }}</td>
        <td align="center"><div class="const_field">{{ optimal_value | filterNum }}</div></td>
      </tr>
      <tr>
        <td align="right">{{ optimal_text }}</td>
        <td align="center"><div class="const_field">{{ optimum | filterNum }}{{ kind==1 ? '%' : '' }}</div></td>
      </tr>
    </table>
    <hr size="2" width="100%" color="#70AD47"/>
    <div class="center full_width help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
      Calculate your projected &nbsp;<strong>{{ optimal_text }}</strong>&nbsp; at different cost:
      <img src="~@/img/help.svg"/>
    </div>
    <table align="center">
      <tr>
        <td align="right">Input:<br/>cost/day</td>
        <td><input type="number" class="num_field" v-model="var_cost" onClick="this.select()"/></td>
      </tr>
      <tr>
        <td align="right">Output:<br/>Projected {{ text_kind }}</td>
        <td align="center"><div class="const_field">{{ projected_value(var_cost) | filterNum }}</div></td>
      </tr>
      <tr>
        <td align="right">Output:<br/>Projected {{ optimal_text }}</td>
        <td align="center"><div class="const_field">{{ projected_roi(var_cost,projected_value(var_cost)) | filterNum }}{{ kind==1 ? '%' : '' }}</div></td>
      </tr>
    </table>
    <div class="slider_panel">
      <input type="range" min="0" max="5000" step="0.01" v-model="var_cost" class="slider no_bord"/>
    </div>
  </div>
</template>

<script>
import Highcharts from 'highcharts'
import { predict } from '@/lib/regression'
import { round } from '@/tool/util'
require('@/css/range.scss');
require('@/css/tooltip.css');

export default
{
  props:
    {
      campaign:
        {
          type: Object
        },
      kind: // 1 = ROI, 2 = CPA
        {
          type: Number,
          default: 1
        },
      type_reg:
        {
          type: Number
        },
      reg_names:
        {
          type: Array
        }
    },
  data: function()
  {
    var a =
      {
        chart: null,
        optimal_cost: 0,
        optimal_value: 0, // either Revenue or Conversions
        optimum: 0, // either ROI or CPA
        optimal_result: '', // used by the Legend
        var_cost: 0,
      };
    return a;
  },
  mounted: function ()
  {
    this.initChart();
  },
  watch:
    {
      'campaign': 'initChart',
      'type_reg': 'initChart'
    },
  filters:
    {
      filterNum: function (num)
      {
        if(num==null || isNaN(num)) return 0;
        return round(num);
      }
    },
  computed:
    {
      reg_type: function()
      {
        return this.type_reg ? this.type_reg : this.campaign.best_fit;
      },
      regression: function()
      {
        return this.campaign.regressions[this.reg_type];
      },
      text_kind: function ()
      {
        return (this.kind==1 ? 'Revenue' : 'Conversions');
      },
      optimal_text: function ()
      {
        return (this.kind==1 ? 'Max ROI' : 'Min CPA');
      },
      max_value: function()
      {
        // compute the cost for the max ROI or max CPA - using the predicted values from regression
        var i, p, cost = 0, max_v = 0, tmp, points = this.regression.points, len = points.length;
        if(this.kind==1)
          for(i=0;i<len;i++)
          {
            p = points[i];
            tmp = p[1] - p[0];
            if(tmp > max_v)
            {
              max_v = tmp;
              cost = p[0];
            }
          }
        else
          for(i=0;i<len;i++)
          {
            p = points[i];
            if(p[1] > max_v)
            {
              max_v = p[1];
              cost = p[0];
            }
          }
        return cost;
        /*
        var v = 0;
        // compute the cost for the max ROI or max CPA - by differentiating the regression equation
        switch(this.reg_type)
        {
          case 1: // linear
            v = Math.max.apply(null,this.campaign.points.map(function(item)
            {
              return item[0];
            }));
            break;
          case 2: // exponential
            v = (this.regression.equation[1] ? 1 / this.regression.equation[1] : 0);
            break;
          case 3: // logarithmic
            v = (this.regression.equation[1] ? Math.exp(1 - this.regression.equation[0]/this.regression.equation[1]) : 0);
            break;
          case 4: // polynomial
            break;
          case 5: // power
            v = Math.min.apply(null,this.campaign.points.map(function(item)
            {
              return item[0];
            }));
            break;
        }
        return v;
        */
      },
    },
  methods:
    {
      projected_value: function (cost)
      {
        return Math.min(predict(cost,this.reg_type,this.regression.equation), 10000);
      },
      projected_optimal: function (cost)
      {
        return this.projected_roi(cost,this.projected_value(cost));
      },
      projected_roi: function(cost,revenue)
      {
        return (this.kind==1 ? (cost ? 100*(revenue - cost)/cost : 0) : (revenue ? cost / revenue : 0));
      },
      optimal_regress: function()
      {
        this.optimal_cost = Math.min(this.max_value, 10000);
        this.optimal_value = this.projected_value(this.optimal_cost);
        this.optimum = Math.round(100 * this.projected_roi(this.optimal_cost,this.optimal_value))/100;
        if(this.kind==1)
        {
          // the cost with maximum ROI
          this.optimal_result = (this.optimum < 0 ? '<span style="color:red">' + this.optimum + '</span>' : this.optimum) + '% (' + this.optimal_cost.toFixed(2) + '/' + this.optimal_value.toFixed(2) + ')';
        }
        else
        {
          // the cost with minimum CPA
          this.optimal_result = this.optimum + ' (' + this.optimal_cost.toFixed(2) + '/' + this.optimal_value.toFixed(2) + ')';
        }
      },
      initChart: function ()
      {
        this.optimal_regress();
        var reg_data = this.regression.points.sort(function (a,b)
        {
          return a[0] - b[0];
        }).map(function(item)
        {
          if(item[1]<0) item[1] = 0;
          return item;
        });
        if(this.chart!=null) this.chart = null;
        Highcharts.setOptions(
          {
            lang:
              {
                thousandsSep: ''
              }
          }
        );
        this.chart = Highcharts.chart(
          {
            chart:
            {
              renderTo: 'graph'+this._uid,
              type: 'scatter',
              zoomType: 'xy'
            },
            title:
            {
              text: 'Regression Cost vs '+this.text_kind
            },
            xAxis:
            {
              min: 0,
              ceiling: 10000,
              title:
              {
                enabled: true,
                text: 'Cost'
              },
              startOnTick: true,
              endOnTick: true,
              showLastLabel: true
            },
            yAxis:
            {
              title:
              {
                text: this.text_kind
              }
            },
            legend:
            {
              layout: 'vertical',
              align: 'left',
              verticalAlign: 'top',
              x: 90,
              y: 60,
              floating: true,
              backgroundColor: '#FFFFFF',
              borderWidth: 1
            },
            plotOptions:
            {
              scatter:
              {
                marker:
                {
                  radius: 3,
                  lineColor: "#0000ff",
                  states:
                  {
                    hover:
                    {
                      enabled: true,
                      lineColor: '#0000ff'
                    }
                  }
                },
                states:
                {
                  hover:
                  {
                    marker:
                    {
                      enabled: false
                    }
                  }
                },
                tooltip:
                {
                  headerFormat: '<b>{series.name}</b><br>',
                  pointFormat: '{point.x}, {point.y}'
                }
              },
              series:
                {
                  animation: false
                }
            },
            series:
            [
              {
                name: 'Day (Cost, ' + this.text_kind + ')',
                color: 'rgba(223, 83, 83, .5)',
                data: this.campaign.points
              },
              {
                data: reg_data,
                color: 'rgba(40, 100, 255, .9)',
                lineWidth: 2,
                type: 'line',
                dashStyle: 'solid',
                marker:
                  {
                    enabled: false
                  },
                name: this.equation + '<br/>R<span style="dominant-baseline: ideographic; font-size: 8pt;">2</span> = '
                      + round(isNaN(this.regression.r2) ? 0 : this.regression.r2),
                showInLegend: false
              },
              {
                data:
                [
                  [this.optimal_cost,0],
                  [this.optimal_cost,this.optimal_value * 2]
                ],
                color: 'rgba(70, 160, 50, .9)',
                lineWidth: 3,
                type: 'line',
                dashStyle: 'solid',
                name: this.optimal_text + ' = ' + this.optimal_result,
                showInLegend: false
              }
            ],
            credits:
            {
              enabled: false
            }
          });
      }
    }
}

</script>

<style>
  .op_main
  {
    display: flex;
    flex-direction: column;
    margin: 10px;
    padding: 12px;
    background-color: #eee;
    min-width: 400px;
  }

  .op_header
  {
    background-color: #259AD6;
    color: white;
    padding: 4px 10px 0;
    margin-top: 0;
    max-height: 2em;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
  }

  .const_field,
  .num_field
  {
    margin: 5px auto;
    display: block;
  }

  .const_field
  {
    min-width: 6rem;
    padding: 6px 10px;
    background-color: #F6B59A;
    border: 1px solid #ED7D31;

  }

  .num_field
  {
    width: 6rem;
    padding: 6px 0 6px 10px;
    background-color: #DEEBF7;
    border: 1px solid #41719C;
  }

  .no_bord
  {
    border: none;
    padding: 0;
    background-color: transparent;
  }

  .super
  {
    vertical-align: super;
    font-size: 8pt;
    margin-left: 2pt;
  }

  .code
  {
    font-family: "Roboto Mono", "Lucida Console", monospace;
    font-size: 0.85rem;
  }

  .slider_panel
  {
    width: 90%;
    margin: 0 auto;
  }

  .r_low
  {
    color: red;
  }

  .help_sign img
  {
    display: inline-block;
    margin-left: 6px;
    width: 20px;
  }

</style>
