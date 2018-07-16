<?php 

define('TYPE_CRYPT','AES-256-CBC'); // encryption algorithm

define('SALT','Z5~scadN}g<;<^U7TauwG6Y9%}pV)d-A'); // the symmetric password to encrypt the cookie value
define('COOKIE_TOKEN','_mm_token'); // cookie name for the token
define('TOKEN_TIME',7776000); // token validity in seconds
define('COOKIE_INFO','_mm_info'); // cookie name for the login information

// Encode after encryption to ensure encrypted characters are savable
function token_encode($salt, $string) 
{
	// Using initialization vector adds more security
	$iv_size = openssl_cipher_iv_length(TYPE_CRYPT);
	$iv = openssl_random_pseudo_bytes($iv_size);
  
	$encrypted_string = openssl_encrypt($string, TYPE_CRYPT, $salt, 0, $iv);
	
	// Return initialization vector + encrypted string (already Base64-encoded by OpenSSL)
	// We'll need the $iv when decoding.
	return $encrypted_string.':'.base64_encode($iv);
}

// Decode before decryption
function token_decode($salt, $string) 
{
	// Extract the initialization vector from the encrypted string.
	list($encrypted_string, $iv) = explode(':', $string);
	$string = openssl_decrypt($encrypted_string, TYPE_CRYPT, $salt, 0, base64_decode($iv));
	return $string;
} 

function clear_cookie()
{
  setcookie(COOKIE_TOKEN, '', time() - 300, '/');
  setcookie(COOKIE_INFO, '', time() - 300, '/');
}

function unauthorized($msg = '')
{
  if($msg != '')
  {
    header('HTTP/1.1 403 Permission denied', true, 403);
    header('Content-Type: application/json');
    echo $msg;
  }
  else
  {
    header('HTTP/1.1 401 Unauthorized', true, 401);
    header('Content-Type: application/json');
    clear_cookie();
    echo '{"msg":"Unauthorized"}';
  }
  die;
}

function make_cookie($id)
{
  $stamp = time();
  return Array(
    'at' => $stamp,
    'server' => $_SERVER['SERVER_NAME'],
    'ip' => $_SERVER['REMOTE_ADDR'],
    'exp' => $stamp + TOKEN_TIME,
    'id' => $id
  );
}

function send_token($js)
{
  // use setRawCookie and rawUrlEncode to properly encode spaces to %20 instead of +
  setrawcookie(COOKIE_TOKEN, rawurlencode(token_encode(SALT,json_encode($js))), 0, '/'); // expire when browser closed
}

function send_info_cookie($js)
{
  // use setRawCookie and rawUrlEncode to properly encode spaces to %20 instead of +
  setrawcookie(COOKIE_INFO, rawurlencode(json_encode($js)), 0, '/'); // expire when browser closed
}

// checks for valid unexpired token,
// extends the validity of the token for another TOKEN_TIME seconds
function has_login()
{
  if(isset($_COOKIE[COOKIE_TOKEN]))
  {
   	$stamp = time();
    $text = token_decode(SALT,$_COOKIE[COOKIE_TOKEN]);
    if($text != '')
    {
      $json = json_decode($text,true);
      if(json_last_error() == JSON_ERROR_NONE)
      {
      	if($json['at'] <= $stamp AND $json['exp'] > $stamp AND $json['server'] == $_SERVER['SERVER_NAME'] AND $json['ip'] == $_SERVER['REMOTE_ADDR'] AND $json['id'] != 0) 
      	{
      	  // extend the token lifetime
      	  $json['at'] = $stamp;
      	  $json['exp'] = $stamp + TOKEN_TIME;
      	  send_token($json);
  
      	  return $json['id'];
      	}
      	else unauthorized();
      }
      else unauthorized();
    }
    else unauthorized();
  }
  else unauthorized();
}

// used to generate unique hashes (e.g. for e-mail confirmations)
function my_rand($len = 64)
{
  return openssl_random_pseudo_bytes($len);
}

?>