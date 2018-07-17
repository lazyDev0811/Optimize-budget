<template>
  <div class="vue_app">
    <nav class="mainmenu">
      <a class="logo" href="#/"><img src="~@/img/logo.svg"/></a>
      <template v-if="$root.is_loged">
        <router-link v-for="page in $router.options.routes" v-if="page.meta!=null && (page.meta.menu || (page.meta.admin && $root.info && $root.info.is_admin == true))" v-bind:key="page.path" v-bind:to="page.path">{{ page.meta.title }}</router-link>
        <span class="log_info">Welcome, {{ $root.user_name != '' ? $root.user_name : 'dear customer' }}</span>
        <a class="login pointer" href="api/login/logout.php">Logout</a>
      </template>
      <template v-else>
        <span class="log_info">&nbsp;</span>
        <a class="login" href="#/contact">Support</a>
        <a class="login" href="#/signup">Sign up</a>
        <a class="login" href="#/login">Login</a>
      </template>
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
    display: flex;
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
    padding: 2px 12px;
  }

  .mainmenu .router-link-active
  {
    color: #4a4a4a;
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

</style>
