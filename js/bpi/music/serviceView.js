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
  "bpi/music/PlayingControl",
  "bpi/utils/util",
  "bpi/utils/Slider",
  "dojo/text!./templates/serviceView.html",
  "dijit/form/Button"
],
function(declare, lang, on, when, Deferred, domAttr, domStyle, domConst, aspect, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, timing, search, settings, playlist, PlayingControl, util, Slider, template) {

  return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: template,

    _currentlyPlaying: null,
    intervalCurrentPlaying: new timing.Timer(1000),
    _currentPlaylist: null,
    _currentSearch: null,
    _currentTrackView: "Playlist",
    _playingControl: null,
    _slider: null,

    loadMusicNodes: function (){
      var dfd = new Deferred();

      this._playingControl = new PlayingControl();
      this._playingControl.placeAt(this);

      this._slider = new Slider();
      this._slider.placeAt(this);

      if(this._currentPlaylist === null) {
        this._currentPlaylist = new playlist();
      }
      if(this._currentSearch === null) {
        this._currentSearch = new search();
      }
      this._currentSearch.placeAt(this._trackSearchView);
      this._currentPlaylist.placeAt(this._trackPlaylistView);

      when(this.updateCurrentPlaying(), lang.hitch(this, function() {
        this.intervalCurrentPlaying.onTick = lang.hitch(this,function() {
          this.updateCurrentPlaying();
        });
        dfd.resolve();
      }));

      this.intervalCurrentPlaying.start();
      this.applyButtonCommands();

     if(dojoConfig.device !== "computer") {
        on(this._btnStored, "click", lang.hitch(this, function(evt)  {
          this._slider.show();
          this._currentPlaylist.listStored(this._slider.get("holder"), "<br />");
        }));
      }
      else{
        domConst.destroy(this._btnStored.domNode);
        this._slider.show();
        this._currentPlaylist.listStored(this._slider.get("holder"), "<br />");
      }

      this._currentPlaylist.listCurrent();




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
      aspect.after(this._playingControl, "btnShufflePressed", lang.hitch(this, function(){
        when(util.commandShuffleTracks(), lang.hitch(this, function(){
          this._currentPlaylist.listCurrent();
        }));
      }));
    },

    updateCurrentPlaying: function(){
      var mpcInfo = [],
          timeInfo = [],
          seekInfo,
          status,
          dfd = new Deferred(),
          track;
      when(util.requestCurrentSeek()).then(lang.hitch(this, function(res){
        if(res !== undefined) {
          if(res.indexOf("[playing]") !== -1) {
            mpcInfo = res.split("  ");
            track = mpcInfo[0].split("[playing]");
            domAttr.set(this._currentlyPlaying, "innerHTML", track[0]);
            mpcInfo = mpcInfo[1].split(" ");
            timeInfo = mpcInfo[1].split("/");
            domAttr.set(this._currentlyPlayingTime, "innerHTML", (timeInfo[0] + " / " + timeInfo[1]));
            seekInfo = mpcInfo[2].replace(/[^0-9]/gi, '');
            this._playingControl.set("songSeek", parseInt(seekInfo, 10));
            this._playingControl.set("playButton", "Pause");
            this._playingControl.set("volumeSeek", parseInt(mpcInfo[3], 10));
            dfd.resolve();
          }
          else if(res.indexOf("[paused]") !== -1) {
            this._playingControl.set("playButton", "Play");
            domAttr.set(this._currentlyPlayingTime, "innerHTML", "Paused");
            dfd.resolve();
          }
          else {
            domAttr.set(this._currentlyPlaying, "innerHTML", "Stopped");
            domAttr.set(this._currentlyPlayingTime, "innerHTML", "");
            mpcInfo = res.split("  ");
            mpcInfo = mpcInfo[0].split(" ");
            this._playingControl.set("volumeSeek", parseInt(mpcInfo[3], 10));
            this._playingControl.set("songSeek", 0);
            this._playingControl.set("playButton", "Play");
            dfd.resolve();
          }
        }
      }));
      return dfd.promise;
    }
  });
});