<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../token.php');

clear_cookie();
header('Location: ../../index.html');

?>