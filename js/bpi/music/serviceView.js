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
"dojo/_base/window",
"dojo/mouse",
"dojo/on",
"dojo/when",
"dojo/dom-attr",
"dojo/dom-style",
"dojo/dom-construct",
"dojo/aspect",
"dijit/focus",
"dijit/_WidgetBase",
"dijit/_TemplatedMixin",
"dijit/_WidgetsInTemplateMixin",
"dijit/Dialog",
"dojox/timing",
"bpi/music/search",
"bpi/music/seekbar",
"bpi/music/settings",
"bpi/music/playlist",
"bpi/utils/util",
"dojo/text!./templates/serviceView.html",
"dijit/form/Button"
],
function(declare, lang, win, mouse, on, when, domAttr, domStyle, domConstruct, aspect, focusUtil, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, 
  Dialog, timing, search,  seekbar, settings, playlist, util, template) {
  
  return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: template,
    currentlyPlaying: null,
    intervalCurrentPlaying: new timing.Timer(1000),
    btnPlay: null,
    currentSongSeek: null,
    settingsDialog: null,
    currentPlaylist: null,
    currentSearch: null,
    currentTrackView: "Playlist",

    postCreate: function (){
      var mouseup; 
      var volumeSeek = new seekbar;
      this.currentSongSeek = new seekbar;
      
      if(this.currentPlaylist === null) {
        this.currentPlaylist = new playlist();
      }
      if(this.currentSearch === null) {
        this.currentSearch = new search();
      }
      this.currentSearch.placeAt(this.trackSearchView);
      this.currentPlaylist.placeAt(this.trackPlaylistView);
      domStyle.set(this.trackPlaylistView, "display", "none");


      if(dojoConfig.device !== "computer") {
        var computedStyle = domStyle.getComputedStyle(this.musicPlayer);
        this.currentSongSeek.createBar("song", this.progressSeekBar, "100%");
        volumeSeek.createBar("volume", this.volumeSeekBar, "100%");
      }
      else {
        this.currentSongSeek.createBar("song", this.progressSeekBar, "692px");
        volumeSeek.createBar("volume", this.volumeSeekBar, "370px");
      }

      // NEED FIXED
      this.currentSongSeek.slider.set("disabled", true);
      this.currentSongSeek.slider.sliderHandle.display = false;

      on(this.currentSongSeek.slider, "focus", lang.hitch(this, function(evt){
        this.currentSongSeek.set("dragging", true);
        mouseup = on(win.doc.documentElement, "mouseup", lang.hitch(this,function(evt){
          focusUtil.curNode.blur();
          mouseup.remove();
          util.commandPlayer("seek", parseInt(this.currentSongSeek.slider.get("value")))
            this.currentSongSeek.set("dragging", false);
        }));
      }));
      
      on(volumeSeek.slider, "focus", lang.hitch(this, function(evt){
        volumeSeek.set("dragging", true);
        mouseup = on(win.doc.documentElement, "mouseup", lang.hitch(this,function(evt){
          focusUtil.curNode.blur();
            mouseup.remove();
            when(util.commandPlayer("setVolume", parseInt(volumeSeek.slider.get("value")))).then(lang.hitch(this, function(res){
              volumeSeek.set("dragging", false);
            }));
        }));
      }));

      this.intervalCurrentPlaying.onTick = lang.hitch(this,function(){
        this.updateCurrentPlaying(volumeSeek);
      });
      this.intervalCurrentPlaying.start();
      this.applyButtonCommands();
    },

    showSettings: function() {
      var musicSettings = new settings();
      var settingsDisplay = new Dialog({
        title: "Music Settings",
        style: "width: 200px"
      });
      aspect.after(musicSettings, "storeSettings", lang.hitch(this, function(){
        settingsDisplay.hide();
      }));
      settingsDisplay.set("content", musicSettings);
      settingsDisplay.show();
    },

    applyButtonCommands: function (){
      on(this.btnPlay, "click", lang.hitch(this, function(evt)  {
        if(this.btnPlay.get("label") === "Pause"){
          util.commandPlayer("pause");
        } else{
          util.commandPlayer("play");
        } 
      }));
      on(this.btnStop, "click", lang.hitch(this, function(evt)  {
        util.commandPlayer("stop");
      }));
      on(this.btnNext, "click", lang.hitch(this, function(evt)  {
        util.commandPlayer("next");
      }));
      on(this.btnPrev, "click", lang.hitch(this, function(evt)  {
        util.commandPlayer("previous");
      }));
      on(this.btnClear, "click", lang.hitch(this, function(evt) {
        util.commandTracklist("clear");
        this.currentPlaylist.clear();
      }));
      on(this.btnPlaylist, "click", lang.hitch(this, function(evt) {
        if(this.currentTrackView === "Search") {
          domStyle.set(this.trackSearchView, "display", "");
          domStyle.set(this.trackPlaylistView, "display", "none");
          this.currentTrackView = "Playlist";
        }
        else{
          domStyle.set(this.trackSearchView, "display", "none");
          domStyle.set(this.trackPlaylistView, "display", "");
          this.currentPlaylist.listStoredPlaylists();
          this.currentPlaylist.list();
          this.currentTrackView = "Search"          
        }
        this.btnPlaylist.set("label", this.currentTrackView);
      }));
      if(dojoConfig.device === "computer") {
        on(this.btnSettings, "click", lang.hitch(this, function(evt)  {
          this.showSettings();
        }));
      }
      else{
        domStyle.set(this.btnSettings.domNode, "display", "none")
      }
    },

    updateCurrentPlaying: function(volumeSeek){
      var mpcInfo = [],
          timeInfo = [],
          seekInfo,
          status,
          track;
      when(util.requestCurrentSeek()).then(lang.hitch(this, function(res){
        if(res !== undefined) {
          if(res.indexOf("[playing]") !== -1) {
            this.btnPlay.set("label", "Pause");
            mpcInfo = res.split("  ");
            track = mpcInfo[0].split("[playing]")
            domAttr.set(this.currentlyPlaying, "innerHTML", track[0]);
            mpcInfo = mpcInfo[1].split(" ");
            timeInfo = mpcInfo[1].split("/");
            volumeSeek.trackTo(parseInt(mpcInfo[3]));
            domAttr.set(this.currentlyPlayingTime, "innerHTML", (timeInfo[0] + " / " + timeInfo[1]));
            seekInfo = mpcInfo[2].replace(/[^0-9]/gi, '');
            this.currentSongSeek.trackTo(parseInt(seekInfo));
          }
          else if(res.indexOf("[paused]") !== -1) {
            this.btnPlay.set("label", "Play");
            domAttr.set(this.currentlyPlayingTime, "innerHTML", "Paused");
          }
          else {
            this.btnPlay.set("label", "Play");
            domAttr.set(this.currentlyPlaying, "innerHTML", "Stopped");
            this.currentSongSeek.slider.set("value",  0);
            domAttr.set(this.currentlyPlayingTime, "innerHTML", "");
            mpcInfo = res.split("  ");
            mpcInfo = mpcInfo[0].split(" ");
            volumeSeek.trackTo(parseInt(mpcInfo[1]));
          }
        }
      }));
    },
	
    run: function(msg){

    }
  });
});
