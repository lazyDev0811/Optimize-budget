<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');
include_once($dir.'/../emails.php');

$uid = has_login();

$pass = trim($_REQUEST['password']);
$pass2 = trim($_REQUEST['password2']);
$full_name = trim($_REQUEST['full_name']);

if($full_name == '') unauthorized('{"msg":"Missing first and last name"}');
elseif(($pass!='' OR $pass2!='') AND $pass != $pass2) unauthorized('{"msg":"Passwords are different"}');
{
  $res = $db->query('SELECT user_pass,confirmed FROM mm_user WHERE id = '.$uid);
  $old = mysqli_fetch_assoc($res);
  $stm = $db->prepare('UPDATE mm_user SET full_name = ?, user_pass = ? WHERE id = '.$uid);
  if($pass AND !password_verify($pass,$old['user_pass'])){
     $password = password_hash($pass,PASSWORD_DEFAULT);
  }
  else {
    $password = $old['user_pass'];
  }

  $db->bind($stm,Array($full_name,$password));
  $res = $db->exec($stm);
  $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip) VALUES(NOW(),'.$uid.',9,INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
  send_info_cookie(Array('id' => $uid, 'confirmed' => $old['confirmed']=='', 'full_name' => $full_name));
  echo '{"saved":true}';
}

?>