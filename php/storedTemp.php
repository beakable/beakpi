<?php
	$temperatures = file_get_contents('http://192.168.1.68:5984/temperature/_design/Temp/_view/Temp');
	echo $temperatures;

	// Requires the following output in couchDB saved as Tenp:

	//	function(doc) {
	//	  emit(doc.time, doc.temp);
	//	}	
?>