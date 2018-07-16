<?php
define('DATABASE_HOST','127.0.0.1');
define('DATABASE_NAME','optimize');
define('DATABASE_USER','oneegg');
define('DATABASE_PASS','optimizer');

define('SMTP_HOST','localhost');
define('SMTP_PORT',587);
define('SMTP_SSL','tls'); // empty, 'ssl' or 'tls'
define('SMTP_USER','auth_user@optimize.oneegg.com.au');
define('SMTP_PASS','auth_pass');

define('SMTP_FROM','noreply@optimize.oneegg.com.au');
define('SMTP_CONTACT','mrmeyerson@gmail.com');
define('USE_SMTP',FALSE); // whether to use SMTP directly or rely on PHP's mail()

$video = Array(
  Array('title'=>'Intro & Theory','video'=>'X4YRIB9pvbQ'),
  Array('title'=>'Import Data','video'=>'RFWtNAe6Lvk'),
  Array('title'=>'Understanding the Output','video'=>'MY5bT-3arJA')
);
$admin_id = Array(5,96,102); // IDs from table mm_user for Administrator privileges

?>