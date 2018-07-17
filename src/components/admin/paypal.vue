<template>
  <div class="field">
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <h2 align="center">Subscription plans</h2>
    <table align="center" class="acc_stat">
      <thead>
        <tr>
          <th>Subscription Name</th>
          <th>Description</th>
          <th>Payment Name</th>
          <th>Payment frequency</th>
          <th>Amount</th>
          <th>Currency</th>
          <th>Max failed billing attempts</th>
          <th>Action</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr bgcolor="#dcdcdc">
          <td>
            <input type="text" v-model.trim="plan_name" minlength="3" required class="full_width" title="Monthly billing for Budget Optimize"/>
          </td>
          <td>
            <input type="text" v-model.trim="plan_desc" minlength="5" required class="full_width" title="Monthly Subscription for the One Egg AdWords budget optimizer"/>
          </td>
          <td>
            <input type="text" v-model.trim="pay_name" minlength="3" required class="full_width" placeholder="Regular Payments"/>
          </td>
          <td>
            <select v-model="freq" class="full_width" required>
              <option v-for="freqs in freq_list" :value="freqs">{{ freqs }}</option>
            </select>
          </td>
          <td>
            <input type="number" min="1" max="1000" required v-model.trim.number="amount" class="full_width"/>
          </td>
          <td>
            <select v-model="currency" class="full_width" required>
              <option v-for="curr in curr_list" :value="curr">{{ curr }}</option>
            </select>
          </td>
          <td>
            <select v-model="max_fail" class="full_width" required>
              <option value="0">Infinite</option>
              <option value="1">Once</option>
              <option value="2">Twice</option>
              <option value="3">Triple</option>
            </select>
          </td>
          <td align="center">
            <button class="btn btn_yes" @click="newPlan">Create</button>
          </td>
          <td>&nbsp;</td>
        </tr>
      </tbody>
      <tfoot>
        <tr v-for="item in plans">
          <td>{{ item.name }}</td>
          <td>{{ item.description }}</td>
          <td>{{ item.paydef }}</td>
          <td align="center">{{ item.frequency }}</td>
          <td align="right">{{ (+item.amount).toFixed(2) }}</td>
          <td align="center">{{ item.currency }}</td>
          <td align="center">{{ item.max_fail }}</td>
          <td align="center">
            <button class="btn btn_dark" @click="planDuplicate(item)">Duplicate</button>
          </td>
          <td align="center">
            <button class="btn btn_no" v-if="!item.active" @click="planActive(item)">Activate</button>
            <span v-else>Active</span>
          </td>
        </tr>
      </tfoot>
    </table>
    <h2 align="center">Web hooks</h2>
    <table align="center" class="acc_stat">
      <thead>
        <tr>
          <th>ID</th>
          <th>URL</th>
          <th>Events</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr bgcolor="#dcdcdc">
          <td>&nbsp;</td>
          <td>{{ window.location.href }}/api/paypal/web_hook.php</td>
          <td>
            <ul>
              <li>BILLING.SUBSCRIPTION.CREATED</li>
              <li>BILLING.SUBSCRIPTION.CANCELLED</li>
              <li>BILLING.SUBSCRIPTION.RE-ACTIVATED</li>
              <li>BILLING.SUBSCRIPTION.SUSPENDED</li>
            </ul>
          </td>
          <td align="center">
            <button class="btn btn_yes" @click="newHook">Create</button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr v-for="item in hooks">
          <td>{{ item.id }}</td>
          <td>{{ item.url }}</td>
          <td>
            <ul>
              <li v-for="event in item.event_types">{{ event.name }}</li>
            </ul>
          </td>
          <td align="center">
            <button class="btn btn_no" @click="hookDelete(item)">Delete</button>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
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
  methods:
    {
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
