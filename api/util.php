<?php

$d = dirname(__FILE__);
define('ROOT',substr($d,0,strrpos($d,'/')));
define('PLOG',ROOT.'/system.log');

$up_err = Array(
	UPLOAD_ERR_OK => 'File uploaded successfully',
	UPLOAD_ERR_INI_SIZE => 'File size exceeds PHP limit',
	UPLOAD_ERR_FORM_SIZE => 'File size exceeds HTML-form limit',
	UPLOAD_ERR_PARTIAL => 'File is partial',
	UPLOAD_ERR_NO_FILE => 'No file received',
	UPLOAD_ERR_NO_TMP_DIR => 'Missing TEMP folder'
);

// set to the user defined error handler
if (function_exists('xdebug_disable')) xdebug_disable();
$old_error_handler = set_error_handler('myErrorHandler');
set_exception_handler('exception_handler'); 
register_shutdown_function('shutDownFunction');
spl_autoload_register('AutoLoader');

function AutoLoader($className)
{
  $file = str_replace('\\',DIRECTORY_SEPARATOR,$className);
  $path = dirname(__FILE__). DIRECTORY_SEPARATOR . $file . '.php';
  if(file_exists($path)) require_once $path;
    else return false;
}

function exception_handler($exception) 
{
  $js = Array('error'=>Array('type'=>'Exception', 'text'=>str_replace(ROOT,'',$exception->getMessage()), 'line'=>$exception->getLine(), 'file'=>str_replace(ROOT,'',$exception->getFile()), 'trace'=>get_trace($exception->getTrace())));
  echo json_encode($js,JSON_PARTIAL_OUTPUT_ON_ERROR);
  die;
}

function shutDownFunction() 
{ 
  $error = error_get_last();
  if(!empty($error) AND is_array($error))
    if ($error['type'] === E_ERROR OR $error['type'] === E_COMPILE_ERROR OR $error['type'] === E_CORE_ERROR OR $error['type'] === E_PARSE)
    {
      $error['message'] = str_replace(ROOT,'',$error['message']);
      myErrorHandler ($error['type'], $error['message'], $error['file'], $error['line'], NULL);
    }
}
  
// HTTP 200 without "application/json" - probably a FATAL error
function myErrorHandler ($errno, $errstr, $errfile, $errline, $vars)
{
  // Only handle the errors specified by the error_reporting directive or function
  // Ensure that we should be displaying and/or logging errors
  //if ( ! ($errno & error_reporting ()) || ! (ini_get ('display_errors') || ini_get ('log_errors'))) return;
  if(($errno & (E_NOTICE /*| E_STRICT*/)) OR error_reporting()==0) return true;

  // define an assoc array of error string
  // in reality the only entries we should
  // consider are 2,8,256,512 and 1024
  $errortype = array (
    1   =>  'Error',
    2   =>  'Warning',
    4   =>  'Parsing Error',
    8   =>  'Notice',
    16  =>  'Core Error',
    32  =>  'Core Warning',
    64  =>  'Compile Error',
    128 =>  'Compile Warning',
    256 =>  'User Error',
    512 =>  'User Warning',
    1024=>  'User Notice',
    2048=>  'Strict Mode',
    4096=>  'Recoverable Error'
  );
  $errstr = str_replace(ROOT,'',$errstr);
  $txt = $errstr;
  $js = Array('error'=>Array('type'=>$errortype[$errno], 'text'=>$txt, 'line'=>$errline, 'file'=>str_replace(ROOT,'',$errfile), 'trace'=>get_trace(debug_backtrace())));
  echo json_encode($js,JSON_PARTIAL_OUTPUT_ON_ERROR);
  die;
}

// produces a stack-trace
function get_trace($a)
{
  $z = Array();
	$MAXSTRLEN = 300;
	$traceArr = array_reverse($a);
	if(count($traceArr)) foreach($traceArr as $idx=>$arr)
	{
	  $func = &$arr['function'];
		if($func=='myErrorHandler' OR $func=='get_trace' OR $func=='trigger_error') continue;
		$Line = (isset($arr['line'])? $arr['line'] : "unknown");
		$File = (isset($arr['file'])? str_replace(ROOT,'',$arr['file']) : "unknown");
		$item = Array('line'=>$Line, 'file'=>$File);
    if (isset($arr['class']))
		  $item['class'] = $arr['class'];
		$args = array();
		if(!empty($arr['args'])) foreach($arr['args'] as $v)
		{
			if (is_null($v)) $args[] = 'NULL';
			elseif (is_array($v)) $args[] = '"Array['.sizeof($v).']'.(sizeof($v)<=5 ? ' '.substr(serialize($v),0,$MAXSTRLEN) : '').'"';
			elseif (is_object($v)) $args[] = '"Object: '.get_class($v).'"';
			elseif (is_bool($v)) $args[] = $v ? 'true' : 'false';
			else
      {
				$v = (string) @$v;
				//$str = substr($v,0,$MAXSTRLEN);
				//if (strlen($v) > $MAXSTRLEN) $str .= '...';
				$args[] = $v; //$str;
			}
		}
		if($func=='include_once' OR $func=='require_once' OR $func=='include' OR $func=='require') $args[0] = str_replace(ROOT,'',$args[0]);
	  $item['function'] = Array('name'=>$func!='' ? $func : 'kernel', 'args'=>$args);
	  $z[] = $item;
	}
	return $z;
}

// appends a message to the log file
function loger($x)
{
  error_log(date('[d-m-Y] (H:i:s) {'.$_SERVER['REMOTE_ADDR'].($_SERVER["HTTP_X_FORWARDED_FOR"]!='' ? ','.$_SERVER["HTTP_X_FORWARDED_FOR"] : '').($_SERVER["HTTP_X_ORIGINAL"]!='' ? ','.$_SERVER["HTTP_X_ORIGINAL"] : '').'} -> ').$x.chr(13).chr(10),3,PLOG);
}

// reduces multiple tabs/spaces to a single space and TRIMs the result
function ivo_str($z)
{
	return preg_replace('/[ \t]+/',' ',trim($z));
}

// recognize floating-point numbers using either DOT or COMMA as fractional separator
function fnum($n)
{
	return (float)str_replace(',','.',$n);
}

?>
