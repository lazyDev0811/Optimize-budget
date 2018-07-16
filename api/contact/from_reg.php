<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');
include_once($dir.'/../emails.php');

$uid = has_login();

$arr = json_decode(file_get_contents('php://input'),TRUE,100,JSON_PARTIAL_OUTPUT_ON_ERROR);
if(trim($arr['subject'])=='') $err = 'What is the subject of your message?';
elseif(trim($arr['message'])=='') $err = 'What is your message?';
if($err!='') unauthorized('{"msg":"'.$err.'"}');
else
{
  $res = $db->query('SELECT user_name,COALESCE(full_name,"") full_name FROM mm_user WHERE id = '.$uid);
  $user = mysqli_fetch_assoc($res);
  if($user['full_name']=='') $user['full_name'] = 'Customer #'.$uid;
  $sent = mail_support($user,$arr['subject'],$arr['message']);
  echo '{"sent":'.($sent ? 'true' : 'false').'}';
}

?>