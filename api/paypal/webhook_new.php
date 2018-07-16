<?php
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

require(__DIR__.'/conf.php');
require(__DIR__.'/SDK/autoload.php');

use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;
use PayPal\Api\Webhook;
use PayPal\Api\WebhookEventType;

function define_webhook($event)
{
  // define Web hook parameters
  return new WebhookEventType('{"name":"'.$event.'"}');
}

// BILLING.SUBSCRIPTION.CANCELLED
// BILLING.SUBSCRIPTION.CREATED
// BILLING.SUBSCRIPTION.RE-ACTIVATED
// BILLING.SUBSCRIPTION.SUSPENDED
// BILLING.SUBSCRIPTION.UPDATED
$event_list = Array(
  'BILLING.SUBSCRIPTION.CREATED',
  'BILLING.SUBSCRIPTION.CANCELLED',
  'BILLING.SUBSCRIPTION.RE-ACTIVATED',
  'BILLING.SUBSCRIPTION.SUSPENDED'
);
if(in_array($uid,$admin_id))
{
  // set the API context
  $context = new ApiContext(new OAuthTokenCredential($paypal_conf['client_id'],$paypal_conf['secret']));
  $context->setConfig($paypal_conf['settings']);

  $webhook = new Webhook();
  // Set webhook notification URL
  if(isset($_SERVER['HTTP_X_FORWARDED_PROTO']) AND $_SERVER[' HTTP_X_FORWARDED_PROTO'] === 'https') $_SERVER['HTTPS']='on';
  $url = 'https://'.$_SERVER['HTTP_HOST'].dirname($_SERVER['REQUEST_URI']).'/web_hook.php';
  $webhook->setUrl($url);

  // Set webhooks to subscribe to
  $webhook->setEventTypes(array_map('define_webhook',$event_list));

  // create the web hook
  try
  {
    $output = $webhook->create($context);
    echo json_encode(Array(
      "hook_id" => $output->getId(),
      "url" => $url
                     ));
  }
  catch(PayPal\Exception\PayPalConnectionException $ex)
  {
    unauthorized($ex->getMessage().'<br>code => '.$ex->getCode().'<br>data => '.$ex->getData());
  }
  catch(Exception $ex)
  {
    unauthorized($ex->getMessage());
  }
}
else unauthorized('{"msg":"Not an administrator"}');

?>
