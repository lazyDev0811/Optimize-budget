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
            <td width="50%"><strong>First name</strong> (required)</td>
            <td width="50%"><strong>Last name</strong> (required)</td>
          </tr>
          <tr>
            <td><input type="text" v-model="first_name" class="field_half" required/></td>
            <td><input type="text" v-model="last_name" class="field_half" required/></td>
          </tr>
          <tr>
            <td colspan="2"><strong>Email</strong> (required)</td>
          </tr>
          <tr>
            <td colspan="2">
              <input type="email" v-model="email" class="field_full" required/>
            </td>
          </tr>
          <tr>
            <td colspan="2"><strong>Country</strong> (required)</td>
          </tr>
          <tr>
            <td colspan="2">
              <select class="field_full" v-model="country_id" required>
                <option value="0">- Please select -</option>
                <option v-for="item in sortedCountry" :value="item.id">{{ item.name }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Company</td>
            <td>Phone number</td>
          </tr>
          <tr>
            <td><input type="text" v-model="company" class="field_half" /></td>
            <td><input type="text" v-model="phone" class="field_half" /></td>
          </tr>
          <tr>
            <td colspan="2">Job title</td>
          </tr>
          <tr>
            <td colspan="2"><input type="text" v-model="job_title" class="field_full" /></td>
          </tr>
          <tr>
            <td colspan="2"><strong>Your message</strong> (required)</td>
          </tr>
          <tr>
            <td colspan="2"><textarea v-model="message" class="field_full" rows="8"></textarea></td>
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
import { strCompare } from '@/tool/util'
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
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        phone: '',
        country_id: 0,
        job_title: '',
        message: '',
        country_list: []
      };
    return a;
  },
  watch:
    {
      'first_name': 'frmClear',
      'last_name': 'frmClear',
      'email': 'frmClear',
      'country_id': 'frmClear',
      'message': 'frmClear'
    },
  created: function ()
  {
    this.fetchData();
  },
  computed:
    {
      sortedCountry: function ()
      {
        return this.country_list.sort(function (a,b)
        {
          return strCompare(a.name,b.name);
        })
      }
    },
  methods:
    {
      frmClear: function ()
      {
        this.form_error = '';
      },
      fetchData: function ()
      {
        AJAX.ajax_get(this,"api/contact/country.php",
          function (resp)
          {
            if(isArray(resp.country)) this.country_list = resp.country;
              else this.country_list = [];
          },
          function (stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          }
        )
      },
      doContact: function ()
      {
        var err;
        if((err = checkMail(this.email.trim())) != '') this.form_error = err;
        else if(this.country_id==0) this.form_error = 'Choose your country';
        else if(this.message.trim()=='') this.form_error = 'What is your message?';
        else AJAX.ajax_post(this,"api/contact/from_any.php",
          function (resp)
          {
            this.is_warn = false;
            this.warn_text = 'Your contact request was successfully delivered.';
            this.first_name = '';
            this.last_name = '';
            this.email = '';
            this.country_id = 0;
            this.company = '';
            this.phone = '';
            this.job_title = '';
            this.message = '';
          },
          function (stat,resp)
          {
            this.is_warn = true;
            this.warn_text = resp;
          },
          JSON.stringify(
            {
              first_name: this.first_name,
              last_name: this.last_name,
              email: this.email,
              phone: this.phone,
              country_id: this.country_id,
              company: this.company,
              job_title: this.job_title,
              message: this.message
            })
        );
      }
    }
}
</script>
