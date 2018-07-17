import events from '@/events'
import config from '@/config'
import { jsonCookieValue } from './cook'

//===== AJAX

/*
 * Get cross browser xhr object
 *
 * Copyright (C) 2011 Jed Schmidt <http://jed.is>
 * More: https://gist.github.com/993585
 */

var ajax = function()
{
  for(var a=0; a<4; a++)
    try
    {
      return a               // try returning
        ? new ActiveXObject( // a new ActiveXObject
            [                // reflecting
              ,              // (elided)
              "Msxml2",      // the various
              "Msxml3",      // working
              "Microsoft"    // options
            ][a] +           // for Microsoft implementations, and
            ".XMLHTTP"       // the appropriate suffix,
          )                  // but make sure to
        : new XMLHttpRequest // try the w3c standard first, and
    }
    catch(e){}               // ignore when it fails.
}

// DATA must be encoded - EncodeURIComponent
function ajaxReq(method, url, ok_cb, err_cb, data)
{
  var xhr = ajax();
  xhr.open(method, url, true);
  var timeout = setTimeout(function()
  {
    xhr.abort();
    console.log("XHR timeout:", method, url);
    err_cb(-1,'API request timed out');
  }, 30000);
  xhr.onreadystatechange = function()
  {
    if (xhr.readyState != 4) return;
    clearTimeout(timeout);
    if (xhr.status >= 200 && xhr.status < 300)
    {
      //console.log("XHR done:", method, url, "->", xhr.status);
      ok_cb(xhr.responseText, xhr);
    }
    else
    {
      if(xhr.status != 401) console.log("XHR ERR: " + method, url + " ==> " + xhr.status);
      if(xhr.status != 404 && xhr.status != 401)
      {
        console.log(xhr.responseText);
      }
      err_cb(xhr.status, xhr.responseText);
    }
    xhr = null;
  };
	if(!(data instanceof FormData)) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  try
  {
    if(data !== undefined) xhr.send(data);
      else xhr.send();
  }
  catch(err)
  {
    console.log("XHR EXC :" + method, url + " --> ", err);
    err_cb(599, err);
  }
}

function dispatchJson(resp, ok_cb, err_cb, req)
{
  var j;
  try
  {
    j = JSON.parse(resp);
  }
  catch(err)
  {
    if(resp.indexOf('error') != -1)
    {
      resp = resp.replace(/\/var\/.+\/api/g,'/api');
      console.log(resp);
      err_cb(597, resp);
    }
    else
    {
      console.log(err + " ==> IN: " + resp);
      err_cb(597, "JSON parse error: " + err);
    }
    return;
  }
  ok_cb(j, req);
}

// DATA must be encoded - EncodeURIComponent
function ajaxJson(method, url, ok_cb, err_cb, data)
{
  ajaxReq(method, url,
    function(resp, req)
    {
      dispatchJson(resp, ok_cb, err_cb, req);
    }, err_cb, data);
}

// DATA must be encoded - EncodeURIComponent
function ajaxSpin(method, url, ok_cb, err_cb, data)
{
  events.$emit('show_spin');
  ajaxReq(method, url,
    function(resp)
    {
      events.$emit('hide_spin');
      ok_cb(resp);
    },
    function(status, statusText)
    {
      events.$emit('hide_spin');
      err_cb(status, statusText);
    },
    data
  );
}

// DATA must be encoded - EncodeURIComponent
function ajaxJsonSpin(method, url, ok_cb, err_cb, data)
{
  ajaxSpin(method, url,
    function(resp)
    {
      dispatchJson(resp, ok_cb, err_cb);
    },
    err_cb, data);
}

// ======================

  // handle PHP run-time errors
  function checkReply(js,err_cb)
  {
    if(js!=null && typeof js == "object" && typeof js.error == "object" && js.error.type != '')
    {
      var tabs = 1, delim = '#', spc = ' ', msg = '';
      if(js.error.text != '') msg += js.error.text + "\n";
      if(js.error.trace.length)
      {
        while(js.error.trace.length)
        {
          var tr = js.error.trace.shift();
          msg += Array(tabs+1).join(delim) + ' ' + tr.line + ', ' + tr.file + "\n";
          tabs++;
          msg += Array(tabs+1).join(spc) + (typeof tr['class'] != 'undefined' ? tr['class'] + '::' : '') + tr['function'].name + '(' + tr['function'].args.join(', ')+')' + "\n";
        }
      }
      else msg += delim + ' ' + js.error.line + ', ' + js.error.file + "\n";
      if(typeof sql == "object")
      {
        msg += "\n" + 'STATE = ' + sql.state + "\n"
          + sql.text + "\n"
          + sql.detail + "\n"
          + sql.context;
      }
      console.log(msg);
      err_cb.call(this,598,'<pre>'+msg.replace(/(?:\r\n|\r|\n)/g,'<br/>')+'</pre>');
      //err_cb.call(this,598,msg);
      return false;
    }
    return true;
  }

  // expects THIS to point to Vue/Component instance
  function cb_success(ok_cb,err_cb,resp)
  {
    if(checkReply.call(this,resp,err_cb))
    {
      this.$root.info = jsonCookieValue(config.cookie_info,{});
      ok_cb.call(this,resp);
    }
  }

  function checkJSON(js)
  {
    var j;
    try
    {
      j = JSON.parse(js);
    }
    catch(err)
    {
      return js;
    }
    if(typeof j == "object" && typeof j.msg != "undefined") return j.msg;
      else return js;
  }

  // expects THIS to point to Vue/Component instance
  function cb_fail(url,err_cb,stat,resp)
  {
    var api = url.match(/^api(\/[^\?]+)\.php($|\?.*$)/);
    if(api!=null) api = api[1]; else api = 'XYZ';
    if(stat == 401)
    {
      this.$root.info = {};
      this.$root.go_back = this.$route.path;
      this.$router.push('/login');
    }
    else if(stat == 404)
    {
      err_cb.call(this,stat,'API endpoint for <b>'+api+'</b> was not found');
    }
    else
    {
      err_cb.call(this,stat,checkJSON(resp));
    }
  }

// ======================

export default
{
  // expects THIS to point to Vue/Component instance
  ajax_get(instance,url,ok_cb,err_cb,signal)
  {
    ajaxJsonSpin("GET",url, cb_success.bind(instance,ok_cb,err_cb), cb_fail.bind(instance,url,err_cb));
  },

  ajax_post(instance,url,ok_cb,err_cb,data,signal)
  {
    ajaxJsonSpin("POST",url, cb_success.bind(instance,ok_cb,err_cb), cb_fail.bind(instance,url,err_cb), data);
  }

}
