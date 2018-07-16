<?php
// here we receive web hook notifications from PayPal
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');

require(__DIR__.'/conf.php');
require(__DIR__.'/SDK/autoload.php');
define('HOOK_LOG',__DIR__.'/log/webhook.log');

use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;
use PayPal\Api\VerifyWebhookSignature;

// set the API context
$context = new ApiContext(new OAuthTokenCredential($paypal_conf['client_id'],$paypal_conf['secret']));
$context->setConfig($paypal_conf['settings']);

$body = file_get_contents('php://input');
$headers = array_change_key_case(getallheaders(), CASE_UPPER);

$signatureVerification = new VerifyWebhookSignature();
$signatureVerification->setAuthAlgo($headers['PAYPAL-AUTH-ALGO']);
$signatureVerification->setTransmissionId($headers['PAYPAL-TRANSMISSION-ID']);
$signatureVerification->setCertUrl($headers['PAYPAL-CERT-URL']);
$signatureVerification->setTransmissionSig($headers['PAYPAL-TRANSMISSION-SIG']);
$signatureVerification->setTransmissionTime($headers['PAYPAL-TRANSMISSION-TIME']);
$signatureVerification->setRequestBody($body);

$signatureVerification->setWebhookId($paypal_hook); // Note that the Webhook ID must be a currently valid Webhook that you created with your client ID/secret.

function getSslPage($url)
{
  $ch = curl_init();
  curl_setopt_array($ch, Array(
    CURLOPT_URL => $url,
    CURLOPT_REFERER => $url,
    CURLOPT_SSL_VERIFYPEER => FALSE,
    CURLOPT_HEADER => false,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_RETURNTRANSFER => TRUE,
    CURLOPT_USERAGENT => "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36",
  ));
  $result = curl_exec($ch);
  curl_close($ch);
  return $result;
}

try
{
  $output = $signatureVerification->post($context);
  $valid = ($output->getVerificationStatus() == 'SUCCESS');

  // TransmissionId|TransmissionTimeStamp|WebhookId|CRC32 as per PayPal documentation
  /*
  $sigString = $headers['PAYPAL-TRANSMISSION-ID'].'|'.$headers['PAYPAL-TRANSMISSION-TIME'].'|'.$paypal_hook.'|'.crc32($body);
  $ssl_cert = getSslPage($headers['PAYPAL-CERT-URL']);
  $pubKey = openssl_pkey_get_public($ssl_cert);
  $details = openssl_pkey_get_details($pubKey);

  $verifyResult = openssl_verify($sigString, base64_decode($headers['PAYPAL-TRANSMISSION-SIG']), $details['key'], $headers['PAYPAL-AUTH-ALGO']); //'sha256WithRSAEncryption'
  if ($verifyResult === 1)
*/
  if($valid)
  {
    $json = json_decode($body,TRUE);
    if($json['event_type']=='BILLING.SUBSCRIPTION.CREATED' OR $json['event_type']=='BILLING.SUBSCRIPTION.RE-ACTIVATED')
    {
      $plan_id = $json['resource']['id'];
      mail_paypal($plan_id,TRUE);
    }
    elseif($json['event_type']=='BILLING.SUBSCRIPTION.CANCELLED' OR $json['event_type']=='BILLING.SUBSCRIPTION.SUSPENDED')
    {
      $plan_id = $json['resource']['id'];
      mail_paypal($plan_id,FALSE);
    }
  }
  //else error_log($body.chr(13).chr(10),3,HOOK_LOG);
}
catch(PayPal\Exception\PayPalConnectionException $ex)
{
  $msg = 'msg = '.$ex->getMessage().', code = '.$ex->getCode().', data = '.$ex->getData();
  error_log($msg,3,HOOK_LOG);
  include($dir.'/../emails.php');
  $mail = new_mail();
  $mail->addAddress(SMTP_CONTACT);
  $mail->Subject = 'ROI/CPA optimizer - PayPal error';
  $msg = "While receiving Web hook callback an exception occurred\n".$msg;
  $mail->Body = $msg;
  try
  {
    if(!$mail->send()) error_log($msg);
  }
  catch(Exception $exc)
  {
    error_log('While sending a notification for PayPal error, PHP Mailer raised an exception = '.$exc->getMessage());
  }
}
catch(Exception $ex)
{
  error_log('msg = '.$ex->getMessage(),3,HOOK_LOG);
}

if (!function_exists('getallheaders'))
{
  function getallheaders()
  {
    $headers = [];
    foreach ($_SERVER as $name => $value)
    {
      if (substr($name, 0, 5) == 'HTTP_')
      {
        $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
      }
    }
    return $headers;
  }
}
?>
