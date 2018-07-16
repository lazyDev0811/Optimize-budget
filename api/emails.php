<?php
$dir2 = dirname(__FILE__);
include_once($dir2.'/mail/class.phpmailer.php');
include_once($dir2.'/mail/class.smtp.php');
include_once($dir2.'/conf.php');
//if($db==NULL) include($dir2.'/db.php');

define('HTML_SIGNUP',$dir2.'/html/signup.html');
define('HTML_RESET',$dir2.'/html/reset.html');
define('HTML_RESET_CONFIRM',$dir2.'/html/new_pass.html');
define('HTML_CONTACT',$dir2.'/html/contact.html');
define('HTML_SUPPORT',$dir2.'/html/support.html');
define('HTML_PAYPAL',$dir2.'/html/paypal.html');

function emailCheck($emailStr)
{

	if($emailStr=='') return '';
		else $emailStr = trim($emailStr);

  /* The following pattern is used to check if the entered e-mail address
  fits the user@domain format.  It also is used to separate the username
  from the domain. */

	$emailPat= '/^(.+)@(.+)$/';

  /* The following string represents the pattern for matching all special
  characters.  We don't want to allow special characters in the address.
  These characters include ( ) < > @ , ; : \ " . [ ] */

	$specialChars= '\\(\\)><@,;\/:\\\\\\\"\\.\\[\\]';

  /* The following string represents the range of characters allowed in a
  username or domainname.  It really states which chars aren't allowed.*/

	$validChars= '[^\\s' . $specialChars . ']';

  /* The following pattern applies if the "user" is a quoted string (in
  which case, there are no rules about which characters are allowed
  and which aren't; anything goes).  E.g. "jiminy cricket"@disney.com
  is a legal e-mail address. */

	$quotedUser= '(\"[^\"]*\")';

  /* The following pattern applies for domains that are IP addresses,
  rather than symbolic names.  E.g. joe@[123.124.233.4] is a legal
  e-mail address. NOTE: The square brackets are required. */

	$ipDomainPat= '/^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/';

  // The following string represents an atom (basically a series of non-special characters.)

	$atom= $validChars . '+';

  /* The following string represents one word in the typical username.
  For example, in john.doe@somewhere.com, john and doe are words.
  Basically, a word is either an atom or quoted string. */

	$word= '(' . $atom . '|' . $quotedUser . ')';

  // The following pattern describes the structure of the user

	$userPat= '/^' . $word . '(\\.' . $word . ')*$/';

  /* The following pattern describes the structure of a normal symbolic
  domain, as opposed to ipDomainPat, shown above. */

	$domainPat= '/^' . $atom . '(\\.' . $atom . ')*$/';

  // Finally, let's start trying to figure out if the supplied address is valid.

  /* Begin with the coarse pattern to simply break up user@domain into
  different pieces that are easy to analyze. */

	if (!preg_match($emailPat,$emailStr,$matchArray))
	{
    /* Too many/few @'s or something; basically, this address doesn't
    even fit the general mould of a valid e-mail address. */
		return 'Email address "'.$emailStr.'" seems incorrect (check @ and .)';
	}
	$user=$matchArray[1];
	$domain=$matchArray[2];

  // Start by checking that only basic ASCII characters are in the strings (0-127).

  for ($i=0; $i<strlen($user); $i++)
		if (ord(substr($user,$i,1))>127) return 'The username in email contains invalid character ('.substr($user,$i,1).')';
  for ($i=0; $i<strlen($domain); $i++)
		if (ord(substr($domain,$i,1))>127) return 'This domain name contains invalid characters ('.substr($domain,$i,1).')';

  // user is not valid
	if (!preg_match($userPat,$user)) return 'The username in email does not seem to be valid ('.$user.').';

  // if the e-mail address is at an IP address (closed in [] ) make sure the IP address is valid.
	if (preg_match($ipDomainPat,$domain,$IPArray))
	{
    for ($i=1;$i<=4;$i++)
			if ($IPArray[$i]>255 OR $IPArray[$i]=='') return 'Destination IP address ('.$domain.') is invalid!';
		return '';
	}

  // Domain is symbolic name.  Check if it's valid.

	$atomPat= '/^' . $atom . '$/';
	$domArr=preg_split('/\./',$domain);
	$len=count($domArr);
    for ($i=0;$i<$len;$i++)
			if (!preg_match($atomPat,$domArr[$i])) return 'The domain name does not seem to be valid ('.$domArr[$i].').';

  // Make sure there's a host name preceding the domain.
	if ($len<2) return 'This email address ('.$emailStr.') is missing a hostname!';

  // If we've gotten this far, everything's valid!
	return '';
}

function new_mail($from_email = '', $from_name = '')
{
  global $db;

  $mail = new PHPMailer;
  if(USE_SMTP) $mail->isSMTP();
  $mail->Host = SMTP_HOST;
  $mail->SMTPAuth = true;
  $mail->Username = SMTP_USER;
  $mail->Password = SMTP_PASS;
  $mail->SMTPSecure = SMTP_SSL; // Enable TLS encryption, `ssl` also accepted
  $mail->Port = SMTP_PORT;
  $from_email = ($from_email == '' ? SMTP_FROM : $from_email);
  $from_name = ($from_name == '' ? 'ROI/CPA Mailer' : $from_name);
  $mail->setFrom($from_email, $from_name);
  return $mail;
}

// Send an e-mail to the customer with an unique hyperlink
// By going to the given hyperlink a customer in fact confirms
// he/she is the owner of the provided e-mail address
function mail_signup($id,$email,$hash)
{
  global $db;

  $domain = $_SERVER['HTTP_HOST'];
  $mail = new_mail();
  $mail->addAddress($email);
  $mail->isHTML(true);

  $mail->Subject = 'ROI/CPA optimizer - email address verification';
  $html = @file_get_contents(HTML_SIGNUP);
  if($html == '')
  {
    loger('Can not find HTML template for signup');
    return false;
  }
  else
  {
    $html = str_replace('{DOMAIN}',$domain,$html);
    $html = str_replace('{URL_MAIL}',urlencode($email),$html);
    $html = str_replace('{URL_HASH}',urlencode($hash),$html);
    $html = str_replace('{MAIL}',htmlspecialchars($email),$html);
    $html = str_replace('{HASH}',htmlspecialchars($hash),$html);
    $mail->Body = $html;

    if(!$mail->send())
    {
      loger('Error sending account confirmation mail for user # '.$id.' - '.$mail->ErrorInfo);
      return false;
    }
    return true;
  }
}

function mail_reset($id,$email,$hash)
{
  $domain = $_SERVER['HTTP_HOST'];
  $mail = new_mail();
  $mail->addAddress($email);
  $mail->isHTML(true);

  $mail->Subject = 'ROI/CPA optimizer - password reset';
  $html = @file_get_contents(HTML_RESET);
  if($html == '')
  {
    loger('Can not find HTML template for password reset');
    return false;
  }
  else
  {
    $html = str_replace('{DOMAIN}',$domain,$html);
    $html = str_replace('{URL_HASH}',urlencode($hash),$html);
    $html = str_replace('{HASH}',htmlspecialchars($hash),$html);
    $mail->Body = $html;

    if(!$mail->send())
    {
      loger('Error sending password reset mail for user # '.$id.' - '.$mail->ErrorInfo);
      return false;
    }
    return true;
  }
}

function mail_new_pass($id,$email)
{
  $domain = $_SERVER['HTTP_HOST'];
  $mail = new_mail();
  $mail->addAddress($email);
  $mail->isHTML(true);

  $mail->Subject = 'ROI/CPA optimizer - confirmation of password reset';
  $html = @file_get_contents(HTML_RESET_CONFIRM);
  if($html == '')
  {
    loger('Can not find HTML template for password reset confirmation');
    return false;
  }
  else
  {
    $html = str_replace('{DOMAIN}',$domain,$html);
    $mail->Body = $html;

    if(!$mail->send())
    {
      loger('Error sending password reset confirmation mail for user # '.$id.' - '.$mail->ErrorInfo);
      return false;
    }
    return true;
  }
}

// contact request from an unregistered customer
// $arr[] contains
// first_name, last_name, email, country_id, phone, company, job_title, message
function mail_contact($arr)
{
  $mail = new_mail();
  $mail->addAddress(SMTP_CONTACT);
  $mail->isHTML(true);

  $mail->Subject = 'ROI/CPA optimizer - contact request';
  $html = @file_get_contents(HTML_CONTACT);
  if($html == '')
  {
    loger('Can not find HTML template for unregistered contact request');
    return false;
  }
  else
  {
    foreach($arr as $k=>&$v)
      $html = str_replace('{'.strtoupper($k).'}',$v!='' ? $v : '&nbsp;',$html);
    $mail->Body = $html;

    if(!$mail->send())
    {
      loger('Error sending contact request - '.$mail->ErrorInfo);
      return false;
    }
    return true;
  }
}

// support request from a registered user
function mail_support($user,$subject,$msg)
{
  $mail = new_mail($user['user_name'],$user['full_name']);
  $mail->addAddress(SMTP_CONTACT);
  $mail->isHTML(true);

  $mail->Subject = 'ROI/CPA optimizer - support request';
  $html = @file_get_contents(HTML_SUPPORT);
  if($html == '')
  {
    loger('Can not find HTML template for unregistered contact request');
    return false;
  }
  else
  {
    $html = str_replace('{FULL_NAME}',$user['full_name'],$html);
    $html = str_replace('{EMAIL}',$user['user_name'],$html);
    $html = str_replace('{SUBJECT}',$subject,$html);
    $html = str_replace('{MESSAGE}',$msg,$html);
    $mail->Body = $html;

    if(!$mail->send())
    {
      loger('Error sending contact request - '.$mail->ErrorInfo);
      return false;
    }
    return true;
  }
}

// webhook for new or cancelled PayPal subscription
function mail_paypal($plan_id,$on_off)
{
  global $db;

  $res = $db->query('SELECT id,user_name,full_name,DATEDIFF(NOW(),COALESCE(subscribe_on,NOW())) AS duration FROM mm_user WHERE agreement_id = "'.$db->escape($plan_id).'" LIMIT 1');
  $user = mysqli_fetch_assoc($res);
  if($on_off) $db->query('UPDATE mm_user SET cancel_on = NULL,subscribe_on = NOW() WHERE agreement_id = "'.$db->escape($plan_id).'"');
    else $db->query('UPDATE mm_user SET cancel_on = NOW() WHERE agreement_id = "'.$db->escape($plan_id).'"');
  $mail = new_mail();
  $mail->addAddress(SMTP_CONTACT);
  $mail->isHTML(true);

  $mail->Subject = 'ROI/CPA optimizer - new subscriber';
  $html = @file_get_contents(HTML_PAYPAL);
  if($html == '')
  {
    loger('Can not find HTML template for PayPal');
    return false;
  }
  else
  {
    $html = str_replace('{FULL_NAME}',$user['full_name']!='' ? $user['full_name'] : 'Customer #'.$user['id'],$html);
    $html = str_replace('{EMAIL}',$user['user_name'],$html);
    if($on_off)
    {
      $msg = 'The customer has just upgraded to the monthly subscription plan.<br/>Congratulations!';
      $html = str_replace('{SUBJECT}','New PayPal subscription',$html);
      $html = str_replace('{MESSAGE}',$msg,$html);
    }
    else
    {
      $msg = 'Regrettably the customer has just cancelled his monthly subscription.<br/>It lasted for ';
      $duration = &$user['duration'];
      if($duration < 31) $msg.= '<b>'.$duration.'</b> days.';
      elseif($duration < 92) $msg.= '<b>'.round($duration/7).'</b> weeks.';
      elseif($duration < 367) $msg.= '<b>'.round($duration/30).'</b> months.';
      else $msg.= '<b>'.round($duration/360,1).'</b> year(s)';
      $html = str_replace('{SUBJECT}','PayPal subscription was cancelled',$html);
      $html = str_replace('{MESSAGE}',$msg,$html);
    }
    $mail->Body = $html;

    if(!$mail->send())
    {
      loger('Error sending PayPal notification - '.$mail->ErrorInfo);
      return false;
    }
    return true;
  }
}

?>
