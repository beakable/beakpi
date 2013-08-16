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
  "dojo/_base/fx",
  "dojo/_base/window",
  "dojo/window",
  "dojo/mouse",
  "dojo/on",
  "dojo/when",
  "dojo/Deferred",
  "dojo/dom-construct",
  "dojo/dom-attr",
  "dojo/dom-style",
  "dojo/dom-class",
  "dijit/focus",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "bpi/utils/util",
  "bpi/music/seekbar",
  "dojo/text!./templates/PlayingControl.html"
],

function(declare, lang, fx, window, win, mouse, on, when, Deferred, domConstruct, domAttr, domStyle, domClass, focusUtil, _WidgetBase,  _TemplatedMixin, _WidgetsInTemplateMixin, util, seekbar, template) {
  return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    widgetsInTemplate: true,
    templateString: template,
    _volumeSeek: null,
    _currentSongSeek: null,

    // Template Vals:
    _controlHolder: null,
    _controlHolderButtons: null,
    _controlHolderVolume: null,
    _btnPlayPause: null,
    _btnPrev: null,
    _btnNext: null,



    postCreate: function (){
      this._volumeSeek = new seekbar();
      this._currentSongSeek = new seekbar();

      on (this._btnPlayPause, "click", lang.hitch(this, function(evt)  {
        if (this._btnPlayPause.get("label") === '<i class="icon-pause icon-2x"></i>'){
          this.btnPausePressed();
          this._btnPlayPause.set("label", '<i class="icon-play icon-2x"></i>');
        } else{
          this.btnPlayPressed();
          this._btnPlayPause.set("label", '<i class="icon-pause icon-2x"></i>');
        }
      }));



      on(this._btnNext, "click", lang.hitch(this, function(evt)  {
        util.commandPlayer("next");
      }));

      on(this._btnPrev, "click", lang.hitch(this, function(evt)  {
        util.commandPlayer("previous");
      }));

      domClass.add(this._btnPrev.domNode, "iconPrev");
      domStyle.set(this._btnPrev.domNode.firstChild, "display", "block");

      domClass.add(this._btnNext.domNode, "iconNext");
      domStyle.set(this._btnNext.domNode.firstChild, "display", "block");

      domClass.add(this._btnShuffle.domNode, "iconShuffle");
      domStyle.set(this._btnShuffle.domNode.firstChild, "display", "block");

      if (dojoConfig.device !== "computer") {
        var windowBox = win.getBox();
        this._currentSongSeek.createBar("song", this._progressSeekBar, windowBox.w+"px");
        this._volumeSeek.createBar("volume", this._volumeSeekBar, windowBox.w-182+"px");
        domStyle.set(this._controlHolderVolume, "width", windowBox.w-182+"px");
        domStyle.set(this._controlHolder, "width",  "100%");
        domStyle.set(this._controlHolderButtons, "width", "140px");
      }
      else {
        this._volumeSeek.createBar("volume", this._volumeSeekBar, "100%");
        this._currentSongSeek.createBar("song", this._progressSeekBar, "100%");
        domStyle.set(this._controlHolder, "width", "100%");
        domStyle.set(this._controlHolderButtons, "width", "140px");
        domStyle.set(this._controlHolderShuffle, "width", "40px");
      }

      on(this._volumeSeek.slider, "focus", lang.hitch(this, function(evt){
        this._volumeSeek.set("dragging", true);
        mouseup = on(window.doc.documentElement, "mouseup", lang.hitch(this,function(evt){
          focusUtil.curNode.blur();
            mouseup.remove();
            when(util.commandPlayer("setVolume", parseInt(this._volumeSeek.slider.get("value"), 10))).then(lang.hitch(this, function(res){
              this._volumeSeek.set("dragging", false);
            }));
        }));
      }));

      on(this._btnShuffle, "click", lang.hitch(this, function(evt)  {
        this.btnShufflePressed();
      }));


      domStyle.set(this._btnPlayPause.domNode,"width","50px");
      domStyle.set(this._btnPlayPause.domNode.firstChild, "display", "block");
      this._currentSongSeek.slider.set("disabled", true);
      this._currentSongSeek.slider.sliderHandle.display = false;
    },

    _setBtnPrevIconClassAttr: function(val) {
      this._btnPrev.set("label", val);
    },

    _setBtnNextIconClassAttr: function(val) {
      this._btnNext.set("label", val);
    },

    _setBtnShuffleIconClassAttr: function(val) {
      this._btnShuffle.set("label", val);
    },

    btnShufflePressed: function() {
      // Synthetic Event
    },

    btnPausePressed: function() {
      // Synthetic Event
    },

    btnPlayPressed: function() {
      // Synthetic Event
    },

    btnPrevPressed: function() {
      // Synethetic Event
    },

    btnNextPressed: function() {
      // Synthetic Event
    },

    _setPlayButtonAttr: function(val) {
      this._btnPlayPause.set("label", val);
    },

    _setVolumeSeekAttr: function(val) {
      this._volumeSeek.trackTo(val);
    },

    _setSongSeekAttr: function(val) {
      this._currentSongSeek.trackTo(val);
    }


	});
});