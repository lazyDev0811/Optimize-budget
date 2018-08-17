<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$res = $db->query('SELECT mm_campaign.id,kind,campaign AS title,COALESCE(upload_id,"z") AS upload_id,COALESCE(upload,"") AS upload,COALESCE(unpaid,0) AS unpaid
  FROM mm_campaign LEFT JOIN mm_upload ON upload_id = mm_upload.id limit 0, 1');

$info = Array();

while($row = mysqli_fetch_assoc($res)) 
{
  $info = $row;
}

echo json_encode($info);

?>