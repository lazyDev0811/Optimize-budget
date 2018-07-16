<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$user = (int)$_REQUEST['id'];
$info = Array('user_name' => $db->select('mm_user',$user,'IF(full_name<>"",full_name,user_name)'), 'events' => Array());
if(in_array($uid,$admin_id) AND $user!=0)
{
  $res = $db->query('SELECT stamp,mm_event AS title,INET_NTOA(ip) AS ip,event_data AS data FROM mm_log LEFT JOIN mm_event ON event_id = mm_event.id WHERE user_id = '.$user.' ORDER BY stamp');
  while($row = mysqli_fetch_assoc($res)) 
  {
    $info['events'][] = $row;
  }
}
echo json_encode($info);

?>