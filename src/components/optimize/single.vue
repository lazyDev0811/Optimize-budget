<template>
  <div class="op_main">
    <div class="op_detail">
        <div class="op_top">
          <table align="center" class="collap_data">
            <tr>
              <td align="center"></td>
              <td align="center">Cost/day</td>
              <td></td>
              <td align="center">Conversions</td>
              <td align="center">CPA</td>
            </tr>
            <tr>
              <td align="center"><div class="full_width center help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
              Your optimal result for this campaign is:
              <img src="~@/img/help.svg"/>
                </div>
              </td>
              <td align="center"><div class="const_field">{{ optimal_cost | filterNum }}</div></td>
              <td>
                <div class="item_content"><button class="btn btn_dark btn-shadow" style="padding: 3px 6px 4px" v-on:click="moveGreenLine()">
                <svg width="16px" height="22px" viewBox="0 0 16 22" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fff" d="M8,3 L8,0 L4,4 L8,8 L8,5 C11.3,5 14,7.7 14,11 C14,12 13.7,13 13.3,13.8 L14.8,15.3
                C15.5,14 16,12.6 16,11 C16,6.6 12.4,3 8,3 L8,3 Z M8,17 C4.7,17 2,14.3 2,11 C2,10 2.3,9 2.7,8.2 L1.2,6.7
                C0.5,8 0,9.4 0,11 C0,15.4 3.6,19 8,19 L8,22 L12,18 L8,14 L8,17 L8,17 Z"/>
                </svg>
                </button><div class="full_width center help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
                <img style="padding-top: 6px;" src="~@/img/help.svg"/>
                </div></div>
              </td>
              <td align="center"><div class="const_field">{{ optimal_value | filterNum }}</div></td>
              <td align="center"><div class="const_field">{{ optimum | filterNum }}{{ kind==1 ? '%' : '' }}</div></td>
            </tr>
            <tr>
              <td colspan="5">
                <div class="bitLine"></div>
              </td>
            </tr>
            <tr>
              <td align="center"><div class="center full_width help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
                Calculate your projected &nbsp;<strong>{{ optimal_text }}</strong>&nbsp; at different cost:
                <img src="~@/img/help.svg"/>
                </div>
              </td>
              <td align="center"><input type="number" class="num_field" v-model="var_cost" onClick="this.select()"/></td>
              <td></td>
              <td align="center"><div class="const_field">{{ projected_value(var_cost) | filterNum }}</div></td>
              <td align="center"><div class="const_field">{{ projected_roi(var_cost,projected_value(var_cost)) | filterNum }}{{ kind==1 ? '%' : '' }}</div></td>
            </tr>
            <tr>
              <td></td>
              <td colspan="4">
                <div class="slider_panel">
                  <input type="range" min="0" max="5000" step="0.01" v-model="var_cost" class="slider no_bord" v-on:input="setPoint()"/>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="5">
                <div class="bitLine"></div>
              </td>
            </tr>
          </table>
        </div>
    </div>
    <div class="graphs">

      <div class="op_graph">
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
      </div>

      <div class="op_graph second_graph">
          <div class="op_title help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
            <h2 class="op_header" :title="campaign.title" >{{ campaign.title }}<img src="~@/img/help.svg"/></h2>
          </div>
          <div :id="'graph1'+_uid" class="graph_panel"></div>
          <div class="top_space help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
            CPA: <strong class="code">{{ regression.string1 }}</strong>
            <img src="~@/img/help.svg"/>
          </div>
          <div class="top_space">
            Based on: <strong class="code">{{ reg_names[type_reg ? type_reg : campaign.best_fit] }}</strong> regression
          </div>
      </div>

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
        var i, p, cost = 5000, tmp, points = this.regression.points, len = points.length;
          for(i=0;i<len;i++)
          {
            p = points[i];
            if(p[0] > cost)
            {
              cost = p[0];
            }
          }
        cost = Math.min(cost, 10000);
        return cost;
      },
    },
  methods:
    {
      moveGreenLine: function()
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
                name: 'State',
                color: 'blue',
                data: [[this.var_cost*Math.abs(-1),this.projected_value(this.var_cost)]]
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
                  [reg_data[0][0],0],
                  [reg_data[0][0], this.optimal_value * 2]
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
      },
      setPoint: function(){
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
        var reg_data1 = this.regression.points1.sort(function (a,b)
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
                name: 'State',
                color: 'blue',
                data: [[this.var_cost*Math.abs(-1),this.projected_value(this.var_cost)]]
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
        this.chart = Highcharts.chart(
          {
            chart:
            {
              renderTo: 'graph1'+this._uid,
              type: 'scatter',
              zoomType: 'xy'
            },
            title:
            {
              text: 'CPA vs Conversion'
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
                text: 'CPA'
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
                name: 'State',
                color: 'blue',
                data: [[this.var_cost*Math.abs(-1), this.var_cost/this.projected_value(this.var_cost)]]
              },
              {
                data: reg_data1,
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
              }
            ],
            credits:
            {
              enabled: false
            }
          });
      },
      projected_value: function (cost)
      {
        //this.changeString();
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
        // this.optimal_cost = Math.min(this.max_value, 10000);
        // this.optimal_value = this.projected_value(this.optimal_cost);
        // this.optimum = Math.round(100 * this.projected_roi(this.optimal_cost,this.optimal_value))/100;
        var optimum = 1000000, optimal_cost = 0, tmp;
        if(this.kind == 1) optimum = 0;
        for(var v_cost=0; v_cost<=this.max_value ; v_cost+=0.01){
          tmp = Math.round(100 * this.projected_roi(v_cost,this.projected_value(v_cost))) / 100;
          if(this.kind == 1){
            if(optimum < tmp) {
              optimum = tmp;
              optimal_cost = v_cost;
            }
          } else if(tmp > 0 && optimum > tmp){
            optimum = tmp;
            optimal_cost = v_cost;
          }
        }

        this.optimum = optimum;
        this.optimal_cost = optimal_cost;
        this.optimal_value = this.projected_value(optimal_cost);
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
        var reg_data1 = this.regression.points1.sort(function (a,b)
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
        this.chart = Highcharts.chart(
          {
            chart:
            {
              renderTo: 'graph1'+this._uid,
              type: 'scatter',
              zoomType: 'xy'
            },
            title:
            {
              text: 'CPA vs Conversion'
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
                text: 'CPA'
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
                data: reg_data1,
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
  .bitLine{
    border: 2px solid #93C47D;
  }

  .graphs{
    width: 100%;
    position: relative;
    display: inline-block;
  }

  .item_content{
    display: inline-flex;
  }

  .op_main
  {
    text-align: -webkit-center;
    display: block;
    margin: 10px;
    padding: 20px;
    min-width: 400px;
    justify-content: space-around;
  }

  .op_graph{
    padding: 12px;
    background-color: #eee;
    width: 50%;
    float: left;
  }

  .second_graph
  {
    padding-bottom: 60px;
  }

  .op_detail{
    margin: auto 0;
  }

  .op_top{
    margin-bottom: 50px;
    padding: 12px;
    background-color: #CFE2F3;
  }

  .op_bottom{
    padding: 12px;
    background-color: #eee;
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

  @media screen and (max-width:1024px)
  {
    .op_main {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .op_graph
    {
      margin-bottom: 50px;
      width: 100%;
      float: unset;
    }
    .graphs
    {
      display: block;
    }
  }

  @media screen and (max-width: 768px)
  {
    .op_graph
    {
      width: 90%;
    }
  }

  @media screen and (max-width: 480px) {
    .op_main
    {
      flex-direction: column;
      margin: 0px;
      min-width: inherit;
    }
    .op_graph
    {
      margin-right: 0px;
    }

    .op_detail
    {
      margin-left: 0px;
    }

    .op_detail .op_top
    {
      margin-bottom: 0px;
    }
    .op_detail .op_top, .op_bottom
    {
      border-top: 3px solid #70AD47;
    }
  }

</style>
