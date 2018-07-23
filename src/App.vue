<template>
  <div class="vue_app">
    <nav class="mainmenu" id="myTopnav">
      <a class="logo" href="#/"><img src="~@/img/logo.svg"/></a>
      <template v-if="$root.is_loged"><div @click="func1()">
        <a href=""></a>
        <router-link v-for="page in $router.options.routes" v-if="page.meta!=null && (page.meta.menu || (page.meta.admin && $root.info && $root.info.is_admin == true))" v-bind:key="page.path" v-bind:to="page.path"> {{ page.meta.title }}</router-link></div>
        <a><span class="log_info">Welcome, {{ $root.user_name != '' ? $root.user_name : 'dear customer' }}</span></a>
        <a class="login pointer" href="api/login/logout.php">Logout</a>
      </template>
      <template v-else>
        <span class="log_info">&nbsp;</span>
        <div class="btn_right">
          <a href=""></a>
          <a class="login btn" href="#/contact" @click="func1()">Support</a>
          <a class="login btn" href="#/signup" @click="func1()">Sign up</a>
          <a class="login btn" href="#/login" @click="func1()">Login</a>
        </div>
      </template>
      <a href="javascript:void(0);" class="icon" @click="myFunction()">
        <i class="fa fa-bars" style="color: #00a0b9;font-size: 30px;"></i>
      </a>
      <a href="javascript:void(0);" class="icon1" @click="myFunction()">
        <i class="fa fa-times-circle-o" style="font-size: 33px;"></i>
      </a>
    </nav>
    <div class="content">
      <router-view></router-view>
    </div>
    <div class="copyright">
      <div class="grow center"><a class="link" href="#/privacy">Privacy Policy</a></div>
      <div align="right">Copyright &#9400; 2017 Budget Optimize - All Rights Reserved</div>
    </div>
  	<div id="spinner" class="loading" v-show="$root.spin_visible>0">
  	  <div><img src="~@/img/spinner.svg" width="100px" height="100px" border="0" alt="spinner"/></div>
  	</div>
  </div>
</template>

<script>

export default
{
  name: 'app',
  computed:
    {
      rt: function ()
      {
        return this.$router;
      }
    },
    methods: {
        myFunction() {
          var x = document.getElementById("myTopnav");
          if (x.className === "mainmenu") {
              x.className += " responsive";
              // console.log(x.className);
          } else {
              x.className = "mainmenu";
              // console.log(x.className);
          }
        },
        func1() {
          // console.log('aaa');
          var x = document.getElementById("myTopnav");
          x.className = "mainmenu";
        }

    }
}

</script>

<style>
  .vue_app
  {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
  }

  .loading
  {
    /* spinner */
    z-index: 300;
    position: fixed;
    top: 50%;
    left: 50%;
    height: 100px;
    width: 100px;
    margin-left: -50px;   /* negative, half of width above */
    margin-top: -50px;   /* negative, half of height above */
    animation: rot 1.1s infinite linear;
  }

  @keyframes rot
  {
    0%
    {
      opacity: 1;
      transform: rotate(0deg);
    }
    100%
    {
      transform: rotate(359deg);
    }
  }

  .mainmenu
  {
    padding: 6px 20px;
    background-color: #f7f7f9;
    align-items: center;
    min-height: 50px;
  }

  .login
  {
    text-decoration: none;
    border: 2px solid #00a0b9;
    color: #00a0b9;
    font-size: 14px;
    padding: 7px 32px;
    margin: 0 12px;
    background-color: #fff;
    font-weight: 500;
    transition: all .3s;
  }

  .pointer
  {
    float: right !important;
    margin-top: 6px !important;
  }

  .login:hover
  {
    background-color: #00a0b9;
    color: #fff;
    outline-width: 0;
  }

  .logo
  {
    margin-right: 10px;
    flex: 0 0 auto;
  }

  .mainmenu .router-link-active,
  .mainmenu .router-link-inactive
  {
    text-decoration: none;
  }

  .mainmenu .router-link-active
  {
    color: #4a4a4a !important;
  }

  .mainmenu .router-link-inactive
  {
    color: #00a0b9;
  }

  .mainmenu .router-link-active:hover,
  .mainmenu .router-link-inactive:hover
  {
    color: #f32e3c;
  }

  /* Must be specific in order to override Router-Link */
  .log_info
  {
    flex: 1 1 auto;
    text-transform: capitalize;
    text-align: center;
  }

  .content
  {
    flex: 1 1 100%;
    overflow: auto;
  }

  .copyright
  {
    text-align: right;
    padding: 0 20px 6px 0;
    width: 100vw;
    border-top: 1px solid #BBB;
    background-color: #f7f7f9;
    display: flex;
  }

  .mainmenu .icon {
    display: none;
  }
  .mainmenu .icon1 {
    display: none;
  }

  @media screen and (max-width: 1150px) {
    .mainmenu a:not(:first-child) {display: none;text-align: center;}
    .mainmenu a.icon {
      display: block;
      right: 0;
      top: 0px;
      position: absolute;
    }
  }

  @media screen and (max-width: 1150px) {
    .mainmenu.responsive {
      z-index: 1000;
      opacity: 1;
      position: fixed;
      width: 100%;
      background: rgba(0,0,0,0.8);
      height: 100%;
      color: white;
    }
    .mainmenu.responsive .log_info {
      display: none;
    }
    .mainmenu.responsive .icon {
      display: none;
    }
    .mainmenu.responsive .icon1 {
      float: right;
      display: block;
      right: 0;
      top: 10px;
      position: absolute;
    }
    .mainmenu.responsive a {
      float: none;
      display: block;
      text-align: left;
      color: white;
    }
    .mainmenu.responsive .login.pointer {
      background-color: rgba(6,6,6,0.2);
    }
    .mainmenu.responsive .btn {
      width: 300px;
      text-align: center;
      margin-top: 20px;
      margin-left: 20px;
      background-color: rgba(6,6,6,0.2);
    }
  }

  .mainmenu a {
    float: left;
    display: block;
    text-align: center;
    margin: 15px 8px;
    text-decoration: none;
  }

  .mainmenu div a{
    color: #00a0b9;
  }

  .btn_right {
    float: right;
  }

</style>
