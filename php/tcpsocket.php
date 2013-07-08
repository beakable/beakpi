<?php
	$xmlpost = $_POST['xmlpost'];

	$rfSocket = stream_socket_client("tcp://192.168.1.68:50333",$errno,$errstr,2);

	fputs($rfSocket, $xmlpost );

	stream_set_timeout($rfSocket, 1);

	$rfSocketResonse = stream_get_contents($rfSocket, -1);
	$simplexml = simplexml_load_string($rfSocketResonse);
	echo json_encode($simplexml);
?>