<?php
error_reporting(E_ALL); ini_set('display_errors', '1');
?>
<?php
/*

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.



- BeakPi Home Automation is currently in early development and does not contain all planned features.

- Author : Iain M Hamilton - <iain@beakable.com> - http://www.beakable.com

- Copyright : Iain M Hamilton 2013

- Link : http://www.beakpi.com

- Current supported automation features :
  
  - Home Audio : 
              Requirements : 
              MPD, Mopidy, MPC, Premium Spotify Account

              Allows : 
              Currently with a hybrid mix of MPC and Mopidy functionality the app allows for you to
              control music output from the Pi

              Future : 
              Value the mix of MPC and Mopidy and if there is any reason for it
              Improve UI layout including the addition of standard player features such as repeat and randomise
              Expand on media using the Mopidy support for SoundCloud and Last.fm

- Near Future features :

  - RF Control

*/
?>
<?php 
// SETTINGS 
// ---------------------------------------------------
  $mopidySocket = "ws://192.168.1.68:6680/mopidy/ws/";
  $countryCode = "GB"; 
// AG AI AQ AR AU BB BM BO BR BS BT BZ CK CL CO CR CU DE DM DO EC FK GB 
// GD GF GI GP GT GU GY HN HT IO JM KI KN KY LC MP MQ MS MX NI NR NU NZ PA 
// PE PM PN PR PY SB SR SV TC TK TO TT TV US UY VC VE VG VU WF WS
// ---------------------------------------------------
?>



<?php
  require_once 'php/Mobile_Detect.php';
  $detect = new Mobile_Detect;
  $deviceType = ($detect->isMobile() ? ($detect->isTablet() ? 'tablet' : 'phone') : 'computer');
?>

<!DOCTYPE html>
<html>
  <head>
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="viewport" id="vp" content="initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width" />
  <meta name="viewport" id="vp" content="initial-scale=1.0,user-scalable=no,maximum-scale=1" media="(device-height: 568px)" />
  <link rel="apple-touch-icon-precomposed" href="/img/icon.png"/>  
  <link href="/img/splash-640x920.png"  media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image">
  <link rel="apple-touch-startup-image" href="/img/splash-320x460.png" media="screen and (max-device-width: 320px)" />
  <title>BeakPi</title>
    <script>
      var dojoConfig = {
       packages: [{
          name: "bpi",
          location: "/js/bpi"
        }],
  	  location: location.pathname.replace(/\/[^/]*$/, ''),
      debugAtAllCosts: true,
  	  async: true,
  	  isDebug: true,
      device: "<?php echo $deviceType ?>",
      countryCode: "<?php echo $countryCode ?>"
      }
    </script>
    <script src="js/mopidy.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/dojo/1.9.0/dojo/dojo.js"></script>

    <link rel="stylesheet" href="js/dojo/dijit/themes/claro/claro.css" />
    <link rel="stylesheet" href="js/dojo/dojox/widget/Toaster/Toaster.css" >

    <?php if ($deviceType == 'computer' || $deviceType == 'tablet') { ?>
      <link rel="stylesheet" href="css/musicPlayer.css" />
    <?php  } ?>

    <?php if ($deviceType == 'phone') { ?>
      <link rel="stylesheet" href="css/musicPlayerMobile.css" />
    <?php } ?>

      <script>
        var mopidy = new Mopidy({
            webSocketUrl: "<?php echo $mopidySocket ?>"
        });
        require([
          "dojo/parser", 
          "dojo/ready",
          "bpi/music/serviceView",
          "dojox/mobile/parser", 
          "dojox/mobile"
        ], function(parser, ready){
        	ready(function(){
        		parser.parse();
        	});
        });
      </script>
  </head>

  <body class="claro">
  	<div id="serviceView" data-dojo-type="bpi/music/serviceView"></div>
    <div class="clear"></div>
    <img src="/img/logos.png" class="logos"/>
  </body>

</html>