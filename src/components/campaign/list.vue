<template>
  <div class="campaigns_screen">
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <div class="campaign_left">
      <div class="campaign_panel">
        <div class="campaign_listing">
          <template v-if="roi_or_cpa==1">
            <template v-for="grp in groupsROI">
              <div class="group_title">
                <div v-if="!grp.collapsed">
                  <input type="checkbox" @click="toggleSelected(campaign_roi[grp.id],select_roi,grp)" :checked="grp.checked==campaign_roi[grp.id].length" />
                </div>

                <!-- <collapse :selected="false">
                  <div slot="collapse-header"> -->
                    <div class="group_name" @click="toggleCollapsed(grp)">{{ (grp.collapsed ? '+ ' : '- ') + (grp.title!='' ? grp.title : 'NO GROUP') }}</div>
                  <!-- </div>
                </collapse> -->

              </div>
              <ul class="no_list camp_group" v-if="!grp.collapsed">
                <li v-for="item in sortedROI(grp)">
                  <input :disabled="item.unpaid && !$root.info.is_admin" type="checkbox" :id="'roi_' + item.id" :value="item.id" v-model="select_roi" @click="grp.checked+=($event.target.checked ? +1 : -1)"/>
                  <label :for="'roi_' + item.id">&nbsp;{{ item.title }}</label>
                </li>
              </ul>
            </template>
          </template>
          <template v-else>
            <template v-for="grp in groupsCPA">
              <div class="group_title">
                <div v-if="!grp.collapsed">
                  <input type="checkbox" @click="toggleSelected(campaign_cpa[grp.id],select_cpa,grp)" :checked="grp.checked==campaign_cpa[grp.id].length" />
                </div>
                <div class="group_name" @click="toggleCollapsed(grp)">{{ (grp.collapsed ? '+ ' : '- ') + (grp.title!='' ? grp.title : 'NO GROUP') }}</div>
              </div>
              <ul class="no_list camp_group" v-if="!grp.collapsed">
                <li v-for="item in sortedCPA(grp)">
                  <input :disabled="item.unpaid && !$root.info.is_admin" type="checkbox" :id="'cpa_' + item.id" :value="item.id" v-model="select_cpa" @click="grp.checked+=($event.target.checked ? +1 : -1)"/>
                  <label :for="'cpa_' + item.id">&nbsp;{{ item.title }}</label>
                </li>
              </ul>
            </template>
          </template>
        </div>
        <div class="error_message" v-if="valid_msg != ''" v-html="valid_msg"></div>
        <div class="error_message" v-if="(roi_or_cpa==1 && campaign_roi.length==0) || (roi_or_cpa!=1 && campaign_cpa.length==0)">
          Please <a href="#/import" class="link">import</a> some data
        </div>
        <div class="campaign_dates">
          <input type="date" v-model="from_date"/>
          <input type="date" v-model="to_date"/>
          <button class="btn btn_dark btn-shadow" style="padding: 3px 6px 4px" @click="doOptimal(roi_or_cpa==1 ? select_roi : select_cpa)">
            <svg width="16px" height="22px" viewBox="0 0 16 22" xmlns="http://www.w3.org/2000/svg">
              <path fill="#fff" d="M8,3 L8,0 L4,4 L8,8 L8,5 C11.3,5 14,7.7 14,11 C14,12 13.7,13 13.3,13.8 L14.8,15.3
                C15.5,14 16,12.6 16,11 C16,6.6 12.4,3 8,3 L8,3 Z M8,17 C4.7,17 2,14.3 2,11 C2,10 2.3,9 2.7,8.2 L1.2,6.7
                C0.5,8 0,9.4 0,11 C0,15.4 3.6,19 8,19 L8,22 L12,18 L8,14 L8,17 L8,17 Z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="campaign_optimize">
        <collapse :selected="false">
          <div slot="collapse-header">
            <div class="center help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
              <b>Optimize for ROI or CPA</b>
              <img src="~@/img/help.svg"/>
            </div>
          </div>

          <div slot="collapse-body">
              <div>
                <input type="radio" v-model="roi_or_cpa" id="roi_optimial" value="1"/>
                <label for="roi_optimial">ROI</label>
              </div>
              <div>
                <input type="radio" v-model="roi_or_cpa" id="cpa_optimial" value="0"/>
                <label for="cpa_optimial">CPA</label>
              </div>
              <div>
                <input type="checkbox" v-model="outlier" id="remove_outlier"/>
                <label for="remove_outlier">Remove outliers</label>
              </div>
            <button v-if="roi_or_cpa==1 && select_roi.length>0" class="campaign_delete btn btn_dark" @click="delCampaign(select_roi)">Delete selected</button>
            <button v-if="roi_or_cpa==0 && select_cpa.length>0" class="campaign_delete btn btn_dark" @click="delCampaign(select_cpa)">Delete selected</button>
          </div>
        </collapse>
      </div>

      <div class="campaign_regress">
        <collapse :selected="false">
          <div slot="collapse-header">
            <div class="center help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
              <b>Regression Model for <br> best fit</b>
              <img src="~@/img/help.svg"/>
            </div>
          </div>

          <div slot="collapse-body">
            <table>
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td align="right">R<span class="super">2</span></td>
              </tr>
              <tr v-for="(reg,idx) in regressions">
                <td>
                  <input type="radio" v-model="kind_regress" :value="idx" :id="'regid_'+idx"/>
                </td>
                <td><label :for="'regid_'+idx">{{ reg }}</label></td>
                <td align="right">{{ r2[idx] | filterNum }}</td>
              </tr>
            </table>
          </div>  

        </collapse>
      </div>
      <div class="campaign_actual">
        <collapse :selected="false">
          <div slot="collapse-header">
            <div class="center help_sign tooltip-bottom" data-tooltip="Note the question marks, when hovered over these should display informational text. I will provide you with this text separately.">
              <b>Actual Historical Results<br/>during this period</b>
              <img src="~@/img/help.svg"/>
            </div>
          </div>

          <div slot="collapse-body">
            <div class="actual_body">
              Total Spent = {{ total_spent | filterNum }}<br/>Avg Spent = {{ avg_spent | filterNum }}
            </div>
            <div class="actual_body">
              Total {{ roi_or_cpa ? 'Revenue = ' : 'Conversions = ' }}{{ total_revenue | filterNum }}
              <br/>
              Avg {{ roi_or_cpa ? 'revenue' : 'conv' }} / day = {{ avg_revenue | filterNum }}
            </div>
            <div class="actual_body">
              Total {{ roi_or_cpa ? 'ROI' : 'CPA' }} for period = {{ total_roi | filterNum }}{{ roi_or_cpa ? '%' : '' }}
              <br/>
              Avg daily {{ roi_or_cpa ? 'ROI' : 'CPA' }} = {{ avg_roi | filterNum }}{{ roi_or_cpa ? '%' : '' }}
            </div>
          </div>
        </collapse>
      </div>
    </div>
    <div class="campaign_center">
      <optimizer @error="showError" @history="updHistory" :kind="parseInt(roi_or_cpa)" :regression="kind_regress" :campaigns="optimizer_list" :outliers="outlier" :start="from_date" :end="to_date" :reg_names="regressions"></optimizer>
    </div>
  </div>
</template>

<script>
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
import panelOptimize from '@/components/campaign/tabs'
import { strCompare, round } from '@/tool/util'
import Collapse from 'vue-collapse'
require('@/css/panel.css');
require('@/css/tooltip.css');

export default
{
  components:
    {
      'err-panel': errPanel,
      'optimizer': panelOptimize,
       Collapse
    },
  data: function()
  {
    var a =
      {
        is_warn: false,
        warn_text: '',
        unpaid: false,
        valid_msg: '',
        campaign_roi: [],
        campaign_cpa: [],
        group_roi: [],
        group_cpa: [],
        select_roi: [],
        select_cpa: [],
        total_spent: 0,
        avg_spent: 0,
        total_revenue: 0,
        avg_revenue: 0,
        total_roi: 0,
        avg_roi: 0,
        roi_or_cpa: 1,
        outlier: false,
        from_date: null, // this.month_start(),
        to_date: null, // this.month_end(),
        kind_regress: 0,
        r2:
          [
            0, // auto-selected
            0, // linear
            0, // exponential
            0, // logarithmic
            0, // polynomial
            0, // power
          ],
        regressions:
          [
            'Auto Select',
            'Linear',
            'Exponential',
            'Logarithmic',
            'Polynomial',
            'Power'
          ],
        optimizer_list: []
      };
    return a;
  },
  created: function()
  {
    this.fetchData();
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
      groupsROI: function ()
      {
        return this.group_roi.sort(function (a, b)
        {
          return strCompare(a.title, b.title);
        });
      },
      groupsCPA: function ()
      {
        return this.group_cpa.sort(function (a, b)
        {
          return strCompare(a.title, b.title);
        });
      },
    },
  methods:
    {
      sortedROI: function (grp)
      {
        // slice is needed to prevent infinite render loop
        return this.campaign_roi[grp.id].slice().sort(function (a,b)
        {
          return strCompare(a.title.toLowerCase(),b.title.toLowerCase());
        });
      },
      sortedCPA: function (grp)
      {
        // slice is needed to prevent infinite render loop
        return this.campaign_cpa[grp.id].slice().sort(function (a,b)
        {
          return strCompare(a.title.toLowerCase(),b.title.toLowerCase());
        });
      },
      fetchData: function()
      {
        AJAX.ajax_get(this,"api/campaign/list.php", this.getResult,
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      },
      
      getResult(resp)
      {
        this.select_roi = [];
        this.select_cpa = [];
        this.unpaid = resp.unpaid;
        if(isObject(resp.campaign_roi)) this.campaign_roi = resp.campaign_roi;
          else this.campaign_roi = [];
        if(isObject(resp.campaign_cpa)) this.campaign_cpa = resp.campaign_cpa;
          else this.campaign_cpa = [];
        if(isArray(resp.groups_roi) && resp.groups_roi.length) this.group_roi = resp.groups_roi;
          else this.group_roi = [];
        if(isArray(resp.groups_cpa) && resp.groups_cpa.length) this.group_cpa = resp.groups_cpa;
          else this.group_cpa = [];
      },
      doOptimal: function (list)
      {
        this.valid_msg = '';
        if(!list.length) this.valid_msg = 'Please select at least 1 campaign';
        else if(!(this.$root.info && this.$root.info.confirmed)) this.valid_msg = '<b>Forbidden</b><br/>Confirm your e-mail first<br/>or <a href="#/profile" class="link">re-issue</a> another activation';
        else this.optimizer_list = list.slice();
      },
      delCampaign: function(list)
      {
        if(!window.confirm('Do you really want to PERMANENTLY delete the selected campaigns ?')) return;
        AJAX.ajax_post(this,"api/campaign/delete.php",
          this.getResult,
          function (stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          },
          JSON.stringify(list)
        );
      },
      toggleCollapsed: function(grp)
      {
        this.$set(grp,'collapsed', !grp.collapsed);
      },
      toggleSelected: function(arr,list,grp)
      {
        var len = arr.length, i, idx;
        if(grp.checked==len)
        {
          // must exclude all members of group from list of selected
          for(i=0;i<len;i++)
          {
            idx = list.indexOf(arr[i].id);
            if(idx != -1) list.splice(idx,1);
          }
          grp.checked = 0;
        }
        else
        {
          // must include all members of group into list of selected
          for(i=0;i<len;i++)
          {
            idx = list.indexOf(arr[i].id);
            if(idx == -1 && !arr[i].unpaid) list.push(arr[i].id); // skip campaigns over the free limit
          }
          grp.checked = len;
        }
      },
      showError: function(msg)
      {
        this.is_warn = true;
        this.warn_text = msg;
      },
      updHistory: function(history)
      {
        this.total_spent = history.total_spent;
        this.avg_spent = history.avg_spent;
        this.total_revenue = history.total_revenue;
        this.avg_revenue = history.avg_revenue;
        this.total_roi = history.total_roi;
        this.avg_roi = history.avg_roi;
        // update best fit R2
        //this.kind_regress = history.best_fit;
        this.r2 = history.r2;
      }
      /*
      month_start: function()
      {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().substr(0,10);
      },
      month_end: function()
      {
        const d = new Date();
        d.setDate(0);
        d.setMonth(d.getMonth()+1);
        return d.toISOString().substr(0,10);
      }
      */
    }
}

</script>

<style>
  .campaigns_screen
  {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .group_title
  {
    text-align: center;
    font-weight: bold;
    background-color: #F6DBA3;
    display: flex;
    padding: 0 5px 3px 5px;
    border-bottom: 1px solid #999;
  }

  .group_title input
  {
    vertical-align: middle;
  }

  .group_name
  {
    flex: 1 1 auto;
    cursor: pointer;
  }

  .camp_group li
  {
    padding: 0 5px;
    white-space: nowrap;
  }

  .campaign_left
  {
    display: flex;
    flex-direction: column;
    width: 300px;
  }

  .campaign_listing
  {
    border: 1px solid #CCC;
    margin-bottom: 4px;
    overflow: auto;
    flex: 1 1 auto;
  }

  .campaign_dates
  {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 36px;
  }

  input[type="date"]
  {
    width: 7.7rem;
    padding: 2px 0 2px 4px;
  }

  .campaign_optimize
  {
    padding: 8px;
    background-color: #70AD47;
    color: white;
    position: relative;
  }

  .campaign_delete
  {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-40%);
  }

  .campaign_regress td:last-child
  {
    color: red;
    font-weight: bold;
    padding-left: 5px;
    padding-right: 5px;
  }

  .campaign_regress
  {
    padding: 8px;
    color: white;
    background-color: black;
  }

  .campaign_actual
  {
    padding: 8px;
    background-color: lightblue;
  }

  .actual_body
  {
    padding-left: 20px;
    padding-top: 8px;
  }

  .campaign_panel
  {
    display: flex;
    flex-direction: column;
    padding: 3px;
    min-height: 250px;
  }

  .campaign_panel,
  .campaign_center
  {
    flex: 1 1 auto;
    overflow: auto;
  }

  .help_sign img
  {
    display: inline-block;
    margin-left: 6px;
    width: 20px;
    vertical-align: sub;
  }

  .super
  {
    vertical-align: super;
    font-size: 8pt;
    margin-left: 2pt;
  }

  input[type=date]::-webkit-inner-spin-button,
  input[type=date]::-webkit-clear-button,
  input[type=date]::-webkit-outer-spin-button
  {
    -webkit-appearance: none;
  }

  .btn-shadow
  {
    box-shadow: inset 0 0 0 1px #27496d;
  }

  .btn-shadow:not([disabled]):hover
  {
    box-shadow: inset 0 0 0 1px #27496d,0 5px 15px #193047;
  }

  .btn-shadow:not([disabled]):active
  {
    transform: translate(1px, 1px);
    box-shadow: inset 0 0 0 1px #27496d,inset 0 5px 30px #193047;
  }

  .campaign_optimize .collapse .collapse-header{
    background-color: #70AD47 !important;
  }

  .campaign_regress .collapse .collapse-header{
    background-color: black !important;
  }

  .campaign_actual .collapse .collapse-header{
    background-color: lightblue !important;
  }

  .collapse .collapse-header::before{
    left: auto !important;
    right: 20px;
  }

  .group_title .collapse-header{
    padding: 0 !important;
    background: inherit !important;
  }
</style>
