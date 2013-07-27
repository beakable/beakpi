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
    _currentPlayer: null,
    _currentPlaylist: null,
    _currentSearch: null,
    _playingControl: null,
    _slider: null,

    load: function (){
      var dfd = new Deferred();



      this._playingControl = new PlayingControl();
      this._slider = new Slider();
      this._currentPlaylist = new playlist();
      this._currentSearch = new search();

      this._playingControl.placeAt(this);
      this._slider.placeAt(this);

      this._currentSearch.placeAt(this._trackSearchView);
      this._currentSearch.set("resultsHolder", this._trackListHolder);
      this._currentSearch.set("resultsInfo", this._trackListHolderInfo);

      this._currentPlaylist.listCurrent(this._trackListHolder);
      this._currentPlaylist.set("resultsInfo", this._trackListHolderInfo);

      if(dojoConfig.device === "computer") {
        domConst.destroy(this._btnStored.domNode);
        this._slider.show();
        this._currentPlaylist.listStored(this._slider.get("holder"), "<br />", this._trackListHolder);
      }

      this._applyListeners();

      when(this._updateCurrentPlaying(), lang.hitch(this, function() {
        this.intervalCurrentPlaying.onTick = lang.hitch(this,function() {
          this._updateCurrentPlaying();
        });
        dfd.resolve();
      }));
      this.intervalCurrentPlaying.start();

      return dfd.promise;
    },

    endPlayer: function() {
      this.intervalCurrentPlaying.stop();
    },

    _applyListeners: function (){
     if(dojoConfig.device !== "computer") {
        on(this._btnStored, "click", lang.hitch(this, function(evt)  {
          this._slider.show();
          this._currentPlaylist.listStored(this._slider.get("holder"), "<br />", this._trackListHolder);
        }));
        aspect.after(this._currentPlaylist, "playlistLoading", lang.hitch(this, function(){
          this._slider.hide();
        }));
      }

      aspect.after(this._playingControl, "btnShufflePressed", lang.hitch(this, function(){
        when(util.commandShuffleTracks(), lang.hitch(this, function(){
          this._currentPlaylist.listCurrent(this._trackListHolder);
        }));
      }));
      on(this._spotifyButton, "click", lang.hitch(this, function(evt){
        this._currentPlayer = "spotify";
        this._slider.show();
      }));
      on(this._pandoraButton, "click", lang.hitch(this, function(evt){
        this._currentPlayer = "pandora";
        this._slider.hide();
      }));
    },

    _updateCurrentPlaying: function(){
      var timeInfo = [], dfd = new Deferred(), ticker = 0;
      if(this._currentPlayer === "spotify") {
        when(util.command("mpc"), lang.hitch(this, function(res) {
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
        }));
      }
      else {
        when(util.command("piano -v"), lang.hitch(this, function(res) {
          if(res !== undefined) {
            if (res[0]) {
              if (res[0].indexOf("Playing") !== -1) {
                //domAttr.set(this._currentlyPlaying, "innerHTML", res[0]);
                timeInfo = (res[0].split("Playing "))[1].split("/");
                domAttr.set(this._currentlyPlayingTime, "innerHTML", timeInfo[0]);
               // this._playingControl.set("songSeek", parseInt(timeInfo[1].replace(/[^0-9]/gi, ''), 10));
                this._playingControl.set("playButton", "Pause");
               //  this._playingControl.set("volumeSeek", parseInt(res[2].replace(/[^0-9]/gi, ''), 10));
                dfd.resolve();
                ticker ++;
                if(ticker >= 6) {
                  ticker = 0;
                }
              }
            }
            else {
              domAttr.set(this._currentlyPlaying, "innerHTML", "Stopped");
              dfd.resolve();
            }
          }
        }));
        if (ticker == 0) {
          when(util.command("piano status"), lang.hitch(this, function(res) {
            domAttr.set(this._currentlyPlaying, "innerHTML", res[2].slice(8) + " - " + res[3].slice(7));
            dfd.resolve();
           }));
        }
      }

      return dfd.promise;
    }
  });
});