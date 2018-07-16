<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$user = (int)$_REQUEST['id'];
$res = $db->query('SELECT mm_campaign.id,kind,campaign AS title,COALESCE(upload,"") AS upload 
  FROM mm_campaign LEFT JOIN mm_upload ON upload_id = mm_upload.id WHERE user_id = '.$user);
$info['data_roi'] = Array();
$info['data_cpa'] = Array();
$info['user_name'] = $db->select('mm_user',$user,'IF(full_name<>"",full_name,user_name)');
if(in_array($uid,$admin_id) AND $user!=0)
{
  while($row = mysqli_fetch_assoc($res)) 
  {
    if($row['kind']==1) 
    {
      $info['data_roi'][] = Array('id'=>$row['id'],'title'=>$row['title'],'group'=>$row['upload']);
    }
    else 
    {
      $info['data_cpa'][] = Array('id'=>$row['id'],'title'=>$row['title'],'group'=>$row['upload']);
    }
  }
}
echo json_encode($info);

?>