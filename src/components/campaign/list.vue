<template>
  <div class="campaigns_screen">
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <div class="campaign_sidebar_wrapper">
      <div class="campaign_left" :class="{ active: active}">
        <div class="sidebar_tap_wrapper">
          <div class="roi_content" >
            <input type="radio" v-model="roi_or_cpa" id="roi_optimial" value="1"/>
            <label for="roi_optimial">ROI</label>
            <span class="tooltip-bottom tooltip" data-tooltip="Select campaign data that contains revenue to optimise for ROI (Return on Investment).">
              <img src="~@/img/help.svg"/>
            </span>
          </div>
          <div class="cpa_content">
            <input type="radio" v-model="roi_or_cpa" id="cpa_optimial" value="0"/>
            <label for="cpa_optimial">CPA</label>
            <span class="tooltip-bottom tooltip" data-tooltip="Select Campaign data that contains ‘conversions’ to optimise for CPA (Cost Per Aquisition).">
              <img src="~@/img/help.svg"/>
            </span>
          </div>
        </div>
        <div class="campaign_panel">
          <div class="campaign_listing">
            <div class="campaign_header">
              <h3>Campaigns</h3>
            </div>
            <div class="search-wrapper">
              <input type="text" v-model="search" placeholder="Search campaign.."/>
              <label>Search title:</label>
              <i class="fa fa-search" aria-hidden="true"></i>
            </div>
            <template v-if="roi_or_cpa==1">
              <template v-for="grp in groupsROI">
                <div class="group_title">
                  <div v-if="grp.collapsed">
                    <input type="checkbox" @click="toggleSelected(campaign_roi[grp.id],select_roi,grp)" :checked="grp.checked==campaign_roi[grp.id].length" />
                  </div>
                  <div class="group_name" @click="toggleCollapsed(grp)">
                    <i v-bind:id="grp.id" class="fa fa-angle-up" aria-hidden="true"></i>
                    {{ (grp.title!='' ? grp.title : 'NO GROUP') }}
                  </div>
                  <i class="fa fa-remove cus_remove" @click="removeElement($event)"></i>
                </div>
                <ul class="no_list camp_group" v-if="grp.collapsed">
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
                  <div v-if="grp.collapsed">
                    <input type="checkbox" @click="toggleSelected(campaign_cpa[grp.id],select_cpa,grp)" :checked="grp.checked==campaign_cpa[grp.id].length" />
                  </div>
                  <div class="group_name" @click="toggleCollapsed(grp)">
                    <i v-bind:id="grp.id" class="fa fa-angle-up" aria-hidden="true"></i>
                    {{ (grp.title!='' ? grp.title : 'NO GROUP') }}
                  </div>
                  <i class="fa fa-remove cus_remove" @click="removeElement($event)"></i>
                </div>
                <ul class="no_list camp_group" v-if="grp.collapsed">
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
          <div slot="collapse-body">
                <input type="checkbox" v-model="outlier" id="remove_outlier"/>
                <label for="remove_outlier">Remove outliers</label>
                <span class="tooltip-bottom tooltip" data-tooltip="Outliers are abnormal observations that can skew results. Removing outliers is recommended.">
                  <img src="~@/img/help.svg"/>
                </span>
            <button v-if="roi_or_cpa==1 && select_roi.length>0" class="campaign_delete btn btn_dark" @click="delCampaign(select_roi)">Delete selected</button>
            <button v-if="roi_or_cpa==0 && select_cpa.length>0" class="campaign_delete btn btn_dark" @click="delCampaign(select_cpa)">Delete selected</button>
          </div>
        </div>

        <div class="campaign_regress">
          <collapse :selected="false">
            <div slot="collapse-header">
                <b>Regression Model for best fit</b>
                <span class="center help_sign tooltip-bottom tooltip" data-tooltip="r-squared is a statistical measure of how close the regression line fits the data points.  R-squared lies between 0 & 1.  The higher the r-squared value the better the fit.  We have auto selected the model with the highest r-squared value, however you can adjust the model.">
                  <img src="~@/img/help.svg"/>
                </span>
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
                <b>Actual Historical Results<br/>during this period</b>
                <div class="center help_sign tooltip-bottom tooltip custom-help" data-tooltip="These are actual results from your data within the selected time frame.  Compare these numbers with results from the model to see the difference in the predictions vs actual results.">
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
      <div class="sidebar_collapse" @click="toggleNav($event)">
        <i id="collapseIcon" class="fa fa-caret-left custom_collapse" aria-hidden="true"></i>
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
        active: true,
        search: '',
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

  mounted: function()
  {
    this.$parent.$on('toggleNav', () => {
      this.active = !this.active
    })
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
        return (
          this.group_roi.sort(function (a, b)
          {
            return strCompare(a.title, b.title);
          }),
          this.group_roi.filter(post => {
            return post.title.toLowerCase().includes(this.search.toLowerCase())
          })
        )
      },
      groupsCPA: function ()
      {
        return (
          this.group_cpa.sort(function (a, b)
          {
            return strCompare(a.title, b.title);
          }),
          this.group_cpa.filter(post => {
            return post.title.toLowerCase().includes(this.search.toLowerCase())
          })
        )
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
        else {
          this.kind_regress = 0;
          this.optimizer_list = list.slice();
        }
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
        if(!grp.collapsed){
          document.getElementById(grp.id).className = "fa fa-angle-down";
        }else if(grp.collapsed){
          document.getElementById(grp.id).className = "fa fa-angle-up";
        }
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
      },
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
      removeElement: function(event)
      {
        event.target.parentElement.setAttribute('style', 'display: none');
      },

      toggleNav: function(event) {
        this.$parent.$emit('toggleNav');
        if (this.active) {
          document.getElementById('collapseIcon').className = "fa fa-caret-left custom_collapse";
          event.target.parentElement.setAttribute('style', 'height: 100%');
        } else {
          document.getElementById('collapseIcon').className = "fa fa-caret-right custom_collapse";
          event.target.parentElement.setAttribute('style', 'height: 89vh');
        }
      }
    }
}

</script>

<style>
  .campaigns_screen
  {
    display: flex;
    width: 100%;
  }

  .campaign_sidebar_wrapper
  {
    display: flex;
  }

  .sidebar_collapse
  {
    background: #4585cc;
    margin: auto;
    height: 100%;
    width: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #555;
  }

  .custom_collapse
  {
    font-size: 30px;
    color: white;
  }
  .group_title
  {
    text-align: center;
    font-weight: bold;
    background-color: #F6DBA3;
    display: flex;
    padding: 0 5px 3px 5px;
    border-bottom: 1px solid #999;
    position: relative;
  }

  .group_title input
  {
    vertical-align: middle;
  }

  .group_title .cus_remove
  {
    position: absolute;
    right: 5px;
    top: 3px;
  }

  .group_name
  {
    /* flex: 1 1 auto; */
    cursor: pointer;
    padding-left: 80px;
  }

  .camp_group li
  {
    padding: 0 5px;
    white-space: nowrap;
  }

  .campaign_left
  {
    display: none;
    flex-direction: column;
    width: 300px;
  }

  .campaign_header
  {
    background: black;
    color: white;
    text-align: center;
  }

  .campaign_header h3
  {
    margin: 0px;
  }

  .tooltip
  {
    display: inline-block;
    float: right;
  }

  .active {
    display: flex;
  }

  .search-wrapper
  {
    position: relative;
    padding: 5px;
  }

  .search-wrapper label
  {
    position: absolute;
    font-size: 12px;
    color: rgba(0,0,0,.50);
    top: 8px;
    left: 12px;
    z-index: -1;
    transition: .15s all ease-in-out;
  }

  .search-wrapper input
  {
    width: 91%;
    padding: 4px 12px;
    color: rgba(0,0,0,.70);
    border: 0px;
    transition: .15s all ease-in-out;
    background: white;
    &:focus {
      outline: none;
      transform: scale(1.05);
      & + label  {
        font-size: 10px;
        transform: translateY(-24px) translateX(-12px);
      }
    }
    &::-webkit-input-placeholder {
        font-size: 12px;
        color: rgba(0,0,0,.50);
        font-weight: 100;
    }
  }

  .search-wrapper i
  {
    color: white;
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

  .tooltip-bottom img
  {
    display: inline-block;
    width: 20px;
    float: right;
  }

  .campaign_delete
  {
    position: absolute;
    right: 32px;
    top: 50%;
    transform: translateY(-40%);
    padding: 4px;
    font-size: 14px;
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

  .sidebar_tap_wrapper {
    margin: 5px;
  }

  .sidebar_tap_wrapper .roi_content
  {
    width: 49%;
    display: inline-block;
    position: relative;
    text-align: center;
    vertical-align: middle;
    padding: 5px;
    background: #ed9999;
    border-radius: 7px;
  }

  .sidebar_tap_wrapper .cpa_content
  {
    width: 49%;
    display: inline-block;
    position: relative;
    text-align: center;
    vertical-align: middle;
    padding: 5px;
    background: #bbb;
    border-radius: 7px;
    border: 1px solid #222;
  }

  input[type="radio"] {
    visibility: hidden;
  }

  .sidebar_tap_wrapper img
  {
    display: inline-block;
    margin-left: 6px;
    width: 20px;
    vertical-align: sub;
    float: right;
  }

  .sidebar_tap_wrapper label
  {
    width: 100%;
    position: absolute;
    left: 0px;
    font-size: 20px;
  }

  .campaign_panel
  {
    display: flex;
    flex-direction: column;
    padding: 3px;
    min-height: 412px;
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
    padding: 15px 15px 15px 10px;
  }

  .campaign_actual .collapse .collapse-header{
    background-color: lightblue !important;
  }

  .collapse .collapse-header::before{
    left: auto !important;
    right: 0px;
  }

  .group_title .collapse-header{
    padding: 0 !important;
    background: inherit !important;
  }

  .custom-help
  {
    position: absolute;
    bottom: 17px;
    right: 79px;
  }

  @media screen and (max-width:480px) {
    .campaigns_screen
    {
      display: flex;
      width: 100%;
      height: 100%;
      flex-direction: column;
      overflow: scroll;
      align-items: center;
      padding: 20px;
      margin-bottom: 20px;
    }
    .campaign_center
    {
      flex: none;
      overflow: inherit;
      margin-top: 20px;
    }
    .no_list
    {
      max-height: 200px;
      overflow: scroll;
    }
  }
</style>
