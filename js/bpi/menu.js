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
"dijit/_WidgetBase",
"dijit/_WidgetsInTemplateMixin",
"dijit/_TemplatedMixin",
"dijit/form/Button",
"dojo/text!./templates/menu.html"
],

function(declare, lang, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, Button, template) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    widgetsInTemplate: true,
    templateString: template,
    _menu: null,

    _setDisplayRFButtonAttr: function() {
      var _self = this;
      var btnHomeRF = new Button({
        label: "Home Control",
        onClick: function(){
          _self.launchHomeRF();
        }
      });
      btnHomeRF.placeAt(this._menu);
    },

    _setDisplayMusicButtonAttr: function() {
      var _self = this;
      var btnMusicPlayer = new Button({
        label: "Home Audio",
        onClick: function(){
          _self.launchMusicPlayer();
        }
      });
      btnMusicPlayer.placeAt(this._menu);
    },

    _setDisplayPiSettingsButtonAttr: function() {
      var _self = this;
      var btnMusicPlayer = new Button({
        label: "Pi Settings",
        onClick: function(){
          _self.launchPiSettings();
        }
      });
      btnMusicPlayer.placeAt(this._menu);
    },

    _setDisplayTempTrackButtonAttr: function() {
      var _self = this;
      var btnTempTrack = new Button({
        label: "Temperature",
        onClick: function(){
          _self.launchTemperature();
        }
      });
      btnTempTrack.placeAt(this._menu);
    },



    launchMusicPlayer: function() {
      // Synthetic Event
    },

    launchPiSettings: function() {
      // Synthetic Event
    },

    launchHomeRF: function() {
      // Synthetic Event
    },

    launchTemperature: function() {
      // Synthetic Event
    }

  });
});