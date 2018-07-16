<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');
include_once($dir.'/../emails.php');

$user = trim($_REQUEST['user']);

if($user == '') unauthorized('{"msg":"Missing username"}');
else
{
  $res = $db->query('SELECT id,full_name FROM mm_user WHERE user_name = "'.$db->escape($user).'"');
  if($db->count($res))
  {
    $row = mysqli_fetch_assoc($res);
    // send email with reset link
    $hash = token_encode(SALT,json_encode($row));
    $sent = mail_reset($row['id'],$user,$hash);
    $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip) VALUES(NOW(),'.(int)$row['id'].',7,INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
    echo '{"reset":'.($sent ? 'true' : 'false').'}';
  }
  else unauthorized('{"msg":"Could not find this username"}');
}

?>