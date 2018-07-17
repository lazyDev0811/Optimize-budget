import Vue from 'vue'
import VueRouter from 'vue-router'
import Routes from './routes'
import events from './events'
import { jsonCookieValue } from './tool/cook'
import config from './config'
import App from './App'
require('./css/style.css');

Vue.config.productionTip = false;
Vue.use(VueRouter);

Routes.afterEach( function (to, from)
{
  var title = to.meta.title;
  document.title = 'ROI/CPA optimizer' + ((title != null && title != '') ? ' - '+title : '');
});

window.isDate = function(d)
{
  return Object.prototype.toString.call(d) === '[object Date]';
}

window.isArray = function(a)
{
  return Object.prototype.toString.call(a) === '[object Array]';
}

window.isObject = function(a)
{
  return (!!a) && (a.constructor === Object);
}

if (!Math.sign)
{
  Math.sign = function(x)
  {
    // If x is NaN, the result is NaN.
    // If x is -0, the result is -0.
    // If x is +0, the result is +0.
    // If x is negative and not -0, the result is -1.
    // If x is positive and not +0, the result is +1.
    x = +x; // convert to a number
    if (x === 0 || isNaN(x))
    {
      return Number(x);
    }
    return x > 0 ? 1 : -1;
  };
}

// auto-focus certain form field
Vue.directive('focus',
  {
    inserted: function (el,binding,vnode)
    {
      Vue.nextTick(function ()
      {
        el.focus();
      });
    }
  });


new Vue(
{
  el: '#app',
  router: Routes,
  created: function()
  {
    this.info = jsonCookieValue(config.cookie_info,{});
    events.$on('show_spin', this.showSpin);
    events.$on('hide_spin', this.hideSpin);
  },
  data: function()
  {
    var a =
    {
      info: {},
      spin_visible: 0,
      go_back: '' // where to return after successful login
    };
    return a;
  },
  computed:
  {
    is_loged: function()
    {
      return this.info!=null && this.info.id!=null && this.info.id!=0;
    },
    user_id: function ()
    {
      if(this.info!=null && this.info.id!=null) return this.info.id;
        else return 0;
    },
    user_name: function ()
    {
      if(this.info!=null && this.info.full_name!=null) return this.info.full_name;
        else return '';
    }
  },
  methods:
  {
    showSpin: function()
    {
      this.spin_visible++;
    },
    hideSpin: function()
    {
      if(this.spin_visible) this.spin_visible--;
    },
  },
  render: h => h(App)
});
