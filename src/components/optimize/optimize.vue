<template>
  <div>
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <table align="center">
      <tr>
        <td>
          <div class="campaign_list">
            <camp v-for="(camp,idx) in info" :points="camp.points" :title="camp.title" :kind="camp.kind" :key="camp.id" :idx="idx" @regress="solverParam"></camp>
          </div>
        </td>
      </tr>
    </table>
    <div class="screen_width center">
      <solve v-if="info.length>=1 && solved==0" :list="info.length>1 ? reg_data.slice(1) : reg_data" :kind="info[0].kind" @failure="showErr" @optimize="solverResult"></solve>
    </div>
  </div>
</template>

<script>
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
import panelSingle from './single'
import panelSolver from './solver'

export default
{
  components:
    {
      'err-panel': errPanel,
      'camp': panelSingle,
      'solve': panelSolver
    },
  data: function()
  {
    var a =
      {
        is_warn: false,
        warn_text: '',
        info: [],
        reg_data: [], // slope and offset from regression, for each campaign - keyed by campaign ID
        solved: 0,
        combined: []
      };
    return a;
  },
  created: function()
  {
    this.fetchData();
  },
  watch:
    {
      '$route':'fetchData'
    },
  methods:
    {
      fetchData: function()
      {
        if(this.$route.params.list==null || this.$route.params.list.trim()=='') this.$router.replace('/campaigns');
        else AJAX.ajax_post(this,"api/campaign/load.php",
          function(resp)
          {
            if(isArray(resp) && resp.length)
            {
              this.info = resp;
              this.solved = resp.length;
              this.reg_data = new Array(resp.length);
            }
            else
            {
              this.info = [];
              this.reg_data = [];
            }
          },
          function(stat,resp)
          {
            this.reg_data = [];
            this.is_warn = true;
            this.warn_text = resp;
          },
          JSON.stringify(
            {
              //from: YYYY-MM-DD,
              //to: YYYY-MM-DD,
              list: this.$route.params.list
            }
          )
        );
      },
      solverParam: function (idx,slope,ofs/*,improve*/)
      {
        if(this.solved>0) this.solved--;
        this.reg_data[idx] =
          {
            title: this.info[idx].title,
            slope: slope,
            ofs: ofs,
            improve: 0, // improve,
            min_cost: 0,
            max_cost: 0,
            optimal_cost: 0,
          }
      },
      solverResult: function (res)
      {
        if(res.length>1) res.unshift(0);
        this.reg_data = this.reg_data.map(function (item,idx)
        {
          item.optimal_cost = res[idx];
          return item;
        });
      },
      showErr: function (err)
      {
        this.is_warn = true;
        this.warn_text = err;
      }
    }
}

</script>

<style>
  .campaign_list
  {
    display: flex;
    justify-content: space-around;
  }

  .screen_width
  {
    width: 100vw;
  }
</style>
