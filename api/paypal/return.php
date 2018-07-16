<?php
// Users are redirected to this URL after live transactions.
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

require(__DIR__.'/conf.php');
require(__DIR__.'/SDK/autoload.php');

use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;

use PayPal\Api\Agreement;

if($_GET['success']!=0)
{
  $agreement = $db->select('mm_user',$uid,'agreement_id');
  $cancel = $db->select('mm_user',$uid,'cancel_on');
  if($agreement!='' AND $cancel=='')
  {
    echo '<html><head><title>Already subscribed</title></head><body><h1 align="center">Already subscribed</h1><hr/><div align="center">You are already subscribed.<br/>You may safely close this page and switch back to the Budget Optimize tool.</div></body></html>';
    die;
  }

  // set the API context
  $context = new ApiContext(new OAuthTokenCredential($paypal_conf['client_id'],$paypal_conf['secret']));
  $context->setConfig($paypal_conf['settings']);

  $paymentToken = $_GET['token'];
  $agreement = new Agreement();
  try
  {
    // execute agreement
    $result = $agreement->execute($paymentToken,$context);
    if(isset($result->id))
    {
      // save the PayPal agreement ID to our internal user account
      $db->query('UPDATE mm_user SET agreement_id = "'.$db->escape($result->id).'", subscribe_on = NOW(), cancel_on = NULL WHERE id = '.$uid);
      $db->query('UPDATE mm_campaign SET unpaid = NULL WHERE user_id = '.$uid);
      echo '<html><head><title>Success</title></head><body><h1 align="center">Successful subscription</h1><hr/><div align="center">You have been upgraded to our <b>Paid Subscription Plan</b> with unlimited number of campaigns.
        <br/>You may safely close this page and switch back to the Budget Optimize tool.</div></body></html>';
      die;
    }
  }
  catch (\PayPal\Exception\PayPalConnectionException $ex)
  {
    echo '<html><head><title>Failure</title></head><body><h1 align="center">Failed to subscribe</h1><hr/><div align="center">You have either cancelled the request or your session has expired.</div></body></html>';
  }
}

?>
