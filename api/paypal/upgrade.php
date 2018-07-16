<?php
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$res = $db->query('SELECT agreement_id,cancel_on,user_name FROM mm_user WHERE id = '.$uid);
$agreement = mysqli_fetch_row($res);
$res = $db->query('SELECT value FROM mm_paypal_plan WHERE id = 1');
$active_plan = mysqli_fetch_row($res)[0];
if($agreement[0] != '' AND $agreement[1] == '')
{
  // already subscribed
  echo '<html><head><title>Already subscribed</title></head><body><h1 align="center">Already subscribed</h1><hr/></body></html>';
  die;
}
elseif($active_plan == '')
{
  // no active billing plan
  echo '<html><head><title>No active billing plan</title></head><body><h1 align="center">No active billing plan</h1><hr/></body></html>';
  die;
}

require(__DIR__.'/conf.php');
require(__DIR__.'/SDK/autoload.php');

use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;

use PayPal\Api\Agreement;
use PayPal\Api\Payer;
use PayPal\Api\Plan;

// set the API context
$context = new ApiContext(new OAuthTokenCredential($paypal_conf['client_id'],$paypal_conf['secret']));
$context->setConfig($paypal_conf['settings']);
// define new agreement
$agreement = new Agreement();
$agreement->setName('Budget Optimizer monthly agreement')
          ->setDescription('Basic Subscription')
          ->setStartDate(date('c',time()+60*5));
// assign Billing Plan
$plan = new Plan();
$plan->setId($active_plan);
$agreement->setPlan($plan);
// add payer type
$payer = new Payer();
$payer->setPaymentMethod('paypal');
$agreement->setPayer($payer);
// create the agreement
try
{
  $agreement = $agreement->create($context);
  // redirect customer to PayPal to confirm the subscription - will be redirected back to "return.php"
  header('Location: '.$agreement->getApprovalLink());
  die;
}
catch(PayPal\Exception\PayPalConnectionException $ex)
{
  include($dir.'/../emails.php');
  $mail = new_mail();
  $mail->addAddress(SMTP_CONTACT);
  $mail->Subject = 'ROI/CPA optimizer - PayPal error';
  $msg = 'While trying to subscribe customer '.$agreement[2].' an exception occurred = '.$ex->getMessage().'; '.$ex->getCode().'; '.$ex->getData();
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
  $msg = 'While trying to subscribe customer '.$agreement[2].' an exception occurred = '.$ex->getMessage();
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
