<template>
  <div class="landing">
    <div class="land_left">
      <div class="video_panel">
        <div v-for="item in video_list" class="youtube-player">
          <h3>{{ item.title }}</h3>
          <iframe :src="'https://www.youtube.com/embed/'+item.video" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
      <div>
        <br/><br/><br/>
        <h1>Answer questions like:</h1>
        <ul>
          <li>What should I spend for my campaign to achieve it's optimal ROI or CPA?</li>
          <li>How should I allocate budgets between my campaigns to achieve an overall optimal ROI outcome?</li>
          <li>My campaign is currently spending $x per day, if I was to increase to $y / day, what kind of Revenue & ROI/CPA change should I expect?</li>
        </ul>
        <br/><br/><br/>
      </div>
    </div>
    <div class="land_right">
      <div class="lang_right_container">
        <div class="graph_panel">
          <img src="~@/img/graph.svg" />
        </div>
        <div class="center">
          <div class="confident">
            Regression formula: <strong class="code">Y = 4766.53 * Ln(X) -29535.3</strong>
            <br/>
            Confidence of regression: <span class=""><strong class="code">R<span class="super">2</span> = 0.44</strong></span>
            <hr size="2" width="100%" color="#70AD47">
          </div>
        </div>
        <div class="center">Your optimal result for this campaign is:</div>
        <table align="center">
          <tr>
            <td align="right">Cost/day</td>
            <td>&nbsp;</td>
            <td align="center"><div class="const_field">1334.61</div></td>
          </tr>
          <tr>
            <td align="right">Revenue</td>
            <td>&nbsp;</td>
            <td align="center"><div class="const_field">4766.53</div></td>
          </tr>
          <tr>
            <td align="right">Max ROI</td>
            <td>&nbsp;</td>
            <td align="center"><div class="const_field">257.15%</div></td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>

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
      ]
    };
    return a;
  },
  methods:
    {
      start_video(item)
      {
        if(!item.clicked) this.$set(item,'clicked',true);
      }
    }
}

</script>

<style scoped>
  .landing
  {
    display: flex;
    justify-content: center;
    padding: 0 50px;
    align-items: flex-start;
  }

  .land_left
  {
    flex: 1 1 70%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .land_right
  {
    flex: 1 1 30%;
    margin: 10px;
    text-align: center;
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

</style>
