<template>
  <div class="login_panel center_screen">
    <div class="logo_big">
      <img src="~@/img/logo.svg" alt="Logo" height="40"/>
    </div>

    <form class="inline" @submit.prevent="doSave">
      <h2>My profile</h2>
      <div class="field relative">
        <i class="icon_user"></i>
        <input type="text" class="full_width" name="user_name" placeholder="Username" v-model="username" disabled />
      </div>
      <div class="field relative">
        <i class="icon_pass"></i>
        <input type="text" class="full_width" placeholder="Password" v-model="password" />
      </div>
      <div class="field relative">
        <i class="icon_pass2"></i>
        <input type="text" class="full_width" placeholder="Password (again)" v-model="password2" />
      </div>
      <!--
      <div class="field relative">
        <i class="icon_mail"></i>
        <input type="email" class="full_width" name="user_mail" placeholder="Email Address" v-model="email" ref="email" v-focus required />
      </div>
      -->
      <div class="field relative">
        <input type="text" class="full_width" name="full_name" placeholder="Full name" v-model="full_name" required />
      </div>
      <div class="field" v-if="confirmed && confirmed!=''">
        <span>Please check your mailbox for our confirmation letter - and click on the link there.</span>
        <button class="btn-login" type="button" @click="resendMail">Resend activation e-mail</button>
      </div>
      <div class="field">Leave the <b>password fields</b> empty if you<br/>do not want to change your password.</div>
      <div class="field">
        <button class="btn-login">Save changes</button>
      </div>
    </form>
    <div class="error_message" v-if="cant_signup != ''" v-html="cant_signup"></div>
    <div class="field" v-if="!subscribed && confirmed==''">
      You are currently using our <b>Free Plan</b> which allows up to <b>10</b> campaigns at any given time<br/>(so you may delete old campaigns and upload new ones - up to <b>10</b>).
      <br/><br/>You can <a href="#/upgrade" class="link">upgrade</a> to our paid subscription (<b>10 USD</b>/month) for <u>unlimited</u> campaigns.
    </div>
    <div class="field" v-if="subscribed">
      You are currently using our <b>Paid Subscription Plan</b> which allows for unlimited number of campaigns.
      <br/>You may <a href="#/upgrade" class="link">cancel</a> your subscription - your data will stay intact until you renew it.
    </div>
  </div>
</template>

<script>
import { checkMail } from '@/tool/email'
import AJAX from '@/tool/ajax'
require('@/css/login.css');

export default
{
  data: function()
  {
    var a =
      {
        username: '',
        password: '',
        password2: '',
        email: '',
        full_name: '',
        confirmed: '',
        subscribed: false,
        cant_signup: ''
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
        AJAX.ajax_get(this, "api/login/get_profile.php",
          function(resp)
          {
            this.cant_signup = '';
            this.username = resp.user_name;
            this.email = resp.email;
            this.full_name = resp.full_name;
            this.confirmed = resp.confirmed;
            this.subscribed = (resp.subscribe_on && resp.subscribe_on!='' && (resp.cancel_on==null || resp.cancel_on==''));
          },
          function(stat,resp)
          {
            this.cant_signup = resp;
            this.$refs.email.focus();
          }
        );
      },
      doSave: function()
      {
        var err;
        if(this.full_name.trim()=='') this.cant_signup = 'Missing first and last name';
        else if((this.password.trim()!='' || this.password2.trim()!='') && this.password.trim() != this.password2.trim()) this.cant_signup = 'Passwords are different';
        //else if((err = checkMail(this.email.trim(),true)) != '') this.cant_signup = err;
        else
        {
          var full_name = this.full_name ? this.full_name.trim() : '';
          var password = this.password ? this.password.trim() : '';
          var password2 = this.password2 ? this.password2.trim() : '';
          var email = this.email ? this.email.trim() : '';
          AJAX.ajax_post(this, "api/login/save_profile.php",
            function(resp)
            {
              if(resp.saved)
              {
                this.cant_signup = '';
              }
              else this.cant_signup = 'There was an error while saving changes';
            },
            function(stat,resp)
            {
              this.cant_signup = resp;
              this.$refs.username.focus();
            },
            "full_name="+encodeURIComponent(full_name)+"&password="+encodeURIComponent(password)
            +"&password2="+encodeURIComponent(password2)+"&email="+encodeURIComponent(email)
          );
        }
      },
      resendMail: function()
      {
        AJAX.ajax_get(this,"api/login/resend.php",
          function(resp)
          {
            if(resp.sent) this.cant_signup = 'Activation email was sent';
              else this.cant_signup = 'There was a problem with sending the activation email';
          },
          function(stat,resp)
          {
            this.cant_signup = resp;
            this.$refs.username.focus();
          }
        )
      }
    }
}

</script>

