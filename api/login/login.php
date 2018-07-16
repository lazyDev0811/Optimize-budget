<?php
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$user = trim($_REQUEST['username']);
$pass = trim($_REQUEST['password']);

if($user == '') unauthorized('{"msg":"Missing username"}');
elseif($pass == '') unauthorized('{"msg":"Missing password"}');
else
{
  $res = $db->query('SELECT id,full_name,is_active,confirmed,user_pass FROM mm_user WHERE user_name = "'.$db->escape($user).'"');
  if($db->count($res))
  {
    $data = mysqli_fetch_assoc($res);
    if(!password_verify($pass,$data['user_pass']))
    {
      $db->query('INSERT INTO mm_log(event_id,user_id,ip) VALUES(1,'.$data['id'].',INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
      unauthorized('{"msg":"Wrong password or username"}');
    }
    elseif($data['is_active'] == 0)
    {
      $db->query('INSERT INTO mm_log(event_id,user_id,ip) VALUES(2,'.$data['id'].',INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
      unauthorized('{"msg":"This account is currently DISABLED"}');
    }
    //elseif($data['confirmed'] != '') unauthorized('{"msg":"This account still has not confirmed the validity of its e-mail"}');
    else
    {
      if($data['confirmed']!='') $db->query('INSERT INTO mm_log(stamp,event_id,user_id,ip) VALUES(NOW(),3,'.$data['id'].',INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
        else $db->query('INSERT INTO mm_log(stamp,event_id,user_id,ip) VALUES(NOW(),4,'.$data['id'].',INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
      $json = make_cookie($data['id']);
      send_token($json);
   	  send_info_cookie(Array('id'=>$data['id'], 'full_name'=>$data['full_name']!='' ? $data['full_name'] : $user, 'confirmed'=>$data['confirmed']=='', 'is_admin'=>in_array($data['id'],$admin_id)));
      echo '{"login":true}';
    }
  }
  else unauthorized('{"msg":"Wrong password or username"}');
}

?>
