<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');
include_once($dir.'/../emails.php');

$uid = has_login();

$res = $db->query('SELECT user_name,confirmed FROM mm_user WHERE id = '.$uid);
$row = mysqli_fetch_assoc($res);
// send confirmation email
if($row['confirmed']!='') 
{
  $sent = mail_signup($uid,$row['user_name'],$row['confirmed']);
  $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip) VALUES(NOW(),'.$uid.',6,INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
}
else $sent = FALSE;

echo '{"sent":'.($sent ? 'true' : 'false').'}';

?>