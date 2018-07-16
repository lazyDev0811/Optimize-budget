<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

if(in_array($uid,$admin_id))
{
  $c_id = (int)$_REQUEST['id'];
  if($c_id!=0) $campaign = $db->select('mm_campaign',$c_id,'campaign');
  $out = fopen('php://output', 'w');
  header('Content-Type: application/force-download');
	header('Content-Disposition: attachment; filename="campaign.csv"; filename*=utf-8\'\''.($campaign!='' ? $campaign : 'campaign').'.csv');
	header('Content-Transfer-Encoding: binary');
	header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	header('Pragma: public');
	fputcsv($out, array(
	  'Date',
	  'Campaign',
	  'Cost',
	  isset($_POST['cmdROI']) ? 'Revenue' : 'Conversions'
	));
  $res = $db->query('SELECT datum,campaign,cost,revenue FROM mm_campaign LEFT JOIN mm_data ON campaign_id = mm_campaign.id WHERE id IN ('.(is_array($_POST['cid']) ? implode(',',$_POST['cid']) : $c_id).') ORDER BY campaign_id,datum');
  while($row = mysqli_fetch_row($res))
  {
    fputcsv($out, $row);
  }
  fclose($out);    
}

?>