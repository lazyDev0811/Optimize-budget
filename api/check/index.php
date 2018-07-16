<?php
$dir = dirname(__FILE__);
include_once($dir.'/../util.php');
include_once($dir.'/../db.php');
include_once($dir.'/../token.php');

$res = $db->query('SELECT id,COALESCE(full_name,"") AS full_name FROM mm_user WHERE confirmed = "'.$db->escape($_GET['s']).'" AND user_name = "'.$db->escape($_GET['m']).'" LIMIT 1');
$found = $db->count($res);
if($found)
{
  $row = mysqli_fetch_row($res);
  $db->query('UPDATE mm_user SET confirmed = NULL WHERE id = '.(int)$row[0]);
  $db->query('INSERT INTO mm_log(stamp,user_id,event_id,ip) VALUES(NOW(),'.(int)$row[0].',5,INET_ATON("'.$_SERVER['REMOTE_ADDR'].'"))');
  send_info_cookie(Array('id'=>$row[0], 'full_name'=>$row[1]!='' ? $row[1] : 'Customer #'.$row[0], 'confirmed'=>$db->affected()!=0, 'is_admin'=>in_array($row[0],$admin_id)));
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />

  <title>ROI/CPA optimizer</title>
  <style>
  .notify
  {
    display: table;
    position: fixed;
    top: 50%;
    left: 50%;
    max-height: 50%;   
    transform: translate(-50%, -50%); 

    font-size: 1.2em;     
    min-height: 1em;
    padding: 0 16px;
    line-height: 1.4285em;
    color: rgba(0, 0, 0, 0.87);
    -webkit-transition: opacity 0.1s ease, color 0.1s ease, background 0.1s ease, box-shadow 0.1s ease;
    transition: opacity 0.1s ease, color 0.1s ease, background 0.1s ease, box-shadow 0.1s ease;
    border-radius: 6px;
  }
  .notify .header
  {
    display: block;
    font-family: 'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif;
    text-align: center;
  }
  .notify p
  {
    opacity: 0.85;
    margin: 0.75em 0em;   
  }
  a
  {
    text-decoration: none;
    color: orange;
  }
  
  .success
  {
    background-color: #fcfff5;
    color: #2c662d;     
    box-shadow: 0px 0px 0px 1px #a3c293 inset, 0px 0px 0px 0px rgba(0, 0, 0, 0);     
  }
  .warning
  {
    background-color: #fffaf3;
    color: #573a08; 
    box-shadow: 0px 0px 0px 1px #c9ba9b inset, 0px 0px 0px 0px rgba(0, 0, 0, 0);     
  }
  .success .header
  {
    color: #1a531b; 
  }
  .warning .header
  {
    color: #794b02;   
  }
  </style>
</head>
<body>  
<?php
if($found)
{
  // show acknowledgment and congratulations
  echo '
    <div class="notify success">
      <h2 class="header">
        You successfully confirmed your e-mail.
      </h2>
      <p>You are now allowed to use all features of the <a href="/index.html">ROI/CPA optimizer</a></p>
    </div';
}
else
{
  // wrong hash or already confirmed
  echo '
    <div class="notify warning">
      <h2 class="header">
        This confirmation link is either expired or you have already confirmed your e-mail!
      </h2>
      <p>Go to your profile at <a href="/#/profile">ROI/CPA optimizer</a> to re-issue another confirmation.</p>
    </div>';
}
  
?>
</body>
</html>