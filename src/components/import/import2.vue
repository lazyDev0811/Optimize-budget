<template>
  <div class="margin_box">
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <div class="center_screen error_message" v-if="!($root.info && $root.info.confirmed)">
      Forbidden - you have not confirmed your email address.<br/>
      Confirm your e-mail or <a href="#/profile" class="link">re-issue</a> new activation.
    </div>
    <div class="center" v-if="unpaid">
      <b style="color:#E528B0">Warning</b><br/>You have reached the upper limit for our <b>Free Plan</b>.
      <br/>Please <a href="#/upgrade" class="link">upgrade</a> to our paid subscription (<b>10 USD</b>/month) for <u>unlimited</u> campaigns.
    </div>
    <div class="import_container full_width">
      <div class="kind_panel" v-if="$root.info && $root.info.confirmed">
          <button type="button" class="btn-api" @click="connectROIAPI">Import Campaigns <br/>via API</button>
          <button type="button" class="btn-csv" >Upload CSV</button>  
      </div>

      <div class="campaign_panel" v-if="$root.info && $root.info.confirmed">
        <button type="button" class="btn-con" >Conversion Data <br/>(Optimise for CPA)</button>
        <button type="button" class="btn-rev" >Revenue Data <br/>(Optimise for ROI)</button>
        <button type="button" class="btn-both" >Both</button>    
      </div>

      <div class="file_panel" v-if="$root.info && $root.info.confirmed">
        <input type="file" id="file_roi_old" class="file" accept=".csv,.xlsx" ref="file_old_roi" @change="oldFileROI" />
        <div class="center"><label for="file_roi_old" class="file">Choose Files</label></div>
        <input type="text" id="account_name" class="txt_account" placeholder="Account Name"/>
        <select v-model="industry_id" class="file_industry">
          <option value="0" disabled>-- Choose industry --</option>
          <option v-for="item in list_industry" :value="item.id">{{ item.title }}</option>
        </select>
      </div>

      <div class="import_panel" v-if="$root.info && $root.info.confirmed">
        <div class="campaigns">
          <div class="camp_status">
            <div>
              <input type="checkbox" id="account_name" class="txt_account"/>
              <label for="subscribeNews">All Campaigns</label>
            </div>
            <div>
              <input type="checkbox" id="account_name" class="txt_account"/>
              <label for="subscribeNews">Only active Campaigns</label>
            </div>
          </div>

          <div class="camp_types">
            <div>
              <input type="checkbox" id="account_name" class="txt_account"/>
              <label for="subscribeNews">Search Campaigns</label>
            </div>
            <div>
              <input type="checkbox" id="account_name" class="txt_account"/>
              <label for="subscribeNews">Display Campaigns</label>
            </div>
            <div>
              <input type="checkbox" id="account_name" class="txt_account"/>
              <label for="subscribeNews">Video Campaigns</label>
            </div>
            <div>
              <input type="checkbox" id="account_name" class="txt_account"/>
              <label for="subscribeNews">Shopping Campaigns</label>
            </div>
          </div>
        </div>

        <div>
            <select v-model="industry_id" class="camp_industry">
              <option value="0" disabled>-- Choose industry --</option>
              <option v-for="item in list_industry" :value="item.id">{{ item.title }}</option>
            </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
import { strCompare } from '@/tool/util'
import { clearFileInput } from '@/tool/util_file'
require('@/css/panel.css');
require('@/css/style.css');

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
        unpaid: false,
        campaign_roi: [],
        campaign_cpa: [],
        cpa_client_customer_id: null,
        roi_client_customer_id: null,
        group_roi: [],
        group_cpa: [],
        new_roi: '', // name for the new campaign
        new_cpa: '', // name for the new campaign
        old_roi: 0, // ID of the old campaign
        old_cpa: 0, // ID of the old campaign
        industry_id: '0',
        file_roi_new: [],
        file_roi_old: [],
        file_cpa_new: [],
        file_cpa_old: [],
        list_industry: [],
        no_multi_roi: false, // TRUE = treat files with multiple campaigns as files with single-campaign
        combine_roi: false, // TRUE = combine all files into one campaign, group name is the name of this campaign
        no_multi_cpa: false, // TRUE = treat files with multiple campaigns as files with single-campaign
        combine_cpa: false, // TRUE = combine all files into one campaign, group name is the name of this campaign
      };
    return a;
  },
  created: function()
  {
    this.fetchData();
    this.fetchIndustry();
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
      }
    },
  methods:
    {
      refreshInfo: function (arr)
      {
        this.unpaid = arr.unpaid;
        if(isObject(arr.campaign_roi)) this.campaign_roi = arr.campaign_roi;
          else this.campaign_roi = [];
        if(isObject(arr.campaign_cpa)) this.campaign_cpa = arr.campaign_cpa;
          else this.campaign_cpa = [];
        if(isArray(arr.groups_roi) && arr.groups_roi.length) this.group_roi = arr.groups_roi;
          else this.group_roi = [];
        if(isArray(arr.groups_cpa) && arr.groups_cpa.length) this.group_cpa = arr.groups_cpa;
          else this.group_cpa = [];
      },
      fetchData: function()
      {
        AJAX.ajax_get(this,"api/campaign/list.php", this.refreshInfo,
          function(stat,resp)
          {
            make_error.call(this,resp);
          }
        );
      },
      fetchIndustry: function()
      {
         AJAX.ajax_get(this,'api/login/industry.php',
          function(resp)
          {
            if(isArray(resp)) this.list_industry = resp;
          },
          function(stat,resp)
          {
            // this.cant_signup = resp;
            // this.$refs.username.focus();
          }
        );
      },
      doUpload: function (operation, kind, file_list, campaign_id, campaign_name)
      {
        if(operation==1 && campaign_name.trim()=='') make_error.call(this,'Missing group name');
        else if(operation!=1 && campaign_id==0) make_error.call(this,'Please choose a campaign');
        else if(file_list.length!=0)
        {
          var i, payload = new FormData(), len = file_list.length;
          for(i = 0; i < len; i++)
          {
            payload.append('excel_'+i,file_list[i]);
          }

          AJAX.ajax_post(this,"api/campaign/import.php?kind="+kind
            +"&operation="+operation
            +"&id="+campaign_id
            +"&no_multi="+((kind==1 ? this.no_multi_roi : this.no_multi_cpa) ? '1' : '0')
            +"&combine="+((kind==1 ? this.combine_roi : this.combine_cpa) ? '1' : '0')
            +"&name="+encodeURIComponent(campaign_name || ''),
            function (resp)
            {
              this.is_warn = false;
              this.warn_text = 'Data was successfully imported - '+resp.imported+' records';
              this.refreshInfo(resp);
              if(kind==1)
              {
                if(operation==1)
                {
                  this.new_roi = '';
                  this.file_roi_new = [];
                  clearFileInput(this.$refs.file_new_roi);
                }
                else
                {
                  this.old_roi = 0;
                  this.file_roi_old = [];
                  clearFileInput(this.$refs.file_old_roi);
                }
              }
              else
              {
                if(operation==1)
                {
                  this.new_cpa = '';
                  this.file_cpa_new = [];
                  clearFileInput(this.$refs.file_new_cpa);
                }
                else
                {
                  this.old_cpa = 0;
                  this.file_cpa_old = [];
                  clearFileInput(this.$refs.file_old_cpa);
                }
              }
            },
            function (stat,resp)
            {
              make_error.call(this,resp);
            },
            payload
          )
        }
      },
      connectAPI: function (data_type)
      {
        var customer_id = data_type == 1 ? this.roi_client_customer_id : this.cpa_client_customer_id;
        // AJAX.ajax_get(this,"api/google/connect_api.php?data_type=" + data_type + "&customer_id=" + customer_id,
        //     function (resp)
        //     {
        //       window.open(resp.url, '_self');
        //     },
        //     function (stat,resp)
        //     {
        //       make_error.call(this,resp);
        //     }
        //   )

        AJAX.ajax_get(this,"api/google/connect_api.php?data_type=" + data_type,
            function (resp)
            {
              window.open(resp.url, '_self');
            },
            function (stat,resp)
            {
              make_error.call(this,resp);
            }
          )
      },
      connectROIAPI: function ()
      {
        // if(!this.roi_client_customer_id) make_error.call(this,'Missing client customer id');
        // else this.connectAPI(1);
        this.connectAPI(1);
      },
      connectConversionAPI: function ()
      {
        if(!this.cpa_client_customer_id) make_error.call(this,'Missing client customer id');
        else this.connectAPI(2);
      },
      sortedROI: function (grp)
      {
        return this.campaign_roi[grp.id].slice().sort(function (a,b)
        {
          return strCompare(a.title.toLocaleLowerCase(),b.title.toLocaleLowerCase());
        });
      },
      sortedCPA: function (grp)
      {
        return this.campaign_cpa[grp.id].slice().sort(function (a,b)
        {
          return strCompare(a.title.toLocaleLowerCase(),b.title.toLocaleLowerCase());
        });
      },
      uploadROI: function ()
      {
        this.doUpload(1,1,this.file_roi_new,0,this.new_roi);
      },
      uploadCPA: function ()
      {
        this.doUpload(1,2,this.file_cpa_new,0,this.new_cpa);
      },
      appendROI: function ()
      {
        this.doUpload(2,1,this.file_roi_old,this.old_roi);
      },
      appendCPA: function ()
      {
        this.doUpload(2,2,this.file_cpa_old,this.old_cpa);
      },
      updateROI: function ()
      {
        this.doUpload(3,1,this.file_roi_old,this.old_roi);
      },
      updateCPA: function ()
      {
        this.doUpload(3,2,this.file_cpa_old,this.old_cpa);
      },
      replaceROI: function ()
      {
        this.doUpload(4,1,this.file_roi_old,this.old_roi);
      },
      replaceCPA: function ()
      {
        this.doUpload(4,2,this.file_cpa_old,this.old_cpa);
      },
      newFileROI: function (e)
      {
        this.file_roi_new = e.target.files || e.dataTransfer.files;
      },
      oldFileROI: function (e)
      {
        this.file_roi_old = e.target.files || e.dataTransfer.files;
      },
      newFileCPA: function (e)
      {
        this.file_cpa_new = e.target.files || e.dataTransfer.files;
      },
      oldFileCPA: function (e)
      {
        this.file_cpa_old = e.target.files || e.dataTransfer.files;
      },
    }
}

function make_error(err)
{
  this.is_warn = true;
  this.warn_text = err;
}
</script>

<style>
  .import_container
  {
    /* display: flex; */
    /* justify-content: center; */
  }

  .margin_box
  {
    margin: 12px;
  }

  .kind_panel, .campaign_panel, .file_panel, .import_panel{
    margin: 0px 50px 30px;
  }

  .kind_panel{
    background: #eee;
    display: flex;
    justify-content: space-around;  
  }

  .kind_panel button{
    background-color: #25d6cefa;
    color: white;
    margin: 100px 10px;
    width: 45%;
    border-radius: 10px;
  }

  .kind_panel .btn-csv{
    background-color:#d65625ba
  }

  .campaign_panel{
    background: #eee;
    display: flex;
    padding: 100px;
  }

  .campaign_panel button{
    background-color: #25d6cefa;
    color: white;
    margin: 20px;
    width: 100%;
    border-radius: 10px;
  }

  .campaign_panel .btn-rev{
    background-color: #d65625ba;
  }

  .campaign_panel .btn-both{
    background-color: #d68f258f;
  }

  .file_panel, .import_panel{
    background: #eee;
    padding: 100px;
  }

  .import_panel .campaigns{
    display: flex;
    justify-content: space-around;
  }

  .camp_status, .camp_types{
    background-color: #25d6cefa;
    padding: 10px;
    border-radius: 10px;
  }
  .panel_title
  {
    margin: 0;
    padding: 2px 12px;
    background-color: #bbb;
  }

  .new_campaign
  {
    color: #000;
    border: 1px solid #111;
    text-align: left;
  }

  .new_campaign legend
  {
    padding: 0.2em;
    border-radius: 5px;
    background-color: #259AD6;
    color: white;
    margin-bottom: 5px;
  }

  .new_campaign label
  {
    display: block;
    margin-top: 4px;
  }

  .new_campaign input[type="checkbox"]
  {
    vertical-align: baseline;
  }

  input.file
  {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  label.file
  {
    display: block;
    background-color: #999;
    color: white;
    height: 2rem;
    padding: 5px 25px;
    margin: 12px 0 0 0;
    line-height: 1.5;
    cursor: pointer;
  }

  .help
  {
    background-color: #FFFFF0;
    border: 1px dotted #DD6600;
    border-radius: 6px;
    padding: 5px;
    color: #000;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .bg_cols
  {
    background-color: bisque;
    padding: 0 4px 3px;
  }

  .example_file
  {
    text-decoration: none;
    color: white;
    background-color: #5cb85c;
    border-radius: 3px;
    padding: 0 6px 2px;
  }

  .example_file:hover
  {
    font-weight: bold;
  }

  @media screen and (max-width: 420px) {
    .import_container
    {
      display: block;
    }
  }

</style>
