<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');
include_once($dir.'/../emails.php');

$user = trim($_REQUEST['username']);
$pass = trim($_REQUEST['password']);
$pass2 = trim($_REQUEST['password2']);
$industry = (int)$_REQUEST['industry'];
$permit = (int)$_REQUEST['permit'];

if($user == '') unauthorized('{"msg":"Missing username"}');
elseif($pass == '') unauthorized('{"msg":"Missing password"}');
elseif($pass2 == '') unauthorized('{"msg":"Missing 2nd password"}');
elseif($pass != $pass2) unauthorized('{"msg":"Passwords are different"}');
elseif(($err = emailCheck($user)) != '') unauthorized(json_encode(Array('msg' => $err)));
elseif($industry == 0) unauthorized('{"msg":"Missing industry"}');
{
  $res = $db->query('SELECT 1 FROM mm_user WHERE user_name = "'.$db->escape($user).'" LIMIT 1');
  if($db->count($res)) unauthorized('{"msg":"This username is already used"}');
  else
  {
    mysqli_free_result($res);
    $db->query('START TRANSACTION');
    $stm = $db->prepare('INSERT INTO mm_user(user_name,user_pass,confirmed,industry_id,permit_aggregate) VALUES(?,?,?,?,?)');
    $hash = hash('sha256',my_rand());
    $db->bind($stm,Array($user,password_hash($pass,PASSWORD_DEFAULT),$hash,$industry,$permit));
    $res = $db->exec($stm);
    $id = $db->last_id();
    $db->query('INSERT INTO mm_log(event_id,user_id,ip) VALUES(3,'.$id.',INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
    $db->query('COMMIT');
    // send confirmation email
    $sent = mail_signup($id,$user,$hash);
    // generate encrypted JSON web token
    $json = make_cookie($id);
    send_token($json);
 	  send_info_cookie(Array('id' => $id, 'confirmed' => FALSE, 'full_name' => $user));
    echo '{"signup":true}';
  }
}

?>