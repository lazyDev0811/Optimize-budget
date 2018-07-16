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

  // list all web hooks
  try
  {
    $output = Webhook::getAllWithParams(Array(),$context);
    echo json_encode(array_map(function ($item)
    {
      return Array(
        'id' => $item->id,
        'url' => $item->url,
        'event_types' => array_map(function ($evt)
        {
          return Array('name' => $evt->name);
        },$item->event_types)
      );
    },$output->webhooks));
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
