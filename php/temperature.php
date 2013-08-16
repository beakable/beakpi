<?php
	error_reporting(E_ALL); ini_set('display_errors', '1');
?>
<?php
	exec("sudo usbtenkiget -T f", $response);
	echo json_encode($response);
?>
