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
"dijit/_WidgetBase",
"dijit/_TemplatedMixin",
"dijit/_WidgetsInTemplateMixin",
"bpi/utils/util",
"dojo/text!./templates/settings.html",
"dijit/form/CheckBox",
"dijit/form/Button"
], function (declare, lang, on, when, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, util, template){
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		widgetsInTemplate: true,
    _chkAlbumArt: null,
    _btnSave: null,

		postCreate: function() {
      var loadedSettings = util.storeGet("musicSettings");
      if (loadedSettings) {
        if (loadedSettings.albumArt) {
          this._chkAlbumArt.set("checked", loadedSettings.albumArt);
        }
      }
      on(this._btnSave, "click", lang.hitch(this, function(evt) {
         this.storeSettings();
      }));
		},

    storeSettings: function() {
      util.storeSet("musicSettings", {albumArt: this._chkAlbumArt.checked});
    }
	});

});
