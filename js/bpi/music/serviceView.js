/*  This file is part of BeakPi.

    BeakPi is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    BeakPi is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with BeakPi.  If not, see <http://www.gnu.org/licenses/>. */

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/when",
  "dojo/Deferred",
  "dojo/dom-attr",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/aspect",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/Dialog",
  "dojox/timing",
  "bpi/music/search",
  "bpi/music/settings",
  "bpi/music/playlist",
  "bpi/music/ExploreBar",
  "bpi/music/PlayingControl",
  "bpi/utils/util",
  "bpi/utils/Slider",
  "dojo/text!./templates/serviceView.html",
  "dijit/form/Button"
],
function(declare, lang, on, when, Deferred, domAttr, domStyle, domConst, aspect, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, timing, search, settings, playlist, ExploreBar, PlayingControl, util, Slider, template) {

  return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: template,

    _currentlyPlaying: null,
    intervalCurrentPlaying: new timing.Timer(1000),
    _currentPlayer: null,
    _currentPlaylist: null,
    _currentSearch: null,
    _playingControl: null,
    _exploreBar: null,
    _slider: null,

    _ticker: 0,



    load: function (){
      var dfd = new Deferred();

      this._playingControl = new PlayingControl();
      this._exploreBar = new ExploreBar();
      this._slider = new Slider();
      this._currentPlaylist = new playlist();
      this._currentSearch = new search();

      this._playingControl.placeAt(this);
      this._slider.placeAt(this);
      this._exploreBar.placeAt(this._trackSearchView);


      this._currentSearch.set("resultsHolder", this._trackListHolder);
      this._currentSearch.set("resultsInfo", this._trackListHolderInfo);

      this._currentPlaylist.listCurrent(this._trackListHolder);
      this._currentPlaylist.set("resultsInfo", this._trackListHolderInfo);


      when(this._playerSelect("spotify"), lang.hitch(this, function() {
        // Wait for the media player to finish preparing then begin polling
        this.intervalCurrentPlaying.onTick = lang.hitch(this,function() {
          this._updateCurrentPlaying();
        });
        dfd.resolve();
      }));


      if(dojoConfig.device === "computer") {
        domConst.destroy(this._btnStored.domNode);
        this._slider.show();
        this._currentPlaylist.listStoredSpotify(this._slider.get("holder"), "<br />", this._trackListHolder);
      }

      this._applyListeners();

      this.intervalCurrentPlaying.start();

      return dfd.promise;
    },



    endPlayer: function() {
      this.intervalCurrentPlaying.stop();
    },


    // returns the util command to use for each player 
    _playerCommand: function (com, val) {
      if (this._currentPlayer === "spotify") {
        switch (com) {
          case "pause": return util.commandPlayer("pause"); break;
          case "play": return util.commandPlayer("play"); break;
          case "prev": return util.commandPlayer("previous"); break;
          case "next": return util.commandPlayer("next"); break;
          case "shuffle": 
            when(util.commandShuffleTracks(), lang.hitch(this, function(res){
              return this._currentPlaylist.listCurrent(this._trackListHolder);
            }))
          break;
          case "explore":
            domConst.empty(this._trackListHolder);
            domConst.empty(this._trackListHolderInfo);
            when(util.requestSearch("http://ws.spotify.com/search/1/track.json?q=" + val), lang.hitch(this, function(res) {
              return this._currentSearch.listResults(res);
            }));
          break;
        }
      }
      if (this._currentPlayer === "pandora") {
        switch (com) {
          case "pause": return util.command("piano " + dojoConfig.pianoUser + " PAUSE"); break;
          case "play": return util.command("piano " + dojoConfig.pianoUser + " PLAY mix"); break;
          case "shuffle": return util.command("piano " + dojoConfig.pianoUser + " SKIP"); break;
          case "prev": return util.command("piano " + dojoConfig.pianoUser + " RATE BAD"); break;
          case "next": return util.command("piano " + dojoConfig.pianoUser + " RATE GOOD"); break;
          case "explore":
            when(util.command("piano " + dojoConfig.pianoUser + "  FIND ARTIST '" + val +"'"), lang.hitch(this, function(res) {
              when(util.command("piano " + dojoConfig.pianoUser + " CREATE STATION FROM SUGGESTION " + res[0].slice(4)), lang.hitch(this, function(res) {
                when(util.command("piano " + dojoConfig.pianoUser + "  PLAY STATION '" + val + " Radio'"), lang.hitch(this, function(res) {
                  return util.command("piano " + dojoConfig.pianoUser + " SKIP");
                }));
              }));
            }));
          break;
        }
      }
    },



    // applies the required changes for selection of an audio player
    _playerSelect: function (player) {
      var dfd = new Deferred();
      this._currentPlayer = player;
      if (player === "spotify") {
        this._exploreBar.set("exploreButton", "Search");
        this._exploreBar.set("placeHolder", "Search...");
        this._btnStored.set("label", "Playlists");
        when(this._updateCurrentPlaying(), lang.hitch(this, function() {
          this._currentPlaylist.listCurrent(this._trackListHolder);
          dfd.resolve();
        }));
        domStyle.set(this._pandoraButton, "opacity", 0.2);
        domStyle.set(this._spotifyButton, "opacity", 0.9);
        this._playingControl.set("btnPrevIconClass","iconPrev");
        this._playingControl.set("btnNextIconClass","iconNext");
        this._playingControl.set("btnShuffleIconClass","iconShuffle");
        this._currentPlaylist.listStoredSpotify(this._slider.get("holder"), "<br />", this._trackListHolder);
      }
      if (player === "pandora") {
        this._exploreBar.set("exploreButton", "Launch");
        this._exploreBar.set("placeHolder", "New radio station...");
        this._btnStored.set("label", "Stations");
        this._updateCurrentPlaying();
        domConst.empty(this._trackListHolder);
        domConst.empty(this._trackListHolderInfo);
        domStyle.set(this._pandoraButton, "opacity", 0.9);
        domStyle.set(this._spotifyButton, "opacity", 0.2);
        this._playingControl.set("btnPrevIconClass","iconDislike");
        this._playingControl.set("btnNextIconClass","iconLike");
        this._playingControl.set("btnShuffleIconClass","iconNext");
        this._currentPlaylist.listStoredPandora(this._slider.get("holder"), "<br />", this._trackListHolder);
        dfd.resolve();
      }
      return dfd.promise;
    },



    // Applies listeners to the external classes actions to keep events in one place
    _applyListeners: function (){
     if(dojoConfig.device !== "computer") {
        on(this._btnStored, "click", lang.hitch(this, function(evt)  {
          this._slider.show();
        }));
        aspect.after(this._currentPlaylist, "playlistLoading", lang.hitch(this, function() {
          this._slider.hide();
        }));
      }

      // Playing Control Shuffle Button
      aspect.after(this._playingControl, "btnShufflePressed", lang.hitch(this, function() {
        when(this._playerCommand("shuffle"), lang.hitch(this, function(){
          //
        }));
      }));

      // Playing Control Pause Button
      aspect.after(this._playingControl, "btnPausePressed", lang.hitch(this, function() {
        when(this._playerCommand("pause"), lang.hitch(this, function(res) {
          this._playingControl.set("playButton", "Pause");
        }));
      }));

      // Playing Control Play Button
      aspect.after(this._playingControl, "btnPlayPressed", lang.hitch(this, function() {
        when(this._playerCommand("play"), lang.hitch(this, function(res) {
          this._playingControl.set("playButton", "Play");
        }));
      }));

      // Playing Control Pause Button
      aspect.after(this._playingControl, "btnPausePressed", lang.hitch(this, function() {
        when(this._playerCommand("pause"), lang.hitch(this, function(res) {
          this._playingControl.set("playButton", "Pause");
        }));
      }));

      // Playing Control Previous Button
      aspect.after(this._playingControl, "btnPrevPressed", lang.hitch(this, function() {
        when(this._playerCommand("prev"), lang.hitch(this, function(res) {
         //
        }));
      }));

      // Playing Control Next Button
      aspect.after(this._playingControl, "btnNextPressed", lang.hitch(this, function() {
        when(this._playerCommand("next"), lang.hitch(this, function(res) {
          //
        }));
      }));

      // Explore Bar Perform - e.g. Search / Add Station
      aspect.after(this._exploreBar, "explorePerform", lang.hitch(this, function(val) {
        when(this._playerCommand("explore", val), lang.hitch(this, function(res) {
          //
        }));        
      }), true);

      on(this._spotifyButton, "click", lang.hitch(this, function(evt) {
        this._playerSelect("spotify");
      }));

      on(this._pandoraButton, "click", lang.hitch(this, function(evt) {
        this._playerSelect("pandora");
      }));
    },





    // Uses currentPlayer to determine what command to use and how to format returned playing information 
    _updateCurrentPlaying: function(){
      var timeInfo = [], dfd = new Deferred();
      if(this._currentPlayer === "spotify") {
        when(util.command("mpc"), lang.hitch(this, function(res) {
          if(this._currentPlayer === "spotify") {
            if(res !== undefined) {
              if (res[1]) {
                if (res[1].indexOf("[playing]") !== -1) {
                  domAttr.set(this._currentlyPlaying, "innerHTML", res[0]);
                  timeInfo = (res[1].split("   "))[1].split(" ");
                  domAttr.set(this._currentlyPlayingTime, "innerHTML", timeInfo[0]);
                  this._playingControl.set("songSeek", parseInt(timeInfo[1].replace(/[^0-9]/gi, ''), 10));
                  this._playingControl.set("playButton", "Pause");
                  this._playingControl.set("volumeSeek", parseInt(res[2].replace(/[^0-9]/gi, ''), 10));
                  dfd.resolve();
                }
                else if (res[1].indexOf("[paused]") !== -1) {
                  this._playingControl.set("playButton", "Play");
                  domAttr.set(this._currentlyPlaying, "innerHTML", res[0]);
                  domAttr.set(this._currentlyPlayingTime, "innerHTML", "Paused");
                  dfd.resolve();
                }
              }
              else {
                domAttr.set(this._currentlyPlaying, "innerHTML", "Stopped");
                domAttr.set(this._currentlyPlayingTime, "innerHTML", "");
                dfd.resolve();
              }
            }
          }
        }));
      }
      else {
        when(util.command("piano -v"), lang.hitch(this, function(res) {
          if(this._currentPlayer === "pandora") {
            if(res !== undefined) {
              if (res[0]) {
                if (res[0].indexOf("Playing") !== -1) {
                  timeInfo = (res[0].split("Playing "))[1].split("/");
                  domAttr.set(this._currentlyPlayingTime, "innerHTML", timeInfo[0] + "/" +timeInfo[1]);
                 // this._playingControl.set("songSeek", parseInt(timeInfo[1].replace(/[^0-9]/gi, ''), 10));
                  this._playingControl.set("playButton", "Pause");
                 //  this._playingControl.set("volumeSeek", parseInt(res[2].replace(/[^0-9]/gi, ''), 10));
                  dfd.resolve();
                  this._ticker ++;
                  if(this._ticker >= 4) {
                    this._ticker = 0;
                  }
                }
                else {
                  this._playingControl.set("playButton", "Play");
                }
              }
              else {
                domAttr.set(this._currentlyPlaying, "innerHTML", "Stopped");
                dfd.resolve();
              }
            }
          }
        }));
        if (this._ticker === 0) {
          when(util.command("piano status"), lang.hitch(this, function(res) {
            if (this._currentPlayer === "pandora") {
              domAttr.set(this._currentlyPlaying, "innerHTML", res[2].slice(8) + " - " + res[3].slice(7));
              domAttr.set(this._trackListHolder, "innerHTML", "<img id='pandoraArt' src='" + res[4].slice(10) + "' />");
              dfd.resolve();
            }
          }));
        }
      }

      return dfd.promise;
    }
  });
});