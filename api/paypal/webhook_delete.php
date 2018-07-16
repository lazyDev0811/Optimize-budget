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

if(trim($_REQUEST['id'])=='') unauthorized('{"msg":"Missing web hook ID"}');

if(in_array($uid,$admin_id))
{
  // set the API context
  $context = new ApiContext(new OAuthTokenCredential($paypal_conf['client_id'],$paypal_conf['secret']));
  $context->setConfig($paypal_conf['settings']);

  // delete a web hook
  try
  {
    $webhook = new Webhook();
    $webhook->setId($_REQUEST['id']);
    $webhook->delete($context);
    echo '{"deleted":true}';
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
