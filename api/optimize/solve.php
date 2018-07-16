<?php 
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$uid = has_login();

$arr = json_decode(file_get_contents('php://input'),TRUE,100,JSON_PARTIAL_OUTPUT_ON_ERROR);
if(!is_array($arr['list']) OR count($arr['list'])==0) unauthorized('{"msg":"Empty input"}');

switch($arr['reg_type'])
{
  case 1: // linear
    $tpl = 'linear';
    break;
  case 2: // exponential
    $tpl = 'exp';
    break;
  case 3: // logarithmic
    $tpl = 'log';
    break;
  case 4: // polynomial - only the default 2-nd order polynoms are currently expected
    $tpl = 'poly';
    break;
  case 5: // power
    $tpl = 'power';
    break;
  default:
    unaithorized('{"msg":"Unknown kind of regression = '.(int)$arr['kind'].'"}');
}

$file_model = $dir.'/ampl_'.($arr['kind']==1 ? 'roi_' : 'cpa_').$tpl.'.mod';
$file_run = tempnam(sys_get_temp_dir(), 'run_');
//$file_model = tempnam(sys_get_temp_dir(), 'mod_');
$file_data = tempnam(sys_get_temp_dir(), 'dat_');
$file_res = tempnam(sys_get_temp_dir(), 'res_');

$cmd = "reset;
model '".$file_model."';
data '".$file_data."';
option solver '".$dir."/../../ampl/minos';
solve;
printf {j in campaign} '%f\\n',cost[j] > '".$file_res."';
close '".$file_res."';
";

foreach($arr['list'] as $k=>&$v)
{
  foreach($v['regression'] as $ck=>&$cv)
    $cof[$ck].= '  c'.$k.' '.$cv."\n";
  $names.= ' c'.$k;
  $improve.= '  c'.$k.' '.(1+$v['improve']/100)."\n";
  $_min = $v['min_cost'];
  $_max = $v['max_cost'];
  if($_min<=0) $_min = 0.01;
  if($_max<=0 OR $_max>5000) $_max = 5000;
  if($_min > $_max) $_min = $_max;
  $min_c.= '  c'.$k.' '.$_min."\n";
  $max_c.= '  c'.$k.' '.$_max."\n";
}
$min_total = (float)$arr['min_total'];
$max_total = (float)$arr['max_total'];
if($min_total<=0) $min_total = 0.01;
if($max_total<=0 OR $max_total>5000) $max_total = 5000;
if($min_total > $max_total) $min_total = $max_total;

$data = 'set campaign := '.$names.";
param : z :=\n".$improve.";
param : min_cost :=\n".$min_c.";
param : max_cost :=\n".$max_c.";
param min_total := ".$min_total.";
param max_total := ".$max_total.";";
foreach($cof as $ck=>&$cv) $data.= "\nparam : e".$ck." :=\n".$cv.";";

file_put_contents($file_run,$cmd);
//file_put_contents($file_model,$model);
file_put_contents($file_data,$data);
exec($dir.'/../../ampl/ampl '.$file_run.' 2>&1', $output, $ret);
if($ret==0) $result = file($file_res);
@unlink($file_run);
@unlink($file_data);
@unlink($file_res);

/* parse result
cost [*] :=
c1  238
c2   20
c3   13.0962
c4   18.1371
;
*/

if($ret==0)
{
  $output = Array();
  foreach($arr['list'] as &$v)
    $output[] = (float)array_shift($result);
  echo json_encode($output);
}
else unauthorized('{"msg":'.json_encode('Exec error = '.$ret.chr(13).chr(10).implode(chr(13).chr(10),$output)).'}');

?>