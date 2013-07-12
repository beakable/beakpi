<?php
  exec('ps -aux', $processes);
  foreach($processes as $process){
    $cols = split(' ', ereg_replace(' +', ' ', $process));
    if (strpos($cols[2], '.') > -1){
      $cpuUsage += floatval($cols[2]);
    }
  }

  exec("cat /proc/meminfo", $memory);
  $totalMem = preg_replace('/[^0-9.]+/', '', $memory[0])/1024;
  $usedMem = preg_replace('/[^0-9.]+/', '', $memory[1])/1024;
  echo $cpuUsage . "|". round($totalMem,2) . "|" . round($usedMem,2);
?>