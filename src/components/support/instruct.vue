<template>
  <div class="wrapper">
    <div class="explain">
      <div class="help_panel">
        <div class="help_title">
          <img src="~@/img/help.svg" width="32" />
          <b><u>Steps for Importing Data</u></b>
        </div>
        <ol>
          <li>Within <a href="https://adwords.google.com/">AdWords</a> Navigate to the reporting section and select <b>predefined reports</b> (in the old AdWords interface this is found under the <b>dimension</b> tab)</li>
          <li>Set the report to <b>Time &raquo; Day</b></li>
          <li>Have <b>4</b> (and <b>only 4</b>) column headings setup in the following order: <b>Day</b>, <b>Campaign</b>, <b>Cost</b>, <b>All Conv. Value</b> OR <b>Conversions</b>
            <ol type="a">
              <li><b>All Conv. Value</b> is your revenue figure, you can switch it for <b>total conv. Value</b></li>
              <li>Choose either the <b>Conv. Value</b> metric or the <b>Conversions</b> metric but not both. This depends on whether you are optimising for a <b>high ROI</b> or a <b>low CPA</b>. Decide on <u>ONE.</u></li>
            </ol>
          </li>
          <li>Set Date Range – Ideally at least <b>3 months</b> back</li>
          <li>Export as <b>.CSV</b></li>
          <li>Navigate to the <a href="#/import">import page</a></li>
          <li>If you downloaded <b>Conv. Value</b> (revenue) use revenue side column, if you downloaded <b>conversion data</b> use conversion side column – they are identical</li>
          <li>Select <b>Choose file</b>, give this group an identifying name and then select upload</li>
          <li>Navigate to the <a href="#/campaigns">campaigns page</a></li>
          <li>Select the campaigns you wish to analyse and click the blue button at the top to optimize</li>
        </ol>
      </div>
    </div>
    <div>&nbsp;<br/>&nbsp;</div>
    <div class="video">
      <div v-for="item in videos" class="center">
        <h3>{{ item.title }}</h3>
        <iframe :src="'https://www.youtube.com/embed/'+item.video" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  </div>

</template>

<script>
import AJAX from '@/tool/ajax'
import Plyr from '@/lib/plyr_patched' // patched for TITLE
require('plyr/dist/plyr.css');

export default
{
  data: function ()
  {
    var a =
      {
        videos: [],
        def_video:
        {
          title: 'Example',
          video: 'bTqVqk7FSmY'
        }
      };
    return a;
  },
  created: function ()
  {
    this.fetchData();
  },
  methods:
    {
      fetchData: function ()
      {
        AJAX.ajax_get(this,'api/contact/country.php',
          function (resp)
          {
            if(resp.video) this.videos = resp.video;
              else this.videos = [this.def_video];
            this.$nextTick(function ()
            {
              Plyr.setup({
                tooltips:
                  {
                    controls: true,
                    seek: true
                  }
              });
            });
          },
          function (stat, resp)
          {
          }
        );
      }
    }
}
</script>

<style>

  .wrapper
  {
    flex: 2;
    margin-left: 10px;
  }

  .video
  {
    width: 100%;
  }

  .video > *
  {
    width: 32%;
    display: inline-block;
    margin-left: 5px;
  }

  .video .center iframe {
    width: 100%;
  }

  .plyr__time
  {
    background-color: black;
  }

  .explain
  {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .help_panel
  {
    background-color: #FFFFF0;
    border: 2px dotted #DD6600;
    border-radius: 6px;
    padding: 5px;
    margin-top: 2rem;
    color: #000;
    display: flex;
    flex-direction: column;
  }

  .help_panel ol
  {
    padding: 0 32px;
  }

  .help_title
  {
    text-align: center;
  }

  .help_title img
  {
    vertical-align: middle;
    margin: 6px;
  }

  @media only screen and ( max-width: 1023px ) {
    .wrapper
    {
      margin-left: 0px;
    }
  }


</style>
