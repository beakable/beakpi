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
  "dojo/when",
  "dojo/on",
  "dojo/dom-style",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dojo/text!./templates/Slider.html"
],

function (declare, lang, win, when, on, domStyle, _WidgetBase, _TemplatedMixin, template){
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    show: function() {
      domStyle.set(this._slideInEnder, "display", "block");
      domStyle.set(this._slideInHolder, "display", "block");
      on(this._slideInEnder, "click", lang.hitch(this, function(evt)  {
        this.hide();
      }));
    },

    hide: function() {
      domStyle.set(this._slideInEnder, "display", "none");
      domStyle.set(this._slideInHolder, "display", "none");
    },

    _getHolderAttr: function() {
      return this._slideInHolder;
    }

   });
});