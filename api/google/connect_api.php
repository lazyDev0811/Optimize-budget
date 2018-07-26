<?php
$dir = dirname(__FILE__);
include_once($dir.'/../token.php');
define(NUM_CHECK,'#^[^0-9]*((?:\\d{1,3}[, ]?)*\\d{1,3}(?:\\.\\d{1,2})?)[^0-9]*$#');
define(NUM_GET,'#[^0-9\\.]#');
$uid = has_login();

require __DIR__ . '/vendor/autoload.php';

use Google\Auth\OAuth2;

use Google\AdsApi\AdWords\AdWordsSession;
use Google\AdsApi\AdWords\AdWordsSessionBuilder;
use Google\AdsApi\AdWords\Query\v201802\ReportQueryBuilder;
use Google\AdsApi\AdWords\Reporting\v201802\DownloadFormat;
use Google\AdsApi\AdWords\Reporting\v201802\ReportDefinitionDateRangeType;
use Google\AdsApi\AdWords\Reporting\v201802\ReportDownloader;
use Google\AdsApi\AdWords\ReportSettingsBuilder;
use Google\AdsApi\AdWords\v201802\cm\ReportDefinitionReportType;
use Google\AdsApi\Common\OAuth2TokenBuilder;

session_start();

$oauth2 = new OAuth2([
    'authorizationUri' => 'https://accounts.google.com/o/oauth2/v2/auth',
    'tokenCredentialUri' => 'https://www.googleapis.com/oauth2/v4/token',
    'redirectUri' => 'https://optimize.oneegg.com.au/api/google/connect_api.php',
    'clientId' => '821197463542-847jqv6so2stgq8qm7u36toi9hlbbafq.apps.googleusercontent.com',
    'clientSecret' => 'Fqe5vhaPhujWfBUkzP8etIjn',
    'scope' => 'https://www.googleapis.com/auth/adwords',
    'approval_prompt' => 'force'
]);

if (!isset($_GET['code'])) {
    // Create a 'state' token to prevent request forgery.
    // Store it in the session for later validation.
    $oauth2->setState(sha1(openssl_random_pseudo_bytes(1024)));
    $_SESSION['oauth2state'] = $oauth2->getState();
    $kind = $_REQUEST['data_type'];
    $_SESSION['data_type'] = $kind;
    $customer_client_id = $_REQUEST['customer_id'];
    $_SESSION['customer_id'] = $customer_client_id;
    // Redirect the user to the authorization URL.
    $config = [
      // Set to 'offline' if you require offline access.
      'access_type' => 'offline'
    ];
    $url = $oauth2->buildFullAuthorizationUri($config);
    echo json_encode(Array(
        "url" => ''.$url,
    ));
    // header('Access-Control-Allow-Origin: *');
    // header('Location: ' . $url);
    // exit;
}
// Check given state against previously stored one to mitigate CSRF attack.
elseif (empty($_GET['state']) || ($_GET['state'] !== $_SESSION['oauth2state'])) {
    unset($_SESSION['oauth2state']);
    exit('Invalid state.');
} else {
    $oauth2->setCode($_GET['code']);
    $authToken = $oauth2->fetchAuthToken();

    // Store the refresh token for your user in your local storage if you
    // requested offline access.
    $refreshToken = $authToken['refresh_token'];

    $kind = (int)$_SESSION['data_type'];
    $customer_client_id = $_SESSION['customer_id'];
    // unset($_SESSION['oauth2state']);

    $session = (new AdWordsSessionBuilder())
        ->withDeveloperToken("jHKEGVhmM6_vm4n_rScSfw")
        ->withOAuth2Credential($oauth2)
        ->withClientCustomerId($customer_client_id)
        ->build();

    // Create report query to get the data for last 7 days.
    $query = (new ReportQueryBuilder())
        ->select([
            'Date',
            'CampaignName',
            'Cost',
            'AllConversionValue',
            'Conversions'
            
        ])
        ->from(ReportDefinitionReportType::CRITERIA_PERFORMANCE_REPORT)
        ->where('Status')->in(['ENABLED'])
        ->duringDateRange(ReportDefinitionDateRangeType::LAST_30_DAYS)
        ->build();
    
    // Download report as a string.
    $reportDownloader = new ReportDownloader($session);
    // Optional: If you need to adjust report settings just for this one
    // request, you can create and supply the settings override here.
    // Otherwise, default values from the configuration
    // file (adsapi_php.ini) are used.
    $reportSettingsOverride = (new ReportSettingsBuilder())
        ->includeZeroImpressions(false)
        ->build();
    
    $reportDownloadResult = $reportDownloader->downloadReportWithAwql(
        sprintf('%s', $query),
        DownloadFormat::CSV,
        $reportSettingsOverride
    );

    $filename = tempnam(sys_get_temp_dir(), 'report-') . '.csv';

    $reportDownloadResult->saveToFile($filename);

    include_once($dir.'/../util.php');
    include_once($dir.'/../db.php');

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

    // check for Unicode file
    $test = file_get_contents($filename);
    if($test{0} == chr(255) AND $test{1} == chr(254))
    {
      $test = iconv('UTF-16','UTF-8',$test);
      file_put_contents($filename,$test);
    }

    $imported = FALSE;
    try
    {
  	  $xmldata = Reader::readFile($filename);
  	  $imported = TRUE;
    }
    catch(Exception $e)
    {
  	  $err = $e->getMessage();
  	  loger('Error importing file for campaign '.$filename.' - '.$err);
    }
    
    if($imported)
    {
        $file_name = trim(pathinfo($filename,PATHINFO_FILENAME));
        $grid = Array();
        try
        {
            $grid = $xmldata->toArray(0);
            $len = count($grid);
            
            for($k=0;$k<$len;$k++)
            {
                $t = &$grid[$k];
                if(!($t[0]>1 OR preg_match('#^\\d{1,2}[\\-\\./]\\d{1,2}[\\-\\./]\\d{4}$#',$t[0]) OR strtotime($t[0],0)>0)) continue; // ignore Header - first column must be a date
                // American = M/D/Y
                // European = D-M-Y
                // ISO = Y.M.D
                $stamp = strtotime(preg_replace('#[/\\.]#','-',$t[0]),0);
                
                if(count($t) == 3)
                {
                    // single campaign
                    preg_match(NUM_CHECK,$t[1],$value);
                    $cost = ((float)str_replace(',','',$value[1]))/1000000; // remove thousand separator and convert microns to dolar
                    preg_match(NUM_CHECK,$t[2],$value);
                    $revenue = (float)str_replace(',','',$value[1]);
                    $name = $file_name;
                }
                else if (count($t) == 4)
                {
                    // multiple campaigns
                    preg_match(NUM_CHECK,$t[2],$value);
                    $cost = ((float)str_replace(',','',$value[1]))/1000000; // remove thousand separator and convert microns to dolar
                    preg_match(NUM_CHECK,$t[3],$value);
                    $revenue = (float)str_replace(',','',$value[1]);
                    $name = trim($t[1]);
                }
                else if (count($t) == 5)
                {
                    // multiple campaigns
                    preg_match(NUM_CHECK,$t[2],$value);
                    $cost = ((float)str_replace(',','',$value[1]))/1000000; // remove thousand separator and convert microns to dolar
                    
                    if($kind == 1)preg_match(NUM_CHECK,$t[3],$value);
                    else preg_match(NUM_CHECK,$t[4],$value);
                    $revenue = (float)str_replace(',','',$value[1]);
                    $name = trim($t[1]);
                }
                // handle the case when file contains multiple campaigns
                // if($operation==1)
                // {
                    // if($combine) $name = $c_name;
                    if(isset($camp_list[$name])) $camp_id = $camp_list[$name];
                    else
                    {
                        $camp_id = count($camp_list);
                        $camp_list[$name] = $camp_id;
                    }
                // }
                // else $camp_id = $c_id;
                
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

    // all data is now in the temporary table
    if(count($camp_list)>0)
    {
        // create master upload group
        {
        $db->query('INSERT IGNORE INTO mm_upload(upload) VALUES("'.$db->escape("API".$customer_client_id).'")');
        $res = $db->query('SELECT id FROM mm_upload WHERE upload = "'.$db->escape("API".$customer_client_id).'"');
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

    $db->query('INSERT INTO mm_data(campaign_id,datum,cost,revenue) SELECT new_camp,new_datum,new_cost,new_revenue FROM '.$tname.' ON DUPLICATE KEY UPDATE cost = cost + new_cost, revenue = revenue + new_revenue');
    $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip,event_data) SELECT NOW(),'.$uid.','.($operation==3 ? 12 : 14).',INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"),CONCAT(campaign," = ",CASE kind WHEN 1 THEN "ROI" WHEN 2 THEN "CPA" ELSE kind END) 
    FROM '.$tname.' LEFT JOIN mm_campaign ON new_camp = mm_campaign.id');
    
    $total = $db->affected();
    $tmp_data = $db->query('SELECT new_camp,new_datum,new_cost,new_revenue FROM '.$tname);
    
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
    }

    // print $reportDownloadResult->getAsString();

    // $campaignService = $adWordsServices->get($session, CampaignService::class);

    header('Access-Control-Allow-Origin: *');
    header('Location: ' . 'https://optimize.oneegg.com.au/#/import', true, 302);
    exit();
}