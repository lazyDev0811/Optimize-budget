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
      <div class="panel" v-if="$root.info && $root.info.confirmed">
        <h2 class="panel_title">Importing <strong>Revenue</strong> data</h2>
        <div class="help">
          Only <strong>CSV</strong> and <strong>XLSX</strong> files are supported.<br/>
          Header is <u>optional</u>. All <u>non-empty</u> sheets will be processed.<br/>
          Cost and Revenue must <u>not</u> contain currency.<br/>
          The first <strong>3</strong> columns for files containing <strong>1 campaign</strong> must be:<br/>
          <span class="bg_cols">Day | Cost | Revenue</span> - in this order. <a href="Revenue_for_a_single_campaign.xlsx" class="example_file">Example</a><br/>
          The first <strong>4</strong> columns for files containing <strong>several campaigns</strong> must be:<br/>
          <span class="bg_cols">Day | Campaign Name | Cost | Revenue</span> - in this order. <a href="Revenue_for_several_campaigns.xlsx" class="example_file">Example</a><br/>
          <strong>Append</strong> = old data isn't touched, new data is added<br/>
          <strong>Update</strong> = old data is updated, new data is added<br/>
          <strong>Replace</strong> = old data is removed, new data is added<br/>
        </div>
        <br/>
        <fieldset class="new_campaign">
          <legend>&nbsp;New campaign&nbsp;</legend>
          <input type="text" class="full_width" v-model="new_roi" placeholder="Group name for campaign(s)"/>
          <label><input type="checkbox" v-model="no_multi_roi"/> Treat a file with multiple campaigns as a single campaign</label>
          <label><input type="checkbox" v-model="combine_roi"/> Combine multiple file uploads into 1 file for 1 campaign</label>
          <input type="file" id="file_roi_new" class="file" accept=".csv,.xlsx" ref="file_new_roi" @change="newFileROI" multiple/>
          <div class="center"><label for="file_roi_new" class="file full_width">Choose file(s)</label></div>
          <ol class="list" v-if="file_roi_new.length">
            <li v-for="item in file_roi_new">{{ item.name }}</li>
          </ol>
          <button type="button" class="btn-login block top_space" @click="uploadROI">UPLOAD</button>
        </fieldset>
        <h2 class="center">OR</h2>
        <fieldset class="new_campaign">
          <legend>&nbsp;Old campaign&nbsp;</legend>
          <select v-model="old_roi" class="full_width">
            <option value="0">- Select campaign -</option>
            <optgroup v-for="grp in groupsROI" :label="grp.title || 'NO GROUP'">
              <option v-for="item in sortedROI(grp)" :value="item.id">{{ item.title }}</option>
            </optgroup>
          </select>
          <input type="file" id="file_roi_old" class="file" accept=".csv,.xlsx" ref="file_old_roi" @change="oldFileROI" />
          <div class="center"><label for="file_roi_old" class="file full_width">Choose a file</label></div>
          <ol class="list" v-if="file_roi_old.length">
            <li v-for="item in file_roi_old">{{ item.name }}</li>
          </ol>
          <button type="button" class="btn-login block top_space" @click="appendROI">Append to existing data</button>
          <button type="button" class="btn-login block top_space" @click="updateROI">Update existing data</button>
          <button type="button" class="btn-login block top_space" @click="replaceROI">Replace existing data</button>
        </fieldset>
      </div>

      <div class="panel" v-if="$root.info && $root.info.confirmed">
        <h2 class="panel_title">Importing <strong>Conversion</strong> data</h2>
        <div class="help">
          Only <strong>CSV</strong> and <strong>XLSX</strong> files are supported.<br/>
          Header is <u>optional</u>. All <u>non-empty</u> sheets will be processed.<br/>
          Cost must <u>not</u> contain currency.<br/>
          The first <strong>3</strong> columns for files containing <strong>1 campaign</strong> must be:<br/>
          <span class="bg_cols">Day | Cost | Conversions</span> - in this order. <a href="Conversions_for_a_single_campaign.xlsx" class="example_file">Example</a><br/>
          The first <strong>4</strong> columns for files containing <strong>several campaigns</strong> must be:<br/>
          <span class="bg_cols">Day | Campaign Name | Cost | Conversions</span> - in this order. <a href="Conversions_for_several_campaigns.xlsx" class="example_file">Example</a><br/>
          <strong>Append</strong> = old data isn't touched, new data is added<br/>
          <strong>Update</strong> = old data is updated, new data is added<br/>
          <strong>Replace</strong> = old data is removed, new data is added<br/>
        </div>
        <br/>
        <fieldset class="new_campaign">
          <legend>&nbsp;New campaign&nbsp;</legend>
          <input type="text" class="full_width field" v-model="new_cpa" placeholder="Group name for campaign(s)"/>
          <label><input type="checkbox" v-model="no_multi_cpa"/> Treat a file with multiple campaigns as a single campaign</label>
          <label><input type="checkbox" v-model="combine_cpa"/> Combine multiple file uploads into 1 file for 1 campaign</label>
          <input type="file" id="file_cpa_new" class="file" accept=".csv,.xlsx" ref="file_new_cpa" @change="newFileCPA" multiple/>
          <div class="center"><label for="file_cpa_new" class="file full_width">Choose file(s)</label></div>
          <ol class="list" v-if="file_cpa_new.length">
            <li v-for="item in file_cpa_new">{{ item.name }}</li>
          </ol>
          <button type="button" class="btn-login block top_space" @click="uploadCPA">UPLOAD</button>
        </fieldset>
        <h2 class="center">OR</h2>
        <fieldset class="new_campaign">
          <legend>&nbsp;Old campaign&nbsp;</legend>
          <select v-model="old_cpa" class="full_width">
            <option value="0">- Select campaign -</option>
            <optgroup v-for="grp in groupsCPA" :label="grp.title || 'NO GROUP'">
              <option v-for="item in sortedCPA(grp)" :value="item.id">{{ item.title }}</option>
            </optgroup>
          </select>
          <input type="file" id="file_cpa_old" class="file" accept=".csv,.xlsx" ref="file_old_cpa" @change="oldFileCPA" />
          <div class="center"><label for="file_cpa_old" class="file full_width">Choose a file</label></div>
          <ol class="list" v-if="file_cpa_old.length">
            <li v-for="item in file_cpa_old">{{ item.name }}</li>
          </ol>
          <button type="button" class="btn-login block top_space" @click="appendCPA">Append to existing data</button>
          <button type="button" class="btn-login block top_space" @click="updateCPA">Update existing data</button>
          <button type="button" class="btn-login block top_space" @click="replaceCPA">Replace existing data</button>
        </fieldset>
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
        group_roi: [],
        group_cpa: [],
        new_roi: '', // name for the new campaign
        new_cpa: '', // name for the new campaign
        old_roi: 0, // ID of the old campaign
        old_cpa: 0, // ID of the old campaign
        file_roi_new: [],
        file_roi_old: [],
        file_cpa_new: [],
        file_cpa_old: [],
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
    display: flex;
    justify-content: center;
  }

  .margin_box
  {
    margin: 12px;
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

</style>
