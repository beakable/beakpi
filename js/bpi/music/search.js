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
  "dojo/_base/array",
  "dojo/when",
  "dojo/dom-construct",
  "dojo/dom-attr",
  "dijit/_WidgetBase",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/_TemplatedMixin",
  "bpi/music/track",
  "dojo/text!./templates/search.html",
  "dijit/form/TextBox",
  "dijit/form/Form",
  "dijit/form/Button"
],

function(declare, lang, array, when, domConstruct, domAttr, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, Track, template) {
  return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: template,

    totalTracks: null,

    _resultsHolder: null,
    _resultsInfo: null,

    _summary: function(results) {
      var i;
      array.forEach(results.tracks, lang.hitch(this, function(track) {
        if(track.album.availability.territories.indexOf(dojoConfig.countryCode) !== -1) {
          ++ this.totalTracks;
        }
      }));
      domAttr.set(this._resultsInfo, "innerHTML", "Displaying Results 0 of " + this.totalTracks);
    },

    listResults: function(results) {
      var trackResult,
          trackResultNumber = 1,
          displayArt = false,
          clearSplit = 2;

      this.totalTracks = 0;
      this._summary(results);

      array.forEach(results.tracks, lang.hitch(this, function(track) {
        trackResult = new Track();
        if (track.album.availability.territories.indexOf(dojoConfig.countryCode) !== -1) {
          var trackInfo = {
            name: track.name,
            href: track.href,
            artist: track.artists[0].name
          };
          when(trackResult.displayTrack(trackInfo, this._resultsHolder, displayArt)).then(lang.hitch(this, function(){
              domAttr.set(this._resultsInfo, "innerHTML", "Displaying Results "+ trackResultNumber +" of "+ this.totalTracks);
              if (trackResultNumber % clearSplit === 0 || trackResultNumber === this.totalTracks) {
                domConstruct.place(domConstruct.toDom("<div style='clear:both'></div>"), this._resultsHolder);
              }
              ++trackResultNumber;
          }));
        }
      }));
    },

    _setResultsHolderAttr: function (val){
      this._resultsHolder = val;
    },

    _setResultsInfoAttr: function (val){
      this._resultsInfo = val;
    }

  });
});