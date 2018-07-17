<template>
  <form action="api/admin/campaign_csv.php" method="POST">
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <h2 align="center">ROI campaigns for <span class="user_name">{{ user_name }}</span></h2>
    <div class="center bot_space">
      <button name="cmdROI" class="btn btn_yes" :disabled="!selected_roi.length">Export selected campaigns</button>
    </div>
    <table align="center" class="acc_stat">
      <thead>
        <tr>
          <th><input type="checkbox" :checked="data_roi.length && selected_roi.length==data_roi.length" @click="roi_all"/></th>
          <th>Group name</th>
          <th>Campaign title - ROI</th>
          <th>Export</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sortedROI">
          <td align="center"><input type="checkbox" v-model="selected_roi" name="cid[]" :value="item.id" :id="'roi_'+item.id"/></td>
          <td><label :for="'roi_'+item.id">{{ item.group }}</label></td>
          <td><label :for="'roi_'+item.id">{{ item.title }}</label></td>
          <td>
            <a :href="'api/admin/campaign_csv.php?id='+item.id" class="link">Get CSV</a>
          </td>
        </tr>
      </tbody>
    </table>
    <h2 align="center">CPA campaigns for <span class="user_name">{{ user_name }}</span></h2>
    <div class="center bot_space">
      <button name="cmdCPA" class="btn btn_yes" :disabled="!selected_cpa.length">Export selected campaigns</button>
    </div>
    <table align="center" class="acc_stat">
      <thead>
        <tr>
          <th><input type="checkbox" :checked="data_cpa.length && selected_cpa.length==data_cpa.length" @click="cpa_all"/></th>
          <th>Group name</th>
          <th>Campaign title - CPA</th>
          <th>Export</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sortedCPA">
          <td align="center"><input type="checkbox" v-model="selected_cpa" name="cid[]" :value="item.id" :id="'cpa_'+item.id"/></td>
          <td><label :for="'cpa_'+item.id">{{ item.group }}</label></td>
          <td><label :for="'cpa_'+item.id">{{ item.title }}</label></td>
          <td>
            <a :href="'api/admin/campaign_csv.php?id='+item.id" class="link">Get CSV</a>
          </td>
        </tr>
      </tbody>
    </table>
    <br/>
  </form>
</template>

<script>
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
import { strCompare } from "@/tool/util";

require('@/css/account.css');

export default
{
  components:
    {
      'err-panel': errPanel
    },
  data: function()
  {
    var a =
      {
        is_warn: false,
        warn_text: '',
        user_name: '',
        data_roi: [],
        data_cpa: [],
        selected_roi: [],
        selected_cpa: []
      };
    return a;
  },
  created: function()
  {
    this.fetchData();
  },
  computed:
    {
      sortedROI: function()
      {
        return this.data_roi.sort(function(a,b)
        {
          const t = strCompare(a.group.toLowerCase(),b.group.toLowerCase());
          if(t) return t;
          return strCompare(a.title.toLowerCase(),b.title.toLowerCase());
        });
      },
      sortedCPA: function()
      {
        return this.data_cpa.sort(function(a,b)
        {
          const t = strCompare(a.group.toLowerCase(),b.group.toLowerCase());
          if(t) return t;
          return strCompare(a.title.toLowerCase(),b.title.toLowerCase());
        });
      },
    },
  methods:
    {
      fetchData: function()
      {
        AJAX.ajax_get(this,'api/admin/user_data.php?id='+this.$route.params.user,
          function(resp)
          {
            if(isArray(resp.data_roi)) this.data_roi = resp.data_roi;
            if(isArray(resp.data_cpa)) this.data_cpa = resp.data_cpa;
            this.user_name = resp.user_name;
            this.selected_roi = [];
            this.selected_cpa = [];
          },
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      },
      roi_all: function(evt)
      {
        if(evt.target.checked) this.selected_roi = this.data_roi.map(function(item)
        {
          return item.id;
        });
        else this.selected_roi = [];
      },
      cpa_all: function(evt)
      {
        if(evt.target.checked) this.selected_cpa = this.data_cpa.map(function(item)
        {
          return item.id;
        });
        else this.selected_cpa = [];
      }
    }
}
</script>
