<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$res = $db->query('SELECT mm_campaign.id,kind,campaign AS title,COALESCE(upload_id,"z") AS upload_id,COALESCE(upload,"") AS upload,COALESCE(unpaid,0) AS unpaid
  FROM mm_campaign LEFT JOIN mm_upload ON upload_id = mm_upload.id WHERE user_id = '.$uid);

  if(mysqli_num_rows($res) == 0){
    $res = $db->query('(SELECT mm_campaign.id,kind,campaign AS title,COALESCE(upload_id,"z") AS upload_id,
                          COALESCE(upload,"") AS upload,COALESCE(unpaid,0) AS unpaid
                            FROM mm_campaign LEFT JOIN mm_upload ON upload_id = mm_upload.id WHERE kind = 1 LIMIT 1) 
                        UNION 
                        (SELECT mm_campaign.id,kind,campaign AS title,COALESCE(upload_id,"z") AS upload_id,
                            COALESCE(upload,"") AS upload,COALESCE(unpaid,0) AS unpaid
                              FROM mm_campaign LEFT JOIN mm_upload ON upload_id = mm_upload.id WHERE kind = 2 LIMIT 1)');
  }

$info['groups_roi'] = Array();
$info['groups_cpa'] = Array();
$unpaid = FALSE;
while($row = mysqli_fetch_assoc($res)) 
{
  if($row['unpaid']) $unpaid = TRUE;
  if($row['kind']==1) 
  {
    $info['campaign_roi'][$row['upload_id']][] = Array('id'=>$row['id'],'title'=>$row['title'],'unpaid'=>(bool)$row['unpaid']);
    $info['groups_roi'][$row['upload_id']] = Array('id'=>$row['upload_id'],'title'=>$row['upload'],'checked'=>0);
  }
  else 
  {
    $info['campaign_cpa'][$row['upload_id']][] = Array('id'=>$row['id'],'title'=>$row['title'],'unpaid'=>(bool)$row['unpaid']);
    $info['groups_cpa'][$row['upload_id']] = Array('id'=>$row['upload_id'],'title'=>$row['upload'],'checked'=>0);
  }
}
$info['groups_roi'] = array_values($info['groups_roi']);
$info['groups_cpa'] = array_values($info['groups_cpa']);
$info['unpaid'] = $unpaid;
echo json_encode($info);

?>