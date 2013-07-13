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
  "dojo/Deferred",
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
function(declare, lang, win, mouse, on, when, Deferred, domAttr, domStyle, domConstruct, aspect, focusUtil, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, timing, search,  seekbar, settings, playlist, util, template) {

  return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: template,
    _currentlyPlaying: null,
    intervalCurrentPlaying: new timing.Timer(1000),
    _btnPlay: null,
    _currentSongSeek: null,
    _currentPlaylist: null,
    _currentSearch: null,
    _currentTrackView: "Playlist",

    loadMusicNodes: function (){
      var mouseup;
      var dfd = new Deferred();
      var volumeSeek = new seekbar();
      this._currentSongSeek = new seekbar();

      if(this._currentPlaylist === null) {
        this._currentPlaylist = new playlist();
      }
      if(this._currentSearch === null) {
        this._currentSearch = new search();
      }
      this._currentSearch.placeAt(this._trackSearchView);
      this._currentPlaylist.placeAt(this._trackPlaylistView);
      domStyle.set(this._trackPlaylistView, "display", "none");


      if(dojoConfig.device !== "computer") {
        var computedStyle = domStyle.getComputedStyle(this.musicPlayer);
        this._currentSongSeek.createBar("song", this._progressSeekBar, "100%");
        volumeSeek.createBar("volume", this._volumeSeekBar, "100%");
      }
      else {
        this._currentSongSeek.createBar("song", this._progressSeekBar, "692px");
        volumeSeek.createBar("volume", this._volumeSeekBar, "370px");
      }

      // NEED FIXED
      this._currentSongSeek.slider.set("disabled", true);
      this._currentSongSeek.slider.sliderHandle.display = false;

      on(this._currentSongSeek.slider, "focus", lang.hitch(this, function(evt){
        this._currentSongSeek.set("dragging", true);
        mouseup = on(win.doc.documentElement, "mouseup", lang.hitch(this,function(evt){
          focusUtil.curNode.blur();
          mouseup.remove();
          util.commandPlayer("seek", parseInt(this._currentSongSeek.slider.get("value"), 10));
            this._currentSongSeek.set("dragging", false);
        }));
      }));

      on(volumeSeek.slider, "focus", lang.hitch(this, function(evt){
        volumeSeek.set("dragging", true);
        mouseup = on(win.doc.documentElement, "mouseup", lang.hitch(this,function(evt){
          focusUtil.curNode.blur();
            mouseup.remove();
            when(util.commandPlayer("setVolume", parseInt(volumeSeek.slider.get("value"), 10))).then(lang.hitch(this, function(res){
              volumeSeek.set("dragging", false);
            }));
        }));
      }));
      when(this.updateCurrentPlaying(volumeSeek), lang.hitch(this, function() {
        this.intervalCurrentPlaying.onTick = lang.hitch(this,function() {
          this.updateCurrentPlaying(volumeSeek);
        });
        dfd.resolve();
      }));
      this.intervalCurrentPlaying.start();
      this.applyButtonCommands();

      return dfd.promise;
    },

    endPlayer: function() {
      this.intervalCurrentPlaying.stop();
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
      on(this._btnPlay, "click", lang.hitch(this, function(evt)  {
        if(this._btnPlay.get("label") === "Pause"){
          util.commandPlayer("pause");
        } else{
          util.commandPlayer("play");
        }
      }));
      on(this._btnStop, "click", lang.hitch(this, function(evt)  {
        util.commandPlayer("stop");
      }));
      on(this._btnNext, "click", lang.hitch(this, function(evt)  {
        util.commandPlayer("next");
      }));
      on(this._btnPrev, "click", lang.hitch(this, function(evt)  {
        util.commandPlayer("previous");
      }));
      on(this._btnClear, "click", lang.hitch(this, function(evt) {
        util.commandTracklist("clear");
        this._currentPlaylist.clear();
      }));
      on(this._btnPlaylist, "click", lang.hitch(this, function(evt) {
        if(this._currentTrackView === "Search") {
          domStyle.set(this._trackSearchView, "display", "");
          domStyle.set(this._trackPlaylistView, "display", "none");
          this._currentTrackView = "Playlist";
        }
        else{
          domStyle.set(this._trackSearchView, "display", "none");
          domStyle.set(this._trackPlaylistView, "display", "");
          this._currentPlaylist.list();
          this._currentTrackView = "Search";
        }
        this._btnPlaylist.set("label", this._currentTrackView);
      }));
      if(dojoConfig.device === "computer") {
        on(this._btnSettings, "click", lang.hitch(this, function(evt)  {
          this.showSettings();
        }));
      }
      else{
        domStyle.set(this._btnSettings.domNode, "display", "none");
      }
    },

    updateCurrentPlaying: function(volumeSeek){
      var mpcInfo = [],
          timeInfo = [],
          seekInfo,
          status,
          dfd = new Deferred(),
          track;
      when(util.requestCurrentSeek()).then(lang.hitch(this, function(res){
        if(res !== undefined) {
          if(res.indexOf("[playing]") !== -1) {
            this._btnPlay.set("label", "Pause");
            mpcInfo = res.split("  ");
            track = mpcInfo[0].split("[playing]");
            domAttr.set(this._currentlyPlaying, "innerHTML", track[0]);
            mpcInfo = mpcInfo[1].split(" ");
            timeInfo = mpcInfo[1].split("/");
            volumeSeek.trackTo(parseInt(mpcInfo[3], 10));
            domAttr.set(this._currentlyPlayingTime, "innerHTML", (timeInfo[0] + " / " + timeInfo[1]));
            seekInfo = mpcInfo[2].replace(/[^0-9]/gi, '');
            this._currentSongSeek.trackTo(parseInt(seekInfo, 10));
            dfd.resolve();
          }
          else if(res.indexOf("[paused]") !== -1) {
            this._btnPlay.set("label", "Play");
            domAttr.set(this._currentlyPlayingTime, "innerHTML", "Paused");
            dfd.resolve();
          }
          else {
            this._btnPlay.set("label", "Play");
            domAttr.set(this._currentlyPlaying, "innerHTML", "Stopped");
            this._currentSongSeek.slider.set("value",  0);
            domAttr.set(this._currentlyPlayingTime, "innerHTML", "");
            mpcInfo = res.split("  ");
            mpcInfo = mpcInfo[0].split(" ");
            volumeSeek.trackTo(parseInt(mpcInfo[1], 10));
            dfd.resolve();
          }
        }
      }));
      return dfd.promise;
    }
  });
});