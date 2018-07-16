<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$info = Array();
if(in_array($uid,$admin_id))
{
  if($_REQUEST['export']!=0) 
  {
    $out = fopen('php://output', 'w');
    header('Content-Type: application/force-download');
		header('Content-Disposition: attachment; filename=users.csv');
		header('Content-Transfer-Encoding: binary');
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header('Pragma: public');
		fputcsv($out, array(
		  'Username',
		  'Confirmed',
		  'Full name',
		  'Created',
		  'ROI campaigns',
		  'CPA campaigns',
		  'ROI data-points',
		  'CPA data-points',
		  'Industry',
		  'Permission',
		  'Last login',
		  'Last IP addres',
		  'Wrong password',
		  'Disabled logins',
		  'Unconfirmed logins',
		  'Normal logins'
		));
  }
  $res = $db->query('SELECT mm_user.id,user_name,COALESCE(full_name,"") full_name,COALESCE(confirmed,"")="" AS confirmed,mm_user.created,
    COALESCE(mm_industry.title,"") AS industry,permit_aggregate AS permit,
    (SELECT COUNT(*) FROM mm_campaign WHERE user_id = mm_user.id AND kind = 1) AS roi_campaign,
    (SELECT COUNT(*) FROM mm_campaign WHERE user_id = mm_user.id AND kind = 2) AS cpa_campaign,
    (SELECT COUNT(*) FROM mm_campaign LEFT JOIN mm_data ON campaign_id = mm_campaign.id WHERE user_id = mm_user.id AND kind = 1) AS roi_data,
    (SELECT COUNT(*) FROM mm_campaign LEFT JOIN mm_data ON campaign_id = mm_campaign.id WHERE user_id = mm_user.id AND kind = 2) AS cpa_data,
    (SELECT stamp FROM mm_log WHERE user_id = mm_user.id AND event_id IN (1,2,3,4) ORDER BY stamp DESC LIMIT 1) AS last_login,
    (SELECT INET_NTOA(ip) FROM mm_log WHERE user_id = mm_user.id AND event_id IN (1,2,3,4) ORDER BY stamp DESC LIMIT 1) AS last_ip,
    (SELECT COUNT(*) FROM mm_log WHERE user_id = mm_user.id AND event_id = 1) AS login_wrong,
    (SELECT COUNT(*) FROM mm_log WHERE user_id = mm_user.id AND event_id = 2) AS login_disabled,
    (SELECT COUNT(*) FROM mm_log WHERE user_id = mm_user.id AND event_id = 3) AS login_pending,
    (SELECT COUNT(*) FROM mm_log WHERE user_id = mm_user.id AND event_id = 4) AS login_ok
    FROM mm_user 
    LEFT JOIN mm_industry ON industry_id = mm_industry.id
    ORDER BY last_login DESC,created DESC');
  while($row = mysqli_fetch_assoc($res)) 
  {
    $row['permit'] = (bool)$row['permit'];
    $row['confirmed'] = (bool)$row['confirmed'];
    if($_REQUEST['export']!=0)
    {
      fputcsv($out, array(
        $row['user_name'],
        $row['confirmed'] ? 'YES' : 'NO',
        (string)$row['full_name'],
        $row['created'],
        (int)$row['roi_campaign'],
        (int)$row['cpa_campaign'],
        (int)$row['roi_data'],
        (int)$row['cpa_data'],
        (string)$row['industry'],
        $row['permit'] ? 'YES' : 'NO',
        (string)$row['last_login'],
        (string)$row['last_ip'],
        (int)$row['login_wrong'],
        (int)$row['login_disabled'],
        (int)$row['login_pending'],
        (int)$row['login_ok']
      ));
    }
    else $info[] = $row;
  }
  if($_REQUEST['export']!=0)
  {
    fclose($out);    
    die;
  }
}
echo json_encode($info);

?>