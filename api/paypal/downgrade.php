<?php
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$res = $db->query('SELECT agreement_id,cancel_on,user_name FROM mm_user WHERE id = '.$uid);
$agr = mysqli_fetch_row($res);
if($agr[0] == '' OR $agr[1] != '')
{
  // not subscribed
  echo '<html><head><title>Not subscribed</title></head><body><h1 align="center">Not subscribed</h1><hr/></body></html>';
  die;
}

require(__DIR__.'/conf.php');
require(__DIR__.'/SDK/autoload.php');

use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;

use PayPal\Api\Agreement;
use PayPal\Api\AgreementStateDescriptor;

// set the API context
$context = new ApiContext(new OAuthTokenCredential($paypal_conf['client_id'],$paypal_conf['secret']));
$context->setConfig($paypal_conf['settings']);
// define new agreement
$agreement = new Agreement();
$agreement->setId($agr[0]);
$note = new AgreementStateDescriptor();
$note->setNote('Cancellation requested by customer');
// cancel the agreement
try
{
  $agreement->cancel($note,$context);
  $db->query('UPDATE mm_user SET cancel_on=NOW() WHERE id = '.$uid);
  $tbl = '_paid'.time();
  $db->query('CREATE TEMPORARY TABLE '.$tbl.' SELECT id FROM mm_campaign WHERE user_id = '.$uid.' ORDER BY created LIMIT 10');
  $db->query('UPDATE mm_campaign SET unpaid = CASE WHEN EXISTS(SELECT 1 FROM '.$tbl.' AS TMP WHERE TMP.id = mm_campaign.id) THEN NULL ELSE 1 END WHERE user_id = '.$uid);
  echo '<html><head><title>Unsubscribed</title></head><body><h1 align="center">Unsubscribed</h1><hr/><div align="center">You have been successfully downgraded to our <b>Free Plan</b>.<br/>We are sorry that you no longer see value in our service.</div></body></html>';
  die;
}
catch(PayPal\Exception\PayPalConnectionException $ex)
{
  include($dir.'/../emails.php');
  $mail = new_mail();
  $mail->addAddress(SMTP_CONTACT);
  $mail->Subject = 'ROI/CPA optimizer - PayPal error';
  $msg = 'While trying to unsubscribe customer '.$agr[2].' an exception occurred = '.$ex->getMessage().'; '.$ex->getCode().'; '.$ex->getData();
  $mail->Body = $msg;
  try
  {
    if(!$mail->send()) error_log($msg);
  }
  catch(Exception $exc)
  {
    error_log('While sending a notification for PayPal error, PHP Mailer raised an exception = '.$exc->getMessage());
  }
  echo '<html><head><title>Internal Error</title></head><body><h1 align="center">Internal Error</h1><hr/><div align="center">Our team was notified and will fix the issue as soon as possible.</div></body></html>';
}
catch(Exception $ex)
{
  include($dir.'/../emails.php');
  $mail = new_mail();
  $mail->addAddress(SMTP_CONTACT);
  $mail->Subject = 'ROI/CPA optimizer - PayPal error';
  $msg = 'While trying to unsubscribe customer '.$agr[2].' an exception occurred = '.$ex->getMessage();
  $mail->Body = $msg;
  try
  {
    if(!$mail->send()) error_log($msg);
  }
  catch(Exception $exc)
  {
    error_log('While sending a notification for PayPal error, PHP Mailer raised an exception = '.$exc->getMessage());
  }
  echo '<html><head><title>Internal Error</title></head><body><h1 align="center">Internal Error</h1><hr/><div align="center">Our team was notified and will fix the issue as soon as possible.</div></body></html>';
}

?>
