<template>
  <div class="sup_container">
    <err-panel v-model="warn_text" :warn="is_warn"></err-panel>
    <div class="center">
      <h2>Get in Touch</h2>
      <hr size="1" width="64px" color="black"/>
      <p>Please fill out the quick form and we will be in touch with lightning speed.</p>
      <form @submit.prevent="doContact" class="contact_form">
        <table cellpadding="5">
          <tr>
            <td><strong>Subject</strong> (required)</td>
          </tr>
          <tr>
            <td><input type="text" v-model="subject" class="field_full" /></td>
          </tr>
          <tr>
            <td><strong>Message</strong> (required)</td>
          </tr>
          <tr>
            <td><textarea v-model="message" class="field_full" wrap="soft" rows="8" cols="55"></textarea></td>
          </tr>
        </table>
        <transition name="send">
          <div class="error_message center" v-if="form_error != ''" v-html="form_error"></div>
        </transition>
        <button type="submit" class="btn-login small_margin">Submit</button>
      </form>
    </div>
    <instruct></instruct>
  </div>
</template>

<script>
import { checkMail } from '@/tool/email'
import AJAX from '@/tool/ajax'
import errPanel from '@/components/err_panel'
import instruction from './instruct'
require('@/css/contact.css');

export default
{
  components:
    {
      'err-panel': errPanel,
      'instruct': instruction
    },
  data: function ()
  {
    var a =
      {
        is_warn: false,
        warn_text: '',
        form_error: '',
        subject: '',
        message: '',
      };
    return a;
  },
  watch:
    {
      'subject': 'frmClear',
      'message': 'frmClear',
    },
  methods:
    {
      frmClear: function ()
      {
        this.form_error = '';
      },
      doContact: function ()
      {
        var err;
        if(this.subject.trim()=='') this.form_error = 'What is the subject of the message?';
        else if(this.message.trim()=='') this.form_error = 'What is your message?';
        else AJAX.ajax_post(this,"api/contact/from_reg.php",
          function (resp)
          {
            this.is_warn = false;
            this.warn_text = 'Your contact request was successfully delivered.';
            this.subject = '';
            this.message = '';
          },
          function (stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          },
          JSON.stringify(
            {
              subject: this.subject,
              message: this.message
            })
        );
      }
    }
}
</script>

