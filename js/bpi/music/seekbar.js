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
    "dojo/dom",
    "dijit/_WidgetBase",
    "dijit/form/HorizontalSlider"
],
function(declare, dom, _WidgetBase, HorizontalSlider){
  return declare([_WidgetBase], {
    id: null,
    slider: null,
    dragging: false,

    createBar: function(id, node, min, max, width) {
      this.id = id;
      this.slider = new HorizontalSlider({
          name: "slider",
          value: 0,
          minimum: min,
          maximum: max,
          intermediateChanges: true,
          showButtons: false,
          style: ("width:"+width+"; float:left"),
          id: id
      }, node);

    },

    updateMax: function(max) {
      this.slider.set("maximum", max);
    },

    trackTo: function(position) {
      if(this.dragging){

      }
      else {
        this.slider.set("value", position);
      }
    }
  });
});