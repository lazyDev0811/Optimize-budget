<?php
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

define("NUM_CHECK",'#^[^0-9]*((?:\\d{1,3}[, ]?)*\\d{1,3}(?:\\.\\d{1,2})?)[^0-9]*$#');
define("NUM_GET",'#[^0-9\\.]#');

$uid = has_login();

$kind = (int)$_REQUEST['kind']; // 1 = ROI, 2 = CPA
$operation = (int)$_REQUEST['operation']; // 1 = new, 2 = append, 3 = update, 4 = replace (delete old)
$no_multi = (int)$_REQUEST['no_multi']; // 1 = treat files with multiple campaigns as files with single campaign
$combine = (int)$_REQUEST['combine']; // 1 = combine all files into a single campaign
$c_id = (int)$_REQUEST['id']; // existing campaign
$c_name = trim($_REQUEST['name']); // groupname for new campaign(s)

if($kind<1 OR $kind>2) $err = 'Wrong kind of data - must be either ROI or CPA';
elseif($operation<1 OR $operation>4) $err = 'Wrong type of operation - must be Insert, Append, Update or Replace';
elseif(count($_FILES)==0) $err = 'No files were uploaded';
else
{
  if($operation==1)
  {
    if($c_name=='') $err = 'Missing group name';
  }
  else
  {
    if($c_id==0) $err = 'Missing campaign ID';
    else
    {
      $res = $db->query('SELECT kind FROM mm_campaign WHERE id = '.$c_id);
      if($db->count($res))
      {
        if($db->get_res($res)!=$kind) $err = 'This campaign is not of the requested kind';
      }
      else $err = 'Can not find this campaign ID';
    }
  }
}

if($err!='') unauthorized('{"msg":"'.$err.'"}');
else
{
  require_once($dir.'/../excel_basic/AbstractReader.php');
  require_once($dir.'/../excel_basic/Reader.php');
  require_once($dir.'/../excel_basic/Reader/Csv.php');
  require_once($dir.'/../excel_basic/Reader/Xls.php');
  require_once($dir.'/../excel_basic/Reader/Xlsx.php');

  $db->query('START TRANSACTION');
  // use a temporary table to aggregate data for duplicate dates
  // can't be done directly on the MM_DATA table - APPEND must not change existing data
	$tname = '_camp'.time();
  $db->query('CREATE TEMPORARY TABLE '.$tname.'(
    new_camp INT(11) NOT NULL default "0",
    tmp_id INT(11) NOT NULL,
    new_datum DATE NOT NULL,
    new_cost DOUBLE NOT NULL,
    new_revenue DOUBLE NOT NULL,
    PRIMARY KEY (tmp_id,new_datum)
  ) ENGINE=MEMORY');
  $stm = $db->prepare('INSERT INTO '.$tname.'(tmp_id,new_datum,new_cost,new_revenue) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE new_cost = new_cost + ?, new_revenue = new_revenue + ?');
  $base_time = mktime(0,0,0,1,1,2000);
  $camp_list = Array();
  foreach($_FILES as &$file)
  {
    if($file['error'])
    {
      $msg = $up_err[$file['error']];
      $err = 'Upload error - '.($msg!='' ? $msg : $file['error']);
      loger($err);
      continue;
    }
    if(strtolower(substr($file['name'],-4)) == '.csv')
    {
      // check for Unicode file
      $test = file_get_contents($file['tmp_name']);
      if($test{0} == chr(255) AND $test{1} == chr(254))
      {
        $test = iconv('UTF-16','UTF-8',$test);
        file_put_contents($file['tmp_name'],$test);
      }
    }
    $imported = FALSE;
    try
    {
  	  $xmldata = Reader::readUpload($file);
  	  $imported = TRUE;
    }
    catch(Exception $e)
    {
  	  $err = $e->getMessage();
  	  loger('Error importing file for campaign '.$file['name'].' - '.$err);
    }
    if($imported)
    {
      $file_name = trim(pathinfo($file['name'],PATHINFO_FILENAME));
      if($xmldata instanceof Csv) $num_sheet = 1;
        else $num_sheet = $xmldata->getSheetCount();
      for($i=1;$i<=$num_sheet;$i++)
      {
        $grid = Array();
        try
        {
  	      $grid = $xmldata->toArray($xmldata instanceof Csv ? 0 : $i);
          $len = count($grid);
          for($k=0;$k<$len;$k++)
          {
            $t = &$grid[$k];
            if(!($t[0]>1 OR preg_match('#^\\d{1,2}[\\-\\./]\\d{1,2}[\\-\\./]\\d{4}$#',$t[0]) OR strtotime($t[0],0)>0)) continue; // ignore Header - first column must be a date
            // American = M/D/Y
            // European = D-M-Y
            // ISO = Y.M.D
            if($xmldata instanceof Csv) $stamp = strtotime(preg_replace('#[/\\.]#','-',$t[0]),0);
              else $stamp = $xmldata->toUnixTimeStamp($t[0]);
            if(count($t) == 3)
            {
              // single campaign
              preg_match(NUM_CHECK,$t[1],$value);
              $cost = (float)str_replace(',','',$value[1]); // remove thousand separator
              preg_match(NUM_CHECK,$t[2],$value);
              $revenue = (float)str_replace(',','',$value[1]);
              $name = $file_name;
            }
            else if (count($t) == 4)
            {
              // multiple campaigns
              preg_match(NUM_CHECK,$t[2],$value);
              $cost = (float)str_replace(',','',$value[1]); // remove thousand separator
              preg_match(NUM_CHECK,$t[3],$value);
              $revenue = (float)str_replace(',','',$value[1]);
              if($no_multi) $name = $file_name;
                else $name = trim($t[1]);
            }
            // handle the case when file contains multiple campaigns
            if($operation==1)
            {
              if($combine) $name = $c_name;
              if(isset($camp_list[$name])) $camp_id = $camp_list[$name];
              else
              {
                $camp_id = count($camp_list);
                $camp_list[$name] = $camp_id;
              }
            }
            else $camp_id = $c_id;
            // finally add data to temporary table
            if($stamp > $base_time AND $cost > 0)
            {
              $datum = date('Y-m-d',$stamp);
              $db->bind($stm,Array($camp_id,$datum,$cost,$revenue,$cost,$revenue));
              $db->exec($stm);
            }
          }
  	    }
        catch(Exception $e)
        {
          // most probably this is empty sheet
        }
      }
    }
  }
  // all data is now in the temporary table
  if(count($camp_list)>0)
  {
    // create master upload group
    //if(count($camp_list)>1 OR !($no_multi AND $combine))
    {
      $db->query('INSERT IGNORE INTO mm_upload(upload) VALUES("'.$db->escape($c_name).'")');
      $res = $db->query('SELECT id FROM mm_upload WHERE upload = "'.$db->escape($c_name).'"');
      $group_id = $db->get_res($res);
    }
    // create new campaigns
    $stm2 = $db->prepare('INSERT INTO mm_campaign(user_id,kind,campaign,upload_id) VALUES(?,?,?,?)');
    foreach($camp_list as $k=>&$v)
    {
      $db->bind($stm2,Array($uid,$kind,$k,$group_id));
      $db->exec($stm2);
      $id = $db->last_id();
      $db->query('UPDATE '.$tname.' SET new_camp = '.$id.' WHERE tmp_id = '.$v);
    }
  }
  else $db->query('UPDATE '.$tname.' SET new_camp = tmp_id');
  switch($operation)
  {
    case 4: // replace
      $db->query('DELETE FROM mm_data WHERE campaign_id = '.$c_id);
      $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip,event_data) SELECT NOW(),'.$uid.',11,INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"),CONCAT(campaign," = ",CASE kind WHEN 1 THEN "ROI" WHEN 2 THEN "CPA" ELSE kind END) 
        FROM mm_campaign WHERE id = '.$c_id);
    case 1: // insert
    case 3: // update
      $db->query('INSERT INTO mm_data(campaign_id,datum,cost,revenue) SELECT new_camp,new_datum,new_cost,new_revenue FROM '.$tname.' ON DUPLICATE KEY UPDATE cost = cost + new_cost, revenue = revenue + new_revenue');
      $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip,event_data) SELECT NOW(),'.$uid.','.($operation==3 ? 12 : 14).',INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"),CONCAT(campaign," = ",CASE kind WHEN 1 THEN "ROI" WHEN 2 THEN "CPA" ELSE kind END) 
        FROM '.$tname.' LEFT JOIN mm_campaign ON new_camp = mm_campaign.id');
      break;
    case 2: // append
      $db->query('INSERT IGNORE INTO mm_data(campaign_id,datum,cost,revenue) SELECT new_camp,new_datum,new_cost,new_revenue FROM '.$tname);
      $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip,event_data) SELECT NOW(),'.$uid.',13,INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"),CONCAT(campaign," = ",CASE kind WHEN 1 THEN "ROI" WHEN 2 THEN "CPA" ELSE kind END) 
        FROM '.$tname.' LEFT JOIN mm_campaign ON new_camp = mm_campaign.id');
      break;
  }
  $total = $db->affected();

  if($err!='')
  {
    $db->query('ROLLBACK');
    unauthorized('{"msg": '.json_encode($err).'}');
  }
  else
  {
    // if needed - mark all campaigns after the 10-th as UNPAID
    if(!in_array($uid,$admin_id))
    {
      $agreement = $db->select('mm_user',$uid,'agreement_id');
      $cancel = $db->select('mm_user',$uid,'cancel_on');
      if($agreement == '' OR $cancel != '')
      {
        $tbl = '_paid'.time();
        $db->query('CREATE TEMPORARY TABLE '.$tbl.' SELECT id FROM mm_campaign WHERE user_id = '.$uid.' ORDER BY created LIMIT 10');
        $db->query('UPDATE mm_campaign SET unpaid = CASE WHEN EXISTS(SELECT 1 FROM '.$tbl.' AS TMP WHERE TMP.id = mm_campaign.id) THEN NULL ELSE 1 END WHERE user_id = '.$uid);
      }
    }
    $db->query('COMMIT');
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
    $info['imported'] = (int)$total;
    echo json_encode($info);
  }
}


?>
