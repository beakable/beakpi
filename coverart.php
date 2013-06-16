<?php
function fetch($url) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_TIMEOUT, 20);
  $data = curl_exec($ch);
  curl_close($ch);
  return $data;
}

function getAlbumArt($url) {
  $html = fetch($url);
    if ($html == true) {
      $doc = new DOMDocument();
      @$doc->loadHTML($html);
      $tags = $doc->getElementsByTagName('img');
      foreach ($tags as $tag) {
        if ($tag->getAttribute('id') == "big-cover") {
          $src = trim($tag->getAttribute('src'));
          $src = explode(":large", $src);
          echo $src[0];
        }
      }
    }
  return false;
}

$stat = $_GET["xhr"];
$split = explode(":", $stat);
getAlbumArt("http://open.spotify.com/track/".$split[2]);
?>