<template>
  <div class="login_panel center_screen">
    <div class="logo_big">
      <img src="~@/img/logo.svg" alt="Logo" height="40"/>
    </div>

    <form @submit.prevent="doSignup">
      <h2>Sign up for new account</h2>
      <div class="field relative">
        <i class="icon_mail"></i>
        <input type="email" class="full_width" name="user_name" placeholder="Email Address" v-focus v-model="username" ref="username" required />
      </div>
      <div class="field relative">
        <i class="icon_pass"></i>
        <input type="password" class="full_width" placeholder="Password" v-model="password" required />
      </div>
      <div class="field relative">
        <i class="icon_pass2"></i>
        <input type="password" class="full_width" placeholder="Password (again)" v-model="password2" required />
      </div>
      <div class="field relative">
        <select v-model="industry_id" class="full_width">
          <option value="0" disabled>-- Choose industry --</option>
          <option v-for="item in list_industry" :value="item.id">{{ item.title }}</option>
        </select>
      </div>
      <div class="field">
        <input type="checkbox" v-model="permit_agregate" id="permit">
        <label for="permit">I permit the usage of my campaigns for industry aggregated reporting</label>
      </div>
      <div class="field">
        <button class="btn-login">Sign up</button>
      </div>
    </form>
    <div class="error_message" v-if="cant_signup != ''" v-html="cant_signup"></div>
  </div> </template>

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
        cant_signup: '',
        industry_id: '0',
        list_industry: [],
        permit_agregate: true
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
        else AJAX.ajax_get(this,'api/login/industry.php',
          function(resp)
          {
            if(isArray(resp)) this.list_industry = resp;
          },
          function(stat,resp)
          {
            this.cant_signup = resp;
            this.$refs.username.focus();
          }
        );
      },
      doSignup: function()
      {
        var err;
        if(this.username.trim()=='') this.cant_signup = 'Missing username';
        else if(this.password.trim()=='') this.cant_signup = 'Missing password';
        else if(this.password2.trim()=='') this.cant_signup = 'Missing 2nd password';
        else if(this.password.trim() != this.password2.trim()) this.cant_signup = 'Passwords are different';
        else if(+this.industry_id<1) this.cant_signup = 'Please specify your industry';
        else if((err = checkMail(this.username.trim())) != '') this.cant_signup = err;
        else
        {
          AJAX.ajax_post(this, "api/login/signup.php",
            function(resp)
            {
              if(resp.signup)
              {
                this.cant_signup = '';
                this.$router.push('/profile'); // default route on 1-st signup
              }
              else this.cant_signup = 'There was an error sending the confirmation e-mail';
            },
            function(stat,resp)
            {
              this.cant_signup = resp;
              this.$refs.username.focus();
            },
            "username="+encodeURIComponent(this.username.trim())+"&password="+encodeURIComponent(this.password.trim())
            +"&password2="+encodeURIComponent(this.password2.trim())+"&industry="+encodeURIComponent(this.industry_id)
            +"&permit="+(this.permit_agregate ? '1' : '0')
          );
        }
      }
    }
}

</script>
