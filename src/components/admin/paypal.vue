<template>
  <div class="field">
    <h1>Plans & Prices</h1>

    <form class = "prices__period__selector" >
      <label class = "prices__period">
        <input type = "radio" id="month" name = "period" value = "month" @click = "changeState" v-model="price_value" />
        Monthly Plans
      </label>
      <label class = "prices__period">
        <input type = "radio" name = "period" value = "year" @click = "changeState"  v-model = "price_value"  />
        Annual Plans, Save up to $800
      </label>
    </form>

    <div class = "prices__header__plans">
      <div class = "prices__plan">
        <h3>Pro</h3>
        <div  v-if = "price_state">
          <div class = "prices__plan__price">
            <span class = "price__amount">$99<span class = "cents">.95</span></span>
            <span class = "price__period">monthly</span>
          </div>
          <p>
            <span class = "s-btn__text" >
            Subscribe
            </span>
          </p>
        </div>
        <div  v-else = "">
          <div class = "prices__plan__price -old">
            <span class = "price__amount">$1199</span>
          </div>
          <div class = "prices__plan__price" >
            <span class = "price__amount">$999<span class = "cents">.40</span></span>
            <span class = "price__period">annual</span>
          </div>
          <p>
            <span data-ga-event-onclick = "" data-ga-category = "page:prices" data-ga-action="button.click:subscribe-annual" data-ga-label="pro">
              <span class = "s-btn__text">
              Subscribe
              </span>
            </span>
          </p>
        </div>
        <hr>
        <div class = "prices__plan__content">
          <p class = "prices__plan__description">
            For freelancers, startups and in-house marketers with limited budget</p>
          <p>Run your SEO, PPC, SMM and content projects with 28 advanced tools.</p> 
          <p>Know your competitors’ traffic sources, rankings, social media results &amp; more.</p>
        </div>
        <p>
          <a href = "#plans_comparison" class = "link">
           See a full plan comparison
          </a>
        </p>
      </div>
      <div class = "prices__plan -featured">
        <h3>Guru</h3>
        <div v-if = "price_state">
          <div class = "prices__plan__price">
            <span class = "price__amount">$199<span class = "cents">.95</span></span>
            <span class = "price__period">monthly</span>
          </div>
          <p>
            <span class = "s-btn__text">
            Subscribe
            </span>
          </p>
        </div>
        <div v-else = "">
          <div class = "prices__plan__price -old">
            <span class = "price__amount">$2399</span>
          </div>
          <div class = "prices__plan__price">
            <span class = "price__amount">$1999<span class = "cents">.40</span></span>
            <span class = "price__period">annual</span>
          </div>
          <p>
            <span data-ga-event-onclick="" data-ga-category = "page:prices" data-ga-action="button.click:subscribe-annual" data-ga-label = "guru">
              <span class = "s-btn__text">
              Subscribe
              </span>
            </span>
          </p>
        </div>
        <hr>
        <div class = "prices__plan__content">
          <p class = "prices__plan__description">
          For SMB and growing marketing agencies</p>
          <p>All the Pro features plus:</p>
          <ul> 
            <li>Branded reports</li> 
            <li>Historical Data</li> 
            <li>Extended limits</li> 
          </ul>
        </div>
        <p>
          <a href = "#plans_comparison" class = "link">
          See a full plan comparison
          </a>
        </p>
      </div>
      <div class = "prices__plan">
        <h3>Business</h3>
        <div v-if = "price_state">
          <div class = "prices__plan__price">
            <span class = "price__amount">$399<span class = "cents">.95</span></span>
            <span class = "price__period">monthly</span>
          </div>
          <p>
            <span class = "s-btn__text">
            Subscribe
            </span>
          </p>
        </div>
        <div v-else = "">
          <div class = "prices__plan__price -old">
            <span class = "price__amount">$4799</span>
          </div>
          <div class = "prices__plan__price">
            <span class = "price__amount">$3999<span class = "cents">.40</span></span>
            <span class = "price__period">annual</span>
          </div>
          <p>
            <span data-ga-event-onclick = "" data-ga-category = "page:prices" data-ga-action="button.click:subscribe-annual" data-ga-label="business">
              <span class="s-btn__text">
              Subscribe
              </span>
            </span>
          </p>
        </div>
        <hr>
        <div class = "prices__plan__content">
          <p class = "prices__plan__description">
          For agencies, E-commerce projects and businesses with extensive web presence</p>
          <p>All the Guru features plus:</p>
          <ul> 
            <li>White label reports</li> 
            <li>API access</li> 
            <li>Extended limits and sharing options </li> 
          </ul>
        </div>
        <p>
          <a href = "#plans_comparison" class = "link">
          See a full plan comparison
          </a>
        </p>
      </div>
      <div class = "prices__plan">
        <h3>Enterprise</h3>
        <div class = "prices__plan__price -enterprise">
        Need more?
        </div>
        <p>
          <span class = "s-btn__text">
          Contact us
          </span>
        </p>
        <hr>
        <div class = "prices__plan__content">
          <p>A custom solution to fit the marketing needs of your business:</p>
          <ul> 
            <li>Custom keyword databases</li>
            <li>Custom limits</li> 
            <li>Unlimited crawling of large websites</li> 
            <li>On-site trainings</li> 
            <li>And other add-on features upon request </li> 
          </ul>
        </div>
        <p>
          <a href = "#plans_comparison" class = "link">
          See a full plan comparison
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
<!-- <script type="text/javascript" src="../../index.563ae54c0a84.js"></script> -->

<script>
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
require('@/css/paypal.css');
require('@/css/account.css');
// require('@/css/paypal.js');

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
        price_value: "",
        price_state: true,
        is_warn: false,
        warn_text: '',
        plans: [],
        hooks: [],
        page: 0,
        num_pages: 1,
        plan_name: '',
        plan_desc: '',
        pay_name: '',
        freq: '',
        amount: 0,
        currency: '',
        max_fail: '',
        freq_list:
        [
          'Day',
          'Week',
          'Month',
          'Year'
        ],
        curr_list:
        [
          'USD',
          'AUD',
          'EUR'
        ],
        window: window
      };
    return a;
  },
  created: function()
  {
    this.fetchPlans();
    this.fetchHooks();
  },
  mounted: function()
  {
    this.initValues();
  },
  methods:
    {
      initValues: function()
      {
        document.getElementById("month").checked = true;
      },
      changeState: function()
      {
        if(this.price_value == "month")
          this.price_state = true;
        if(this.price_value == "year") 
          this.price_state = false;
        
      },
      fetchPlans: function()
      {
        // get details for the existing billing plans from PayPal
        AJAX.ajax_get(this,'api/paypal/plan_list.php?page='+this.page,
          function(resp)
          {
            if(isArray(resp.items)) this.plans = resp.items;
            this.num_pages = resp.pages;
          },
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      },
      newPlan: function()
      {
        // create new billing plan inside PayPal (and activate it)
        AJAX.ajax_post(this,'api/paypal/plan_new.php',
          function(resp)
          {
            this.is_warn = false;
            this.warn_text = 'A new billing plan with ID = '+resp.plan_id+' was created';
          },
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          },
          JSON.stringify({
            name: this.plan_name,
            description: this.plan_desc,
            paydef: this.pay_name,
            frequency: this.freq,
            amount: this.amount,
            currency: this.currency,
            max_fail: this.max_fail,
          })
        );
      },
      planDuplicate: function(plan)
      {
        // copy data to the form fields, simplifying the creation of a new plan
        this.plan_name = plan.name;
        this.plan_desc = plan.description;
        this.pay_name = plan.paydef;
        this.freq = plan.frequency;
        this.amount = plan.amount;
        this.currency = plan.currency;
        this.max_fail = plan.max_fail;
      },
      planActive: function(plan)
      {
        // mark the plan as preferred in our DB for new subscriptions
        AJAX.ajax_post(this,'api/paypal/plan_active.php?id='+encodeURIComponent(plan.id),
          function(resp)
          {
            this.is_warn = false;
            this.warn_text = 'The plan with ID = '+plan.id+' will be used for new subscribers';
            this.plans = this.plans.map(function(item)
            {
              item.active = (item.id == plan.id);
              return item;
            });
          },
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      },
      fetchHooks: function()
      {
        // get details for the existing billing plans from PayPal
        AJAX.ajax_get(this,'api/paypal/webhook_list.php',
          function(resp)
          {
            if(isArray(resp)) this.hooks = resp;
          },
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      },
      hookDelete: function(hook)
      {
        AJAX.ajax_get(this,'api/paypal/webhook_delete.php?id='+encodeURIComponent(hook.id),
          function(resp)
          {
            this.is_warn = false;
            this.warn_text = 'Web hook was successfully removed';
            this.hooks.splice(this.hooks.indexOf(hook),1);
          },
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      },
      newHook: function()
      {
        AJAX.ajax_get(this,'api/paypal/webhook_new.php',
          function(resp)
          {
            this.hooks.push({
              id: resp.hook_id,
              url: resp.url,
              event_types:
              [
                {name:'BILLING.SUBSCRIPTION.CREATED'},
                {name:'BILLING.SUBSCRIPTION.CANCELLED'},
                {name:'BILLING.SUBSCRIPTION.RE-ACTIVATED'},
                {name:'BILLING.SUBSCRIPTION.SUSPENDED'}
              ]
            });
          },
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      }
    }
}
</script>
