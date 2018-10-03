<template>
  <div>
    <nav class="campaign_toolbar">
      <button v-if="cur_tab!=1" class="btn_camp" @click="cur_tab=1">Combined data</button>
      <div v-if="cur_tab==1" class="btn_camp_cur">Combined data
        <div class="center help_sign tooltip-bottom tooltip" data-tooltip="This output combines campaigns and plots them together.  Here you are able to quickly see overall account performance">
          <img src="~@/img/help.svg"/>
        </div>
      </div>
      <!--
      <button v-if="cur_tab!=2" class="btn_camp" @click="cur_tab=2">Individual campaigns</button>
      <div v-if="cur_tab==2" class="btn_camp_cur">Individual campaigns</div>-->
      <button v-if="cur_tab!=3" class="btn_camp" @click="cur_tab=3">Optimisation table</button>
      <div v-if="cur_tab==3" class="btn_camp_cur">Optimisation table</div>
    </nav>
    <div v-if="cur_tab==1" class="campaign_item">
      <!-- Combined -->
      <keep-alive>
        <camp v-if="combined && solved" :campaign="combined" :kind="kind" :type_reg="regression" :reg_names="reg_names"></camp>
      </keep-alive>
    </div>
    <div v-if="cur_tab==2">
      <!-- Individual -->
      <table v-if="individual.length && solved" align="center">
        <tr>
          <td>
            <div class="campaign_list">
              <template v-for="(camp,idx) in individual">
                <keep-alive>
                  <camp :campaign="camp" :kind="camp.kind" :key="camp.id" :idx="idx" :type_reg="regression" :reg_names="reg_names"></camp>
                </keep-alive>
              </template>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div v-if="cur_tab==3" class="campaign_item">
      <!-- Solver -->
      <solve v-if="individual.length && solved" :list="individual" :kind="kind" :type_reg="regression ? regression : combined.best_fit" @failure="showErr" @optimize="solverResult"></solve>
    </div>
  </div>
</template>

<script>
import AJAX from '@/tool/ajax'
import panelSingle from '@/components/optimize/single'
import panelSolver from '@/components/optimize/solver'
import { predict } from '@/lib/regression'
import CalcWorker from '@/calc.worker.js'

export default
{
  components:
    {
      'camp': panelSingle,
      'solve': panelSolver
    },
  props:
    {
      regression:
        {
          type: Number,
          default: 0
        },
      campaigns:
        {
          type: Array,
          default: function()
          {
            return [];
          }
        },
      outliers: // TRUE = remove outliers
        {
          type: Boolean,
          default: false
        },
      kind:
        {
          type: Number,
          default: 1 // 1 = ROI, any other = CPA
        },
      start:
        {
          type: String,
          default: ''
        },
      end:
        {
          type: String,
          default: ''
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
        cur_tab: 1,
        solved: false,
        combined: null,
        individual: [],
        history:
          {
            total_spent: 0,
            avg_spent: 0,
            total_revenue: 0,
            avg_revenue: 0,
            total_roi: 0,
            avg_roi: 0,
            best_fit: 0,
            rmse:  [0,0,0,0,0,0],
            r2: [0,0,0,0,0,0] // equal to the number of regressions + 1 (for the Auto-fit)
          },
        worker: new CalcWorker()
      };
    return a;
  },
  watch:
    {
      'regression': 'clear_optimal',
      //'outliers': 'recalc', -- removing outliers is destructive, we have to refresh the whole dataset from server
      'campaigns': 'update',
      'start': 'update',
      'end': 'update'
    },
  created: function()
  {
    // Setup an event listener that will handle messages received from the worker.
    this.worker.addEventListener('message', this.worker_ready, false);
    this.update();
  },
  beforeDestroy: function()
  {
    this.worker.terminate();
  },
  methods:
    {
      update: function()
      {
        if(this.campaigns.length==0)
        {
          this.combined = null;
          this.individual = [];
        }
        else AJAX.ajax_post(this,"api/campaign/load.php",
          function(resp)
          {
            if(isArray(resp) && resp.length)
            {
              if(resp.length>1) this.combined = resp.shift();
                else this.combined = resp[0];
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
              from: this.start,
              to: this.end,
              list: this.campaigns.join(',')
            }
          )
        );
      },
      recalc: function(step)
      {
        if(step==2)
        {
          this.worker.postMessage(
            {
              cmd: 2,
              param: this.individual,
              kind: parseInt(this.kind),
              regression: parseInt(this.regression),
              outliers: this.outliers
            });
        }
        else
        {
          this.solved = false;
          this.worker.postMessage(
            {
              cmd: 1,
              param: this.combined,
              kind: parseInt(this.kind),
              regression: parseInt(this.regression),
              outliers: this.outliers
            });
        }        
      },
      clear_optimal: function()
      {
        let i, camp = this.individual, len = camp.length;
        for(i=0;i<len;i++)
        {
          camp[i].optimal_cost = 0;
        }
      },
      worker_ready: function (e)
      {         
        switch(e.data.cmd)
        {
          case 1: // regression of combined data
            this.combined = e.data.param;
            this.recalc(2);
            let i, hist = this.history, points = this.combined.points, len = points.length, spent = 0, revenue = 0, projected;
            if(len > 0){
              hist.r2 = this.combined.regressions.map(function(item)
              {
                return isNaN(item.r2) ? 0 : item.r2;
              });
              hist.rmse = this.combined.regressions.map(function(item)
              {
                return isNaN(item.rmse) ? 0 : item.rmse;
              });
              for(i=0;i<len;i++)
              {
                projected = predict(points[i][0],this.combined.best_fit,this.combined.regressions[0].equation);
                hist.total_roi = (this.kind==1 ? (spent ? 100*(projected - points[i][0])/points[i][0] : 0) : (projected ? points[i][0] / projected : 0));
                spent += points[i][0];
                revenue += points[i][1];
              }
              hist.total_spent = spent;
              hist.total_revenue = revenue;
              hist.avg_spent = (len ? spent / len : 0);
              hist.avg_revenue = (len ? revenue / len : 0);
              // projected = predict(spent,this.combined.best_fit,this.combined.regressions[0].equation);
              // hist.total_roi = (this.kind==1 ? (spent ? 100*(projected - spent)/spent : 0) : (projected ? spent / projected : 0));
              hist.avg_roi = (len ? hist.total_roi / len : 0);
              this.$emit('history',hist);
              break;
            } 
            else{
              hist.r2 = 0;
              hist.rmse = 0;
              hist.total_spent = 0;
              hist.total_revenue = 0;
              hist.avg_revenue = 0;
              hist.avg_spent = 0;
              hist.avg_roi = 0;
              this.$emit('history', hist)
            }
          case 2: // regressions of individual campaigns          
            this.individual = e.data.param;
            this.solved = true;
            break;
          case 3: // progress indicator

            break;
        }
      },
      solverResult: function (res)
      {
        var i, len = res.length;
        for(i=0;i<len;i++) this.individual[i].optimal_cost = res[i];
      },
      showErr: function(msg)
      {
        this.$emit('error',msg);
      }
    }
}
</script>

<style>
  .campaign_toolbar
  {
    display: flex;
    justify-content: center;
    margin: 0 10px;
  }

  .btn_camp,
  .btn_camp_cur
  {
    border-width: 1px;
    border-style: solid;
    border-radius: 0;
    padding: 0.25rem 1rem 0.5rem;
    flex: 1;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    outline: none;
  }

  .btn_camp_cur
  {
    background-color: #259AD6;
    border-color: transparent;
    color: white;
  }

  .btn_camp
  {
    background-color: #eee;
    border-color: #555;
    color: black;
  }

  .campaign_list
  {
    display: flex;
    justify-content: space-around;
  }

  @media screen and (max-width: 480px) {
    .btn_camp_cur, .btn_camp
    {
      margin: 0px;
    }
  }

</style>
