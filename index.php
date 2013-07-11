<?php
error_reporting(E_ALL); ini_set('display_errors', '1');
?>
<?php 
// SETTINGS 
// ---------------------------------------------------
  $RadioFrequencyController = true;
  $RadioFrequencySHAPassword = "b02e5b66ace6dc3b459be661062c452b50ea1c13";
  $MopidyMusicPlayer = true;
  $mopidySocket = "ws://192.168.1.68:6680/mopidy/ws/";
  $countryCode = "GB";
// AG AI AQ AR AU BB BM BO BR BS BT BZ CK CL CO CR CU DE DM DO EC FK GB 
// GD GF GI GP GT GU GY HN HT IO JM KI KN KY LC MP MQ MS MX NI NR NU NZ PA 
// PE PM PN PR PY SB SR SV TC TK TO TT TV US UY VC VE VG VU WF WS
// ---------------------------------------------------
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
      rfController: "<?php echo $RadioFrequencyController ?>",
      mopidyPlayer: "<?php echo $MopidyMusicPlayer ?>",
      device: "<?php echo $deviceType ?>",
      countryCode: "<?php echo $countryCode ?>",
      radioFrequencySHAPassword: "<?php echo $RadioFrequencySHAPassword ?>"
      }
    </script>
    <script src="js/mopidy.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/dojo/1.9.0/dojo/dojo.js"></script>
<!--<script src="js/dojo/dojo/dojo.js"></script>-->
    <link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/dojo/1.9.1/dijit/themes/claro/claro.css">
    <link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/dojo/1.9.1/dojox/widget/Toaster/Toaster.css">

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
          "dojo/_base/lang",
          "dojo/on",
          "dojo/fx",
          "dojo/dom",
          "dojo/dom-construct",
          "dojo/dom-style",
          "dojo/aspect",
          "bpi/menu",
          "bpi/music/serviceView",
          "bpi/rf/serviceView",
          "dojox/mobile/parser",
          "dojox/mobile"
        ], function(parser, ready, lang, on, fx, dom, domConst, domStyle, aspect, menu, MusicPlayer, HomeRF){
        	ready(function(){
        		parser.parse();
            var BpiMenuHolder = dom.byId("serviceMenuView");
            var BpiHolder = dom.byId("serviceView");
            var Bpi = new menu();
            var musicPlayer = null;
            var homeRF = null;
            Bpi.placeAt(BpiMenuHolder);

            if(dojoConfig.mopidyPlayer) {
              if(!dojoConfig.rfController) {
                musicPlayer = new MusicPlayer();
                musicPlayer.loadMusicNodes();
                musicPlayer.placeAt(BpiHolder);
              }
              else {
                domStyle.set(BpiMenuHolder, "display", "block");
                Bpi.set("displayMusicButton", true);
                aspect.after(Bpi, "launchMusicPlayer", lang.hitch(this, function(){
                  if (musicPlayer === null) {
                    musicPlayer = new MusicPlayer();
                    
                    var close = fx.wipeOut({
                      node: BpiHolder,
                      duration: 500
                    });

                    var open = fx.wipeIn({
                      node: BpiHolder
                    });

                    on(close, "End", lang.hitch(this, function() {
                      if (homeRF !== null) {
                        homeRF.destroy();
                        homeRF = null;
                      }
                      when(musicPlayer.loadMusicNodes(), function(){
                        musicPlayer.placeAt(BpiHolder);
                        open.play();
                      });
                    }));
                    close.play();
                  }
                }));
              }
            }

            if(dojoConfig.rfController) {
              if(!dojoConfig.mopidyPlayer) {
                homeRF = new HomeRF();
                homeRF.loadRfNodes()
                homeRF.placeAt(BpiHolder);
              }
              else {
                domStyle.set(BpiMenuHolder, "display", "block");
                Bpi.set("displayRFButton", true);
                aspect.after(Bpi, "launchHomeRF", lang.hitch(this, function(){
                  if (homeRF === null) {
                    homeRF = new HomeRF();

                    var close = fx.wipeOut({
                      node: BpiHolder,
                      duration: 500
                    });

                    var open = fx.wipeIn({
                      node: BpiHolder
                    });
                    
                    on(close, "End", lang.hitch(this, function() {
                      if (musicPlayer !== null) {
                        musicPlayer.endPlayer();
                        musicPlayer.destroy();
                        musicPlayer = null;
                      }
                      when(homeRF.loadRfNodes(), function(){
                        homeRF.placeAt(BpiHolder);
                        open.play();
                      });
                    }));
                    close.play(); 
                  }
                }));
              }
            }
        	});
        });
      </script>
  </head>

  <body class="claro">
    <div id="serviceMenuView"></div>
    <div id ="serviceViewHolder">
    	<div id="serviceView"></div>
      <div class="clear"></div>
    </div>
  </body>

</html>