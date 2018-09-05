import config from '@/config'

  // used by LOGIN and SIGNUP to redirect if user is already logged in
export function has_cookie(name)
{
  if(name == null || name == '') name = config.cookie_token;
  return getCookieValue(name) != '';
}

export function getCookieValue(a)
{
  var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
  return b ? b.pop() : '';
}

export function jsonCookieValue(a, def)
{
  var js = def, info_cookie = decodeURIComponent(getCookieValue(a));
  if(info_cookie=='') return def;
  try
  {
    js = JSON.parse(info_cookie);
  }
  catch(err)
  {
    console.log("Cookie - JSON parse error: " + err + ". In: " + info_cookie);
    js = def;
  }
  return js;
}
