<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');

$info = Array();
$res = $db->query('SELECT id,title FROM mm_industry ORDER BY title');
while($row = mysqli_fetch_assoc($res)) $info[] = $row;
echo json_encode($info);

?>