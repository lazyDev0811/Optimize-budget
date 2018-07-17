<template>
  <div class="login_panel center_screen">
    <div class="logo_big">
      <img src="~@/img/logo.svg" alt="Logo" height="40"/>
    </div>

    <form @submit.prevent="doLogin">
      <div class="field relative">
        <i class="icon_mail"></i>
        <input type="text" class="full_width" name="user_name" placeholder="Email Address" v-focus v-model="username" ref="username" required />
      </div>
      <div class="field relative">
        <i class="icon_pass"></i>
        <input type="password" class="full_width" placeholder="Password" v-model="password" required />
      </div>
      <div class="field">
        <button class="btn-login">Login</button>
      </div>
      <div class="field">
        <a href="#/reset" class="link small">Forgotten password</a>
      </div>

    </form>
    <div class="error_message" v-if="cant_login != ''" v-html="cant_login"></div>
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
        password: '',
        cant_login: ''
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
        if(this.$root.is_loged) this.lastStep();
      },
      doLogin: function()
      {
        AJAX.ajax_post(this,"api/login/login.php",
          function(resp)
          {
            this.cant_login = '';
            this.lastStep();
          },
          function(stat,resp)
          {
            this.cant_login = resp;
            this.$refs.username.focus();
          },
          "username="+encodeURIComponent(this.username)+"&password="+encodeURIComponent(this.password)
        );
      },
      lastStep: function()
      {
        if(this.$root.go_back != '')
        {
          var tmp = this.$root.go_back;
          this.$root.go_back = '';
          this.$router.replace(tmp); // go to previous page but already logged in
        }
        else this.$router.push('/');
      }
    }
}

</script>

