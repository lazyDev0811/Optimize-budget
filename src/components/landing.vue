<template>
  <div class="landing_wrapper">
    <div class="land_header">
      <div class="container_left">
        <div :id="'graph'+_uid" class="graph_panel"></div>

        <table align="center">
         <tr>
            <td align="right">Cost/day</td>
            <td align="right">Conversion</td>
            <td align="right">ROI</td>
          </tr>
          <tr>
            <td align="center"><div class="const_field">{{ optimal_cost | filterNum }}</div></td>
            <td align="center"><div class="const_field">{{ optimal_value | filterNum }}</div></td>
            <td align="center"><div class="const_field">{{ optimum | filterNum }}{{ kind==1 ? '%' : '' }}</div></td>
          </tr>
        </table>
      </div>
      <div class="container_right">
        <h2>Optimize Budget allocation, forecast performance & predict results with Machine Learning</h2>
        <div class="slider_panel">
          <label>See how it works:</label>
          <input type="range" min="0" max="5000" step="0.01" v-model="var_cost" class="slider no_bord" v-on:input="setPoint()"/>
          <div class="create_content"><a class="login btn create_account" href="#/signup" @click="func1()">Create a free account</a></div>
        </div>
      </div>
    </div>
    <div class="text_content">
      <br/>
      <h1>Budget Optimize can answer these questions::</h1>
      <ul>
        <li>What should I spend for my campaign to achieve it's optimal ROI or CPA?</li>
        <li>How should I allocate budgets between my campaigns to achieve an overall optimal ROI outcome?</li>
        <li>My campaign is currently spending $x per day, if I was to increase to $y / day, what kind of Revenue & ROI/CPA change should I expect?</li>
      </ul>
      <br/>
    </div>
    <div class="word_content">
      <br/>
      <h1>What our customers say</h1>
    </div>
    <div class="video_panel">
      <div v-for="item in video_list" class="youtube-player">
        <h3>{{ item.title }}</h3>
        <iframe :src="'https://www.youtube.com/embed/'+item.video" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
    <div class="sample_optimize">
      <div>
        <h1>Map campaigns using regression models to find optimal performance</h1>
        <img class="first_img" src="~@/img/graR.svg"/>
      </div>
      <div>
        <h1>Forecast performance with increased budgets</h1>
        <img class="second_img" src="~@/img/CalR.svg" />
      </div>
      <div>
        <h1>Find optimal campaign budget allocation that you can plug back into your account</h1>
        <img class="third_img" src="~@/img/oR.svg"/>
      </div>
    </div>
  </div>
</template>

<script>
import myJson from '@/template.json'
import Highcharts from 'highcharts'
import { round } from '@/tool/util'
import AJAX from '@/tool/ajax'
import { predict } from '@/lib/regression'
import CalcWorker from '@/calc.worker.js'
require('@/css/tooltip.css');
require('@/css/range.scss');

export default
{
  data: function()
  {
    var a =
    {
      video_list:
      [
        {
          title: 'Intro & Theory',
          video: 'S4UDgI7VLIk'
        },
        {
          title: 'Import Data',
          video: '5RmN5kyzxmU'
        },
        {
          title: 'Understanding the Output',
          video: '0RGYaLLZiLE'
        }
      ],
      var_cost: 0,
      combined: null,
      individual: [],
      optimal_cost: 0,
      optimal_value: 0, // either Revenue or Conversions
      optimum: 0,
      kind: 1,
      defaultList: 0,
      worker: new CalcWorker()
    };
    return a;
  },
  created: function()
  {
    // Setup an event listener that will handle messages received from the worker.
    this.worker.addEventListener('message', this.worker_ready, false);
  },
  beforeDestroy: function()
  {
    this.worker.terminate();
  },
  mounted: function ()
  {
    //this.defaultData();
    this.combined = myJson[0];
    this.recalc();
  },
  computed: {
    max_value: function()
    {
      // compute the cost for the max ROI or max CPA - using the predicted values from regression
      var i, p, cost = 5000, tmp, points = this.combined.regressions[3].points, len = points.length;
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
    }
  },
  filters:
  {
    filterNum: function (num)
    {
      if(num==null || isNaN(num)) return 0;
      return round(num);
    }
  },
  methods:
    {
      setPoint: function()
      {
        this.chart.destroy();

        var reg_data = this.combined.regressions[3].points.sort(function (a,b)
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
              text: 'Regression Cost'
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
                text: 'Conversion'
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
                name: 'Day (Cost, Conversion)',
                color: 'rgba(223, 83, 83, .5)',
                data: this.combined.points
              },
              {
                name: 'State',
                color: "blue",
                data: [[this.var_cost*Math.abs(1), this.projected_value(this.var_cost)]]
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
                showInLegend: false
              }
            ],
            credits:
            {
              enabled: false
            }
          });
      },
      start_video(item)
      {
        if(!item.clicked) this.$set(item,'clicked',true);
      },
      projected_value: function (cost)
      {
        return Math.min(predict(cost,3,this.combined.regressions[3].equation), 10000);
      },
      projected_roi: function(cost,revenue)
      {
        return (this.kind==1 ? (cost ? 100*(revenue - cost)/cost : 0) : (revenue ? cost / revenue : 0));
      },
      recalc: function(step)
      {
        this.solved = false;
        //this.combined = JSON.parse(myJson);
       // console.log(this.combined);
       // console.log(myJson[0]);
        this.worker.postMessage(
          {
            cmd: 1,
            param: this.combined,
            regression: 3
          });
      },
      worker_ready: function (e)
      {
        switch(e.data.cmd)
        {
          case 1: // regression of combined data
            this.combined = e.data.param;
            this.initChart();
            break;
        }
      },
      optimal_regress: function()
      {
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
      defaultData: function()
      {
        AJAX.ajax_get(this,"api/campaign/default.php", this.getResult,
          function(stat,resp)
          {
       
          }
        );
      },

      getResult(resp)
      {
        this.defaultList = resp.id;
        this.init_Data();
        console.log("default",this.defaultList);
      },

      init_Data: function ()
      {

        AJAX.ajax_post(this,"api/campaign/load.php",
          function(resp)
          {
            if(isArray(resp) && resp.length)
            {
              if(resp.length>1) this.combined = resp.shift();
                else {
                  this.combined = resp[0];
                }
              this.individual = resp;
              this.recalc();
            }
            else
            {
              this.combined = null;
              this.individual = [];
            }
          },
          function(stat,resp)
          {
            this.$emit('error',resp);
          },
          JSON.stringify(
            {
              list: this.defaultList
            }
          )
        );
      },

      initChart: function ()
      {
        this.optimal_regress();
        var reg_data = this.combined.regressions[3].points.sort(function (a,b)
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
              text: 'Regression Cost'
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
                text: 'Conversion'
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
                name: 'Day (Cost, ' + 'Conversion' + ')',
                color: 'rgba(223, 83, 83, .5)',
                data: this.combined.points
              },
              {
                name: 'Day (Cost, ' + 'Conversion' + ')',
                data: reg_data,
                color: 'rgba(40, 100, 255, .9)',
                lineWidth: 2,
                type: 'line',
                dashStyle: 'solid',
                marker:
                  {
                    enabled: false
                  },
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

<style scoped>
  td{
    text-align: center;
  }

  .landing_wrapper
  {
    /* display: flex;
    justify-content: center;
    padding: 0 50px;
    align-items: flex-start; */
  }

  .land_header
  {
    display: flex;
    padding: 10px;
    background: #eee;
    margin: 30px 10px 0px 10px;
  }

  .container_left, .container_right
  {
    flex: 1;
    padding: 10px 20px;
  }

  .container_right h2
  {
    margin: 20px 40px;
    text-align: center;
    font-weight: bold;
  }
  .lang_right_container
  {
    background-color: #eee;
    padding: 25px;
    display: inline-block;
  }

  .const_field,
  .num_field
  {
    margin: 5px auto;
    width: 6rem;
    display: block;
  }

  .const_field
  {
    padding: 6px 10px;
    background-color: #F6B59A;
    border: 1px solid #ED7D31;
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

  .confident
  {
    text-align: center;
    margin-top: 10px;
    display: inline-block;
  }

  .graph_panel img
  {
    width: 100%;
  }

  .text_content, .word_content
  {
    margin: 10px;
    background: #eee;
    padding: 10px;
  }

  .video_panel
  {
    display: flex;
    flex: 1 1 auto;
  }

  .video_panel > *
  {
    flex: 1 1 0;
  }

  .youtube-player
  {
    margin: 20px;
  }

  .youtube-player iframe
  {
    width: 100%;
    height: 100%;
    background: transparent;
  }

  .slider_panel
  {
    text-align: center;
    width: 90%;
    margin: 0 auto;
  }

  .no_bord
  {
    border: none;
    padding: 0;
    background-color: transparent;
  }

  .create_content
  {
    margin-top: 50px;
  }

  .create_account
  {
    background-color: #d7e4cf;
    color: black;
    padding: 15px 30px;
  }

  .sample_optimize
  {
    display: flex;
    background: #eee;
    margin: 50px 10px;
    padding: 10px;
  }

  .sample_optimize div
  {
    flex: 1;
    text-align: center;
    margin: 20px auto;
    padding: 20px;
  }
  .sample_optimize div img
  {
    width: 300px;
  }

  .sample_optimize .first_img
  {
    margin-top: 53px;
  }

  .sample_optimize .second_img
  {
    margin-top: 96px;
  }


  @media screen and (max-width: 420px) {
    .landing
    {
      display: block;
      padding: 0px;
    }

    .video_panel{
      flex-direction: column;
      align-items: center;
    }

  }

</style>
