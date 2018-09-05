<template>
  <div :class="['msg', warn ? 'warning' : 'notification']" v-html="msg" v-if="msg!=null && msg!=''"></div>
</template>

<script>
import config from '@/config'

export default
{
  props: ['value','warn'],
  data: function ()
  {
    var a =
    {
      notifTimeout: null,
      msg: this.value
    };
    return a;
  },
  watch:
  {
    'value': 'newText'
  },
  methods:
  {
    newText()
    {
      if(this.value==null || this.value=='')
      {
        this.msg = '';
        return;
      }
      // \s\S is workaround for "." not matching on CRLF
      var tmp;
      if(this.value.indexOf('<html') != -1) tmp = this.value.replace(/^[\s\S]+<body[^>]*>/i,'').replace(/<\/body>[\s\S]*$/i,'');
        else tmp = this.value;
      //if(this.warn) console.log(tmp);
      this.msg = tmp;//'<pre>' + tmp.replace(/(?:\r\n|\r|\n)/g,'<br/>') + '</pre>';
      if(this.notifTimeout != null) clearTimeout(this.notifTimeout);
      var self = this;
      this.notifTimout = setTimeout(function()
      {
        self.notifTimout = null;
        self.msg = '';
        // TEXT must be cleared by the parent component, otherwise subsequent errors with the exact same text will be ignored
        self.$emit('input','');
      }, this.warn ? config.warn_time : config.info_time);
    }
  }
}

</script>

<style>
  .msg
  {
    padding: 0.6em 1em;
    border-radius: 4pt;
    border: 1px solid black;
    display: inline-block;
    position: fixed;
    top: 50%;
    left: 50%;
    max-height: 65vh;
    max-width: 90vw;
    overflow: auto;
    transform: translate(-50%, -50%);
    transition: opacity .25s ease,color .25s ease,background .25s ease,box-shadow .1s ease;
    z-index: 36;
  }

  .msg.warning
  {
    border-color: #9f3a38;
    background-color: #fff6f6;
    color: #9f3a38;
    box-shadow: 0 0 0 1px #ff6c5d inset, 0 0 0 0 transparent;
  }

  .msg.notification
  {
    border-color: #2c662d;
    background-color: #fcfff5;
    color: #2c662d;
    box-shadow: 0 0 0 1px #a3c293 inset, 0 0 0 0 transparent;
  }

</style>
