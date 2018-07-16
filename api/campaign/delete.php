<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$data = json_decode(file_get_contents('php://input'),TRUE,100,JSON_PARTIAL_OUTPUT_ON_ERROR);
$list = implode(',',$data);
if($list!='' AND preg_match('/^\\d+(,\\d+)*$/',$list))
{
  $db->query('START TRANSACTION');
  $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip,event_data) 
    SELECT NOW(),'.$uid.',10,INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"),CONCAT(campaign," = ",CASE kind WHEN 1 THEN "ROI" WHEN 2 THEN "CPA" ELSE kind END) FROM mm_campaign WHERE user_id = '.$uid.' AND id IN ('.$list.')');
  $db->query('DELETE FROM mm_campaign WHERE user_id = '.$uid.' AND id IN ('.$list.')');
  $db->query('COMMIT');
}
// return updated list of campaigns
$res = $db->query('SELECT mm_campaign.id,kind,campaign AS title,COALESCE(upload_id,"z") AS upload_id,COALESCE(upload,"") AS upload 
  FROM mm_campaign LEFT JOIN mm_upload ON upload_id = mm_upload.id WHERE user_id = '.$uid);
$info['campaign_roi'] = Array();
$info['campaign_cpa'] = Array();
$info['groups_roi'] = Array();
$info['groups_cpa'] = Array();
while($row = mysqli_fetch_assoc($res))
{
  if($row['kind']==1)
  {
    $info['campaign_roi'][$row['upload_id']][] = Array('id'=>$row['id'],'title'=>$row['title']);
    $info['groups_roi'][$row['upload_id']] = Array('id'=>$row['upload_id'],'title'=>$row['upload']);
  }
  else
  {
    $info['campaign_cpa'][$row['upload_id']][] = Array('id'=>$row['id'],'title'=>$row['title']);
    $info['groups_cpa'][$row['upload_id']] = Array('id'=>$row['upload_id'],'title'=>$row['upload']);
  }
}
$info['groups_roi'] = array_values($info['groups_roi']);
$info['groups_cpa'] = array_values($info['groups_cpa']);
    
echo json_encode($info);

?>