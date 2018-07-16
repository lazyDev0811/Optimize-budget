<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$res = $db->query('SELECT user_name,COALESCE(full_name,"") full_name,COALESCE(confirmed,"") confirmed,subscribe_on,cancel_on FROM mm_user WHERE id = '.$uid);
$info = mysqli_fetch_assoc($res);
echo json_encode($info);

?>