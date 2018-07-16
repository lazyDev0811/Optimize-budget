<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');
include_once($dir.'/../emails.php');

$arr = json_decode(file_get_contents('php://input'),TRUE,100,JSON_PARTIAL_OUTPUT_ON_ERROR);
if(trim($arr['first_name'])=='') $err = 'Please tell me your first name';
elseif(trim($arr['last_name'])=='') $err = 'Please tell me your last name';
elseif(trim($arr['email'])=='') $err = 'Please tell me your e-mail address';
elseif((int)$arr['country_id']==0) $err = 'Please tell me your country';
elseif(trim($arr['message'])=='') $err = 'What is your message?';
if($err!='') unauthorized('{"msg":"'.$err.'"}');
else
{
  $arr['country'] = $db->select('mm_country',$arr['country_id']);
  $sent = mail_contact($arr);
  echo '{"sent":'.($sent ? 'true' : 'false').'}';
}

?>