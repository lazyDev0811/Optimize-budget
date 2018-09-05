<template>
  <div class="login_panel center_screen">
    <div class="logo_big">
      <img src="~@/img/logo.svg" alt="Logo" height="40"/>
    </div>

    <form @submit.prevent="doSignup" v-if="!sent">
      <h2>Forgotten password</h2>
      <div class="field relative">
        <i class="icon_mail"></i>
        <input type="text" class="full_width" name="user_name" placeholder="Email Address" v-focus v-model="username" ref="username" required />
      </div>
      <!--
      <div class="field relative">
        <i class="icon_mail"></i>
        <input type="text" class="full_width" name="user_mail" placeholder="Email Address" v-model="email" required />
      </div>
      -->
      <div class="field">
        <button class="btn-login">Reset Password</button>
      </div>
    </form>
    <div v-else>
      <h2>Password Reset email sent</h2>
      <p>
        If your email address matched an account we have sent you an email with a link to reset your password.
      </p>
    </div>
    <div class="error_message" v-if="cant_reset != ''" v-html="cant_reset"></div>
  </div> </template>

<script>
import AJAX from '@/tool/ajax'
require('@/css/login.css');

export default
{
  data: function()
  {
    var a =
      {
        username: '',
        email: '',
        sent: false,
        cant_reset: ''
      };
    return a;
  },
  created: function()
  {
    this.checkLogin();
  },
  methods:
    {
      checkLogin: function()
      {
        if(this.$root.is_loged) this.$router.replace('/profile');
      },
      doSignup: function()
      {
        var mail = this.email.trim();
        if(this.username.trim()=='') this.cant_reset = 'Missing username';
        //else if(mail=='') this.cant_reset = 'Missing e-mail address';
        else
        {
          AJAX.ajax_post(this, "api/login/reset.php",
            function(resp)
            {
              if(resp.reset)
              {
                this.cant_reset = '';
                this.sent = true;
              }
              else this.cant_reset = 'There was an error sending the e-mail';
            },
            function(stat,resp)
            {
              this.cant_reset = resp;
              this.$refs.username.focus();
            },
            "user="+encodeURIComponent(this.username.trim()) //+"&email="+encodeURIComponent(mail)
          );
        }
      }
    }
}

</script>
