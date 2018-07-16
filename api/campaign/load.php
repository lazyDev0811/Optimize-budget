<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();
$is_admin = in_array($uid,$admin_id);

$data = json_decode(file_get_contents('php://input'),TRUE,100,JSON_PARTIAL_OUTPUT_ON_ERROR);
$data['list'] = preg_replace('/[^0-9,]/','',$data['list']);
if($data['list']!='' AND preg_match('/^\\d+(,\\d+)*$/',$data['list']))
{
  $info = Array();
  $stm = $db->prepare('SELECT cost,revenue FROM mm_data WHERE campaign_id = ? AND datum BETWEEN ? AND ?');
  $db->bind_res($stm,Array(&$cost,&$revenue));
  $res = $db->query('SELECT id,kind,campaign AS title FROM mm_campaign WHERE id IN ('.$data['list'].')'.($is_admin ? '' : ' AND user_id = '.$uid));
  $kind = 0;
  $cam_id = '';
  if($data['from']!='' AND preg_match('/\d{4}-\d{1,2}-\d{1,2}/',$date['from'])) $date_start = $date['from'];
    else $date_start = '2000-01-01';
  if($data['to']!='' AND preg_match('/\d{4}-\d{1,2}-\d{1,2}/',$date['to'])) $date_end = $date['to'];
    else $date_end = '2100-12-31';
  while($row = mysqli_fetch_assoc($res))
  {
    $row['id'] = (int)$row['id'];
    $row['kind'] = (int)$row['kind'];
    if($kind==0) $kind = $row['kind'];
    elseif($kind != $row['kind']) unauthorized('{"msg":"Selected campaigns must be of the same kind (ROI or CPA)"}');
    $row['points'] = Array();
    $db->bind($stm,Array($row['id'],$date_start,$date_end));
    $db->exec($stm);
    while($db->fetch($stm)) $row['points'][] = Array((float)$cost,(float)$revenue);
    $info[] = $row;
    $cam_id .= ($cam_id!='' ? ',' : '').$row['id'];
  }
  if(count($info)>0)
  {
    // combine all campaigns for TOTAL
    $total = Array('id'=>0, 'kind'=>$kind, 'title'=>'COMBINED DATA', 'points'=>Array());
    $res = $db->query('SELECT SUM(cost) AS cost,SUM(revenue) AS revenue FROM mm_data WHERE campaign_id IN ('.$cam_id.') AND datum BETWEEN "'.$date_start.'" AND "'.$date_end.'" GROUP BY datum');
    while($row = mysqli_fetch_row($res)) $total['points'][] = Array((float)$row[0],(float)$row[1]);
    array_unshift($info,$total);
  }
  echo json_encode($info);
}
else unauthorized('{"msg":"Empty list of campaign IDs or wrong format"}');

?>