<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');
include_once($dir.'/../emails.php');

$pass = trim($_REQUEST['password']);
$pass2 = trim($_REQUEST['password2']);
$token = trim($_REQUEST['token']);
if($token != '') $arr = json_decode(token_decode(SALT,$token),TRUE,100,JSON_PARTIAL_OUTPUT_ON_ERROR);

if($pass == '') unauthorized('{"msg":"Missing password"}');
elseif($pass2 == '') unauthorized('{"msg":"Missing 2nd password"}');
elseif($pass != $pass2) unauthorized('{"msg":"Passwords are different"}');
elseif($arr['id'] == 0) unauthorized('{"msg":"Missing or wrong token"}');
else
{
  $hash = password_hash($pass,PASSWORD_DEFAULT);
  $db->query('UPDATE mm_user SET user_pass = "'.$db->escape($hash).'" WHERE id = '.(int)$arr['id']);
  $res = $db->query('SELECT user_name FROM mm_user WHERE id = '.(int)$arr['id']);
  $email = mysqli_fetch_row($res)[0];
  $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip) VALUES(NOW(),'.(int)$arr['id'].',8,INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
  // send email notification
  $sent = mail_new_pass($arr['id'],$email);
  echo '{"reset":'.($sent ? 'true' : 'false').'}';
}

?>