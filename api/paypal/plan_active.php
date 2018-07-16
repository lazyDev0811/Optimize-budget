<?php
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$plan_id = trim($_REQUEST['id']);
if($plan_id=='') unauthorized('Missing ID for the billing plan');
if(in_array($uid,$admin_id))
{
  $db->query('REPLACE INTO mm_paypal_plan(id,value) VALUES(1,"'.$db->escape($plan_id).'")');
  echo '{"active":true}';
}
else unauthorized('{"msg":"Not an administrator"}');
?>
