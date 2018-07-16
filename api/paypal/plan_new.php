<?php
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

require(__DIR__.'/conf.php');
require(__DIR__.'/SDK/autoload.php');

use PayPal\Api\Currency;
use PayPal\Api\MerchantPreferences;
use PayPal\Api\PaymentDefinition;
use PayPal\Api\Plan;
use PayPal\Api\Patch;
use PayPal\Api\PatchRequest;
use PayPal\Common\PayPalModel;
use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;

$arr = json_decode(file_get_contents('php://input'),TRUE,100,JSON_PARTIAL_OUTPUT_ON_ERROR);
if(trim($arr['name'])=='') $err = 'Missing name for the billing plan';
elseif(trim($arr['description'])=='') $err = 'Missing description for the payment definition';
elseif(trim($arr['paydef'])=='') $err = 'Missing name for the payment definition';
elseif(!in_array(strtoupper($arr['frequency']),Array('DAY','WEEK','MONTH','YEAR'))) $err = 'Invalid frequency';
elseif($arr['amount']<1) $err = 'Missing price';
elseif(strlen($arr['currency'])!=3) $err = 'Missing currency';
elseif($arr['max_fail']<0 OR $arr['max_fail']>12) $err = 'Invalid number for MAX failed billing attempts';
//elseif($arr['url_success']=='') $err = 'Missing URL for success';
//elseif($arr['url_cancel']=='') $err = 'Missing URL for cancel';
if($err!='') unauthorized('{"msg":"'.$err.'"}');

if(in_array($uid,$admin_id))
{
  // set the API context
  $context = new ApiContext(new OAuthTokenCredential($paypal_conf['client_id'], $paypal_conf['secret']));
  $context->setConfig($paypal_conf['settings']);
  // define a new billing plan
  $plan = new Plan();
  $plan->setName($arr['name'])
       ->setDescription((string)$arr['description'])
       ->setType('infinite');
  $paydef = new PaymentDefinition();
  $paydef->setName($arr['paydef'])
         ->setType('REGULAR')
         ->setFrequency($arr['frequency'])
         ->setFrequencyInterval('1')
         ->setCycles('0')
         ->setAmount(new Currency(Array(
                                    'value'    => (double)$arr['amount'],
                                    'currency' => $arr['currency'])));
  $merchant = new MerchantPreferences();
  $merchant->setReturnUrl($paypal_conf['return_url'].'?success=1')
           ->setCancelUrl($paypal_conf['return_url'].'?cancel=1')
           ->setAutoBillAmount('yes')
           ->setInitialFailAmountAction('CONTINUE')
           ->setMaxFailAttempts($arr['max_fail']);
  $plan->setPaymentDefinitions(array($paydef));
  $plan->setMerchantPreferences($merchant);
  // create the plan
  try
  {
    $new_plan = $plan->create($context);
    try
    {
      $patch = new Patch();
      $value = new PayPalModel('{"state":"ACTIVE"}');
      $patch->setOp('replace')
            ->setPath('/')
            ->setValue($value);
      $patchRequest = new PatchRequest();
      $patchRequest->addPatch($patch);
      $new_plan->update($patchRequest, $context);
      $plan = Plan::get($new_plan->getId(), $context);
      echo '{"plan_id":'.json_encode($plan->getId()).'}';
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
