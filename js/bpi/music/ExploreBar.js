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
  "dojo/dom-attr",
  "dojo/keys",
  "dijit/_WidgetBase",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/_TemplatedMixin",
  "dojo/text!./templates/ExploreBar.html",
  "dijit/form/TextBox",
  "dijit/form/Form",
  "dijit/form/Button"
],

function(declare, lang, on, domAttr, keys, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, template) {
  return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: template,

    // Template Vals:
    _exploreInput: null,
    _btnExplore: null,

    postCreate: function(){
      on(this._btnExplore, "click", lang.hitch(this, function(evt) {
        this.explorePerform(this._exploreInput.get("value"));
      }));
      on(this._exploreInput, "keydown", lang.hitch(this, function(evt) {
        if (evt.keyCode === keys.ENTER) {
          this.explorePerform(this._exploreInput.get("value"));
        }
      }));
    },

    explorePerform: function(val) {
      // Synthetic Event
    },

    _setPlaceHolderAttr: function (val) {
     this._exploreInput.set("placeHolder", val);
    },

    _setExploreButtonAttr: function (val) {
      this._btnExplore.set("label", val);
    }

  });
});