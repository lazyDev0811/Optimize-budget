<template>
  <div>
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <h2 align="center">Account statistics</h2>
    <table align="center" class="acc_stat">
      <thead>
        <tr>
          <th>Username</th>
          <th>Confirmed</th>
          <th>Full name</th>
          <th>Created</th>
          <th>ROI campaigns</th>
          <th>CPA campaigns</th>
          <th>ROI data-points</th>
          <th>CPA data-points</th>
          <th>Campaign upload</th>
          <th>Industry</th>
          <th>Aggregate data</th>
          <th>Last login</th>
          <th>Last IP address</th>
          <th>Wrong password</th>
          <th>Disabled logins</th>
          <th>Unconfirmed logins</th>
          <th>Normal logins</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in list" align="center">
          <td align="left"><a :href="'#/data/'+item.id" class="link">{{ item.user_name }}</a></td>
          <td>
            <img v-if="item.confirmed" src="~@/img/valid.svg" width="16" height="16" />
            <img v-else src="~@/img/close.svg" width="16" height="16" />
          </td>
          <td align="left">{{ item.full_name }}</td>
          <td>{{ item.created }}</td>
          <td>{{ item.roi_campaign | thousand }}</td>
          <td>{{ item.cpa_campaign | thousand }}</td>
          <td>{{ item.roi_data | thousand }}</td>
          <td>{{ item.cpa_data | thousand }}</td>
          <td>{{ item.ckind + '  /  ' + item.cupload }}</td>
          <td>{{ item.industry }}</td>
          <td>
            <img v-if="item.permit" src="~@/img/valid.svg" width="16" height="16" />
            <img v-else src="~@/img/close.svg" width="16" height="16" />
          </td>
          <td><a :href="'#/events/'+item.id" class="link">{{ item.last_login }}</a></td>
          <td>{{ item.last_ip }}</td>
          <td>{{ item.login_wrong }}</td>
          <td>{{ item.login_disabled }}</td>
          <td>{{ item.login_pending }}</td>
          <td>{{ item.login_ok }}</td>
        </tr>
      </tbody>
    </table>
    <br/>
    <div class="center"><a href="api/admin/acc_stat.php?export=1" class="link" download="users.csv">Download as CSV</a></div>
  </div>
</template>

<script>
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
import { strCompare } from '@/tool/util'
require('@/css/account.css');

export default
{
  components:
    {
      'err-panel': errPanel
    },
  data: function ()
  {
    var a =
      {
        is_warn: false,
        warn_text: '',
        list: []
      };
    return a;
  },
  created: function ()
  {
    this.fetchData();
  },
  filters:
    {
      thousand: function (value)
      {
        return String(value).replace(/([^-])(?=(\d{3})+(\.\d\d)?$)/g,'$1,');
      }
    },
  methods:
    {
      fetchData: function ()
      {
        AJAX.ajax_get(this,'api/admin/acc_stat.php',
          function (resp)
          {
            if(isArray(resp)) this.list = resp;
              else this.list = [];
          },
          function (stat, resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      }
    }
}
</script>
