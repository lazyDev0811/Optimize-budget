<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');

if(is_array($video)) $info['video'] = $video;
  else $info['video'] = Array(Array('title'=>'Example','video'=>'bTqVqk7FSmY'));
$info['country'] = Array();
$res = $db->query('SELECT id,mm_country AS name FROM mm_country');
while($row = mysqli_fetch_assoc($res)) $info['country'][] = $row;
echo json_encode($info);

?>