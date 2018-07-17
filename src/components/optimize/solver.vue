<template>
  <div class="inline">
    <div class="op_main">
      <h2 class="solve_header">Optimize the {{ optimal_text }}</h2>
      <table align="center" cellspacing="0" cellpadding="4" class="solve_table">
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th colspan="2" class="bord help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
              CONSTRAINTS
              <img src="~@/img/help.svg"/>
            </th>
            <th class="bord help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
              IMPROVEMENT
              <img src="~@/img/help.svg"/>
            </th>
            <th colspan="3" class="bord">OUTPUT</th>
          </tr>
          <tr>
            <th>&nbsp;</th>
            <th class="bord">MIN cost/day</th>
            <th class="bord">MAX cost/day</th>
            <td class="bord">Expected improvement, %</td>
            <th class="bord">Cost/day</th>
            <th class="bord">Projected {{ text_kind }}</th>
            <th class="bord">Projected {{ optimal_text }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" align="center">
            <td align="right">{{ item.title }}:</td>
            <td class="bl"><input type="number" class="num_field" v-model="item.min_cost" onClick="this.select()"/></td>
            <td class="bl br"><input type="number" class="num_field" v-model="item.max_cost" onClick="this.select()"/></td>
            <td class="br"><input type="number" class="num_field" v-model="item.improve" onClick="this.select()"/></td>
            <td class="br"><div class="const_total">{{ item.optimal_cost | filterNum }}</div></td>
            <td class="br"><div class="const_total">{{ depend(item) | filterNum }}</div></td>
            <td class="br"><div class="const_total">{{ projected(item) | filterNum }}{{ kind==1 ? '%' : '' }}</div></td>
          </tr>
        </tbody>
        <tfoot>
          <tr align="center">
            <td align="right">Total:</td>
            <td class="bt"><input type="number" class="num_field" v-model="min_total" /></td>
            <td class="bt"><input type="number" class="num_field" v-model="max_total" /></td>
            <td class="bt">
              <button type="button" class="btn btn_calc" @click="doSolve">Optimize</button>
            </td>
            <td class="bt"><div class="const_total">{{ total_cost | filterNum }}</div></td>
            <td class="bt"><div class="const_total">{{ total_result | filterNum }}</div></td>
            <td class="bt help_sign tooltip-top" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
              <div class="major_total">{{ total_optimal | filterNum }}{{ kind==1 ? '%' : '' }}</div><img src="~@/img/help.svg"/>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
import AJAX from '@/tool/ajax'
import { predict } from '@/lib/regression'
require('@/css/tooltip.css');

export default
{
  props:
    {
      list:
        {
          type: Array,
          default: function ()
          {
            return [];
          }
        },
      kind:
        {
          type: Number,
          default: 1
        },
      type_reg:
        {
          type: Number
        }
    },
  data: function()
  {
    var a =
    {
      min_total: 0,
      max_total: 0,
    };
    return a;
  },
  filters:
    {
      filterNum: function (num)
      {
        if(num==null || num<=0) return 0;
        return (+(Math.round(+(num + 'e' + 2/*precision*/)) + 'e' + -2/*precision*/)).toFixed(2/*precision*/);
      }
    },
  computed:
    {
      text_kind: function ()
      {
        return (this.kind==1 ? 'Revenue' : 'Conversions');
      },
      optimal_text: function ()
      {
        return (this.kind==1 ? 'Max ROI' : 'Min CPA');
      },
      total_cost: function ()
      {
        var i, s = 0, len = this.list.length;
        for(i=0;i<len;i++) s += this.list[i].optimal_cost;
        return s;
      },
      total_result: function ()
      {
        var i, s = 0, len = this.list.length;
        for(i=0;i<len;i++) s += this.depend(this.list[i]);
        return s;
      },
      total_optimal: function ()
      {
        var c = this.total_cost, r = this.total_result;
        if(this.kind==1) return (c ? 100*(r-c)/c : 0);
          else return (r>0.1 ? c/r : c);
      }
    },
  methods:
    {
      projected: function (item)
      {
        return (this.kind==1 ? this.projected_roi(item) : this.projected_cpa(item));
      },
      depend: function (item)
      {
        return item.optimal_cost<=0 ? 0 : predict(item.optimal_cost,this.type_reg ? this.type_reg : item.best_fit,item.regressions[this.type_reg ? this.type_reg : item.best_fit].equation)*(1 + item.improve/100);
      },
      projected_roi: function (item)
      {
        return (item.optimal_cost ? 100*(this.depend(item) - item.optimal_cost)/item.optimal_cost : 0);
      },
      projected_cpa: function (item)
      {
        var result = this.depend(item);
        return (result>0.1 ? item.optimal_cost/result : item.optimal_cost);
      },
      doSolve: function ()
      {
        let self = this;
        AJAX.ajax_post(this,"api/optimize/solve.php",
          function (resp)
          {
            this.$emit('optimize',resp);
          },
          function (stat,resp)
          {
            this.$emit('failure',resp);
          },
          JSON.stringify(
          {
            kind: parseInt(this.kind),
            reg_type: this.type_reg,
            min_total: this.min_total,
            max_total: this.max_total,
            list: this.list.map(function(item)
            {
              return {
                min_cost: item.min_cost,
                max_cost: item.max_cost,
                improve: item.improve,
                regression: item.regressions[self.type_reg].equation
              };
            })
          })
        );
      },
    }
}

</script>

<style>
  .solve_header
  {
    background-color: #70AD47;
    color: white;
    padding: 8px 10px;
    margin-top: 0;
  }

  .solve_table
  {
    border-collapse: collapse;
  }

  .bord
  {
    border: 1px solid sandybrown;
  }

  .bl
  {
    border-left: 1px solid sandybrown;
  }

  .br
  {
    border-right: 1px solid sandybrown;
  }

  .bt
  {
    border-top: 1px solid sandybrown;
  }

  .const_total,
  .major_total
  {
    margin: 5px;
    min-width: 6rem;
    padding: 6px 10px;
    text-align: right;
  }

  .const_total
  {
    background-color: #FFD993;
    border: 1px solid #FFC000;
  }

  .btn_calc
  {
    background-color: #34495E;
    color: white;
  }

  .major_total
  {
    background-color: #ED7D31;
    color: white;
    display: inline-block;
  }

</style>
