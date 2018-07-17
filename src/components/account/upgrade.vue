<template>
  <div class="center_screen panel">
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <!--
    <template v-if="$root.info.is_admin">
      <div>As an <b>Administrator</b> you can neither subscribe nor unsubscribe for the Paid Plan.</div>
    </template>
    -->
    <template v-if="cancelled || !subscribed">
      <div>
        You are currently using our <b>Free Plan</b>.
        <p>With its limit of up to <b>10</b> campaigns it is primarily intended to get you an idea about our platform and how you can benefit by using it.<br/>
          For a more effective use of the platform we encourage you to become a paid subscriber - for <b>10 USD/month</b> you will be able to optimize the budget of unlimited number of campaigns.</p>
        <p>You may cancel your subscription at any time - your data will stay intact until you renew the subscription. If you cancel in the middle of your 30-day billing cycle -<br/>
          your subscription will remain active until the end of the billing cycle.</p>
      </div>
      <br/>
      <div class="center">You will be redirected to the PayPal website.</div>
      <form action="api/paypal/upgrade.php" method="POST" class="center" target="_blank">
        <button type="submit" class="btn_yes">Upgrade</button>
      </form>
    </template>
    <template v-else>
      <div>
        You are currently using our <b>Paid Subscription Plan</b>.
        <p>You are able to optimize the budget of unlimited number of campaigns.</p>
        <p>You may cancel your subscription at any time - your data will stay intact until you renew the subscription. If you cancel in the middle of your billing cycle -<br/>
          the subscription will remain active until the end of the billing cycle.</p>
      </div>
      <br/>
      <form action="api/paypal/downgrade.php" method="POST" class="center" target="_blank">
        <button type="submit" class="btn_no">Downgrade</button>
      </form>
    </template>
  </div>
</template>

<script>
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
require('@/css/panel.css');

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
        subscribed: false,
        cancelled: false
      };
    return a;
  },
  created: function()
  {
    this.fetchData();
  },
  methods:
    {
      fetchData: function()
      {
        AJAX.ajax_get(this,'api/login/get_profile.php',
          function(resp)
          {
            this.subscribed = (resp.subscribe_on!=null && resp.subscribe_on!='');
            this.cancelled = (resp.cancel_on!=null && resp.cancel_on!='');
          },
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      },
    }
}
</script>

<style>
</style>
