<?php

$sandbox = TRUE;
$paypal_price = 10; // monthly subscription
$paypal_currency = 'AUD';
$paypal_plan = 'P-35053603LP602021DCGLZQMY';
$paypal_hook = '6X830867E04990146';
$webhook_url = 'https://www.oneegg.com.au/budget-optimize/api/paypal/web_hook.php';
if($sandbox)
{
  // sandbox
  $paypal_conf = Array(
    'client_id' => 'Ab1Ns2wjvIDng9EOUge55OoWuF2Qs_4H9WodP-mW31xr2H4iys6yZDa3jocrXGPCNE6eAwtaEkuCtizV',
    'secret' => 'EIZtZXs_8Z306bopBxZhrMRXIHrGG5KeW0YWBFYuB9S8ETRxDVLaWxcV67Sl5K0RgY4KY8QGsjmxRVWn',
    'return_url' => 'https://www.oneegg.com.au/budget-optimize/api/paypal/return.php',
    'settings' => Array(
      'mode' => 'sandbox',
      'http.ConnectionTimeOut' => 3000, // milliseconds
      'log.LogEnabled' => TRUE,
      'log.FileName' => __DIR__.'/log/paypal_sandbox.log',
      'log.LogLevel' => 'DEBUG'
    )
  );
}
else
{
  // live
  $paypal_conf = Array(
    'client_id' => 'Ab1Ns2wjvIDng9EOUge55OoWuF2Qs_4H9WodP-mW31xr2H4iys6yZDa3jocrXGPCNE6eAwtaEkuCtizV',
    'secret' => 'EIZtZXs_8Z306bopBxZhrMRXIHrGG5KeW0YWBFYuB9S8ETRxDVLaWxcV67Sl5K0RgY4KY8QGsjmxRVWn',
    'return_url' => 'https://www.oneegg.com.au/budget-optimize/api/paypal/return.php',
    'settings' => Array(
      'mode' => 'live',
      'http.ConnectionTimeOut' => 3000, // milliseconds
      'log.LogEnabled' => TRUE,
      'log.FileName' => __DIR__.'/log/paypal_live.log',
      'log.LogLevel' => 'WARN'
    )
  );
}

?>
