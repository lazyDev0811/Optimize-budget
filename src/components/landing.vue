<template>
  <div class="landing_wrapper">
    <div class="land_header">
      <div class="container_left">
        <div :id="'graph'+_uid" class="graph_panel"></div>
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
      <div class="container_right">
        <h2>Optimize Budget allocation, forecast performance & predict results with Machine Learning</h2>
        <div class="slider_panel">
          <label>See how it works:</label>
          <input type="range" min="0" max="5000" step="0.01" v-model="var_cost" class="slider no_bord"/>
          <div class="create_content"><a class="login btn create_account" href="#/signup" @click="func1()">Create a free account</a></div>
        </div>
      </div>
    </div>
    <div class="text_content">
      <br/>
      <h1>Budget Optimize can answer these questions::</h1>
      <ul>
        <li>What should I spend for my campaign to achieve it's optimal ROI or CPA?</li>
        <li>How should I allocate budgets between my campaigns to achieve an overall optimal ROI outcome?</li>
        <li>My campaign is currently spending $x per day, if I was to increase to $y / day, what kind of Revenue & ROI/CPA change should I expect?</li>
      </ul>
      <br/>
    </div>
    <div class="word_content">
      <br/>
      <h1>What our customers say</h1>
    </div>
    <div class="video_panel" id="feature">
      <div v-for="item in video_list" class="youtube-player">
        <h3>{{ item.title }}</h3>
        <iframe :src="'https://www.youtube.com/embed/'+item.video" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
    <div class="sample_optimize">
      <div>
        <h1>Map campaigns using regression models to find optimal performance</h1>
        <img class="first_img" src="~@/img/graR.png"/>
      </div>
      <div>
        <h1>Forecast performance with increased budgets</h1>
        <img class="second_img" src="~@/img/CalR.png" />
      </div>
      <div>
        <h1>Find optimal campaign budget allocation that you can plug back into your account</h1>
        <img class="third_img" src="~@/img/oR.png"/>
      </div>
    </div>
  </div>
</template>

<script>
require('@/css/range.scss');

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
      ],
      var_cost: 0,
    };
    return a;
  },
  methods:
    {
      start_video(item)
      {
        if(!item.clicked) this.$set(item,'clicked',true);
      },
    }
}

</script>

<style scoped>
  .landing_wrapper
  {
    /* display: flex;
    justify-content: center;
    padding: 0 50px;
    align-items: flex-start; */
  }

  .land_header
  {
    display: flex;
    padding: 10px;
    background: #eee;
    margin: 30px 10px 0px 10px;
  }

  .container_left, .container_right
  {
    flex: 1;
    padding: 10px 20px;
  }

  .container_right h2
  {
    margin: 20px 40px;
    text-align: center;
    font-weight: bold;
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

  .text_content, .word_content
  {
    margin: 10px;
    background: #eee;
    padding: 10px;
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

  .slider_panel
  {
    text-align: center;
    width: 90%;
    margin: 0 auto;
  }

  .no_bord
  {
    border: none;
    padding: 0;
    background-color: transparent;
  }

  .create_content
  {
    margin-top: 50px;
  }

  .create_account
  {
    background-color: #d7e4cf;
    color: black;
    padding: 15px 30px;
  }

  .sample_optimize
  {
    display: flex;
    background: #eee;
    margin: 50px 10px;
    padding: 10px;
  }

  .sample_optimize div
  {
    flex: 1;
    text-align: center;
    margin: 20px auto;
    padding: 20px;
  }
  .sample_optimize div img
  {
    width: 300px;
  }

  .sample_optimize .first_img
  {
    margin-top: 53px;
  }

  .sample_optimize .second_img
  {
    margin-top: 96px;
  }


  @media screen and (max-width: 420px) {
    .landing
    {
      display: block;
      padding: 0px;
    }

    .video_panel{
      flex-direction: column;
      align-items: center;
    }

  }

</style>
