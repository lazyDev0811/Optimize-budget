import Router from 'vue-router'
import badRoute from './components/bad_route'
import loginForm from './components/login/login_form'
import signupForm from './components/login/signup_form'
import resetForm from './components/login/reset_form'
import resetPass from './components/login/password_reset'
import landing from './components/landing'
import myProfile from './components/account/my_profile'
import dataImport from './components/import/import'
import campaignList from './components/campaign/list'
import optimizer from './components/optimize/optimize'
import support from './components/support/support'
import contact from './components/support/contact'
import admin from './components/admin/stats'
import paypal from './components/admin/paypal'
import privacyPolicy from './components/privacy'
import userData from './components/account/campaigns'
import userEvents from './components/admin/events'
import upgrade from './components/account/upgrade'
import { jsonCookieValue } from '@/tool/cook'

export default new Router({
  base: '/',
  mode: 'hash',
  routes:
  [
    {
      path: '/',
      component: landing,
      meta:
      {
        title: 'Splash'
      }
    },
    {
      path: '/login',
      component: loginForm,
      meta:
        {
          title: 'LOGIN'
        }
    },
    {
      path: '/signup',
      component: signupForm,
      meta:
        {
          title: 'REGISTER'
        }
    },
    {
      path: '/reset',
      component: resetForm,
      meta:
        {
          title: 'RESET'
        }
    },
    {
      path: '/reset/:token',
      component: resetPass,
      meta:
        {
          title: 'Password Reset'
        }
    },
    {
      path: '/contact',
      component: contact,
      meta:
        {
          title: 'Contact us'
        }
    },
    {
      path: '/campaigns',
      component: campaignList,
      meta:
        {
          title: 'Campaigns',
          menu: true
        }
    },
    {
      path: '/import',
      component: dataImport,
      meta:
        {
          title: 'Import data',
          menu: true
        }
    },
    {
      path: '/profile',
      component: myProfile,
      meta:
        {
          title: 'My profile',
          menu: true
        }
    },
    {
      path: '/support',
      component: support,
      meta:
        {
          title: 'Support',
          menu: true
        }
    },
    {
      path: '/admin',
      component: admin,
      meta:
        {
          title: 'Admin panel',
          admin: true
        }
    },
    {
      path: '/paypal',
      component: paypal,
      meta:
        {
          title: 'PayPal',
          admin: true
        }
    },
    {
      path: '/optimize/:kind/:list',
      name: 'optimize',
      component: optimizer,
      meta:
        {
          title: 'Optimize',
        }
    },
    {
      path: '/privacy',
      component: privacyPolicy,
      meta:
        {
          title: 'Privacy Policy'
        }
    },
    {
      path: '/data/:user',
      component: userData,
      meta:
        {
          title: 'Export data'
        }
    },
    {
      path: '/events/:user',
      component: userEvents,
      meta:
        {
          title: 'User events'
        }
    },
    {
      path: '/upgrade',
      component: upgrade,
      meta:
        {
          title: 'Paid subscription'
        }
    },

    {
      path: '*', // should be last, otherwise matches everything
      component: badRoute,
      meta:
        {
          title: 'NOT FOUND'
        }
    }
  ]
})
