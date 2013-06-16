<?php
	$stat = $_GET["xhr"];
	$stat = str_replace(" ", "%20", $stat);
	$content = file_get_contents($stat);
    echo $content; 
?>