<template>
  <div>
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <h2 align="center">Event log for <span class="user_name">{{ user_name }}</span></h2>
    <table align="center" class="acc_stat">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>IP address</th>
          <th>Event type</th>
          <th>Event details</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in events">
          <td>{{ item.stamp }}</td>
          <td>{{ item.ip }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.data }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
require('@/css/account.css');

export default
{
  components:
    {
      'err-panel': errPanel
    },
  data: function()
  {
    var a =
      {
        is_warn: false,
        warn_text: '',
        events: [],
        user_name: ''
      };
    return a;
  },
  created: function()
  {
    this.fetchData();
  },
  methods:
    {
      fetchData: function()
      {
        AJAX.ajax_get(this,'api/admin/event_log.php?id='+this.$route.params.user,
          function(resp)
          {
            if(isArray(resp.events)) this.events = resp.events;
            this.user_name = resp.user_name;
          },
          function(stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        );
      }
    }
}
</script>
