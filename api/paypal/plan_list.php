<?php
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

require(__DIR__.'/conf.php');
require(__DIR__.'/SDK/autoload.php');

use PayPal\Api\Plan;
use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;

if(in_array($uid,$admin_id))
{
  // get the active billing plan
  $res = $db->query('SELECT value FROM mm_paypal_plan WHERE id = 1');
  if($db->count($res)) $active = mysqli_fetch_row($res)[0];
  // set the API context
  $context = new ApiContext(new OAuthTokenCredential($paypal_conf['client_id'],$paypal_conf['secret']));
  $context->setConfig($paypal_conf['settings']);
  try
  {
    $params = Array(
      'status' => 'ACTIVE',
      'page_size' => '20',
      'total_required' => 'yes',
      'page' => (int)$_REQUEST['page']
    );
    $plans = Plan::all($params, $context);
    $info = Array(
      'pages' => $plans->getTotalPages(),
      'items' => Array()
    );
    foreach($plans->getPlans() as &$plan)
    {
      $detail = Plan::get($plan->id,$context);
      $data = Array(
        'modified' => FALSE,
        'id' => $detail->id,
        'name' => $detail->name,
        'description' => $detail->description,
        'max_fail' => $detail->merchant_preferences->max_fail_attempts,
        //'url_success' => $detail->merchant_preferences->return_url,
        //'url_cancel' => $detail->merchant_preferences->cancel_url,
        'paydef' => $detail->payment_definitions[0]->name,
        'frequency' => $detail->payment_definitions[0]->frequency,
        'amount' => $detail->payment_definitions[0]->amount->value,
        'currency' => $detail->payment_definitions[0]->amount->currency
      );
      // check if this is the currently active plan
      $data['active'] = ($active == $detail->id);
      // append to the list of plans
      $info['items'][] = $data;
    }
    echo json_encode($info);
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
else unauthorized('Not an administrator');
?>
