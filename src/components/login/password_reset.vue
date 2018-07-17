<template>
  <div class="login_panel center_screen">
    <div class="logo_big">
      <img src="~@/img/logo.svg" alt="Logo" height="40"/>
    </div>

    <form @submit.prevent="doSignup">
      <h2>Reset your password</h2>
      <div class="field relative">
        <i class="icon_pass"></i>
        <input type="password" class="full_width" placeholder="Password" v-model="password" v-focus ref="password" required />
      </div>
      <div class="field relative">
        <i class="icon_pass2"></i>
        <input type="password" class="full_width" placeholder="Password (again)" v-model="password2" required />
      </div>
      <div class="field">
        <button class="btn-login">Reset password</button>
      </div>
    </form>
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
        password: '',
        password2: '',
        cant_reset: ''
      };
    return a;
  },
  created: function()
  {
    if(this.$route.params.token.trim() == '') this.$router.replace('/');
  },
  methods:
    {
      doSignup: function()
      {
        var err;
        if(this.password.trim()=='') this.cant_reset = 'Missing password';
        else if(this.password2.trim()=='') this.cant_reset = 'Missing 2nd password';
        else if(this.password.trim() != this.password2.trim()) this.cant_reset = 'Passwords are different';
        else
        {
          AJAX.ajax_post(this, "api/login/new_pass.php",
            function(resp)
            {
              if(resp.reset)
              {
                this.cant_reset = '';
                this.$router.replace('/login'); // you still have to login with your username - no automatic logins
              }
              else this.cant_reset = 'There was an error sending the confirmation e-mail';
            },
            function(stat,resp)
            {
              this.cant_reset = resp;
              this.$refs.password.focus();
            },
            "password="+encodeURIComponent(this.password.trim())+"&password2="+encodeURIComponent(this.password2.trim())
            +"&token="+encodeURIComponent(this.$route.params.token)
          );
        }
      }
    }
}

</script>

