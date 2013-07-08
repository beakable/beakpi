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

    postCreate: function() {
      var _self = this;
      var musicPlayer = new Button({
        label: "Home Audio",
        onClick: function(){
          _self.launchMusicPlayer();
        }
      })
      musicPlayer.placeAt(this._menu);

      var homeRF = new Button({
        label: "Home Control",
        onClick: function(){
          _self.launchHomeRF();
        }
      })
      homeRF.placeAt(this._menu);
    },

    launchMusicPlayer: function() {
      // Synthetic Event
    },

    launchHomeRF: function() {
      // Synthetic Event
    }

  });
});