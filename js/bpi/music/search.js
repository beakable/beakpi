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
  "dojo/Deferred",
  "dojo/on",
  "dojo/when",
  "dojo/dom-construct",
  "dojo/dom-attr",
  "dojo/keys",
  "dijit/_WidgetBase",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/_TemplatedMixin",
  "dijit/registry",
  "bpi/utils/util",
  "bpi/music/track",
  "dojo/text!./templates/search.html",
  "dijit/form/TextBox",
  "dijit/form/Form",
  "dijit/form/Button"
],

function(declare, lang, fx, Deferred, on, when, domConstruct, domAttr, keys, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, registry, util, track, template) {
  return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: template,
    inputSearch: null,
    totalTracks: null,
    _btSearch: null,

    postCreate: function(){
      var _self = this;
      on(this._btSearch, "click", function(evt){
        _self.clearList();
        when(util.requestSearch("http://ws.spotify.com/search/1/track.json?q="+_self.inputSearch.value)).then(
          function(res) {
            _self.summary(res);
            _self.list(res);
            fx.fadeIn({node: _self.results}).play();
          }
        );
      });
      on(_self.inputSearch, "keydown", function(evt){
        if(evt.keyCode === keys.ENTER){
          evt.preventDefault();
          _self.clearList();
          when(util.requestSearch("http://ws.spotify.com/search/1/track.json?q="+evt.target.value)).then(
            function(res) {
            _self.summary(res);
            _self.list(res);
            fx.fadeIn({node: _self.results}).play();
            }
          );
        }
      });
    },

    summary: function(result) {
      var i;
      for(i =0; i < result.tracks.length; i++){
        if(result.tracks[i].album.availability.territories.indexOf(dojoConfig.countryCode) !== -1) {
          ++this.totalTracks;
        }
      }
      domAttr.set(this.searchSummary, "innerHTML", "Displaying Results 0 of "+ this.totalTracks);
    },

    list: function(result) {
      var trackResult,
          i,
          trackResultNumber = 1,
          displayArt = false,
          clearSplit = 2;

      var loadedSettings = util.storeGet("musicSettings");
      if (loadedSettings) {
        if (loadedSettings.albumArt) {
          displayArt = loadedSettings.albumArt;
          clearSplit = 3;
        }
      }
      for(i =0; i < result.tracks.length; i++){
        trackResult = new track();
        if (result.tracks[i].album.availability.territories.indexOf(dojoConfig.countryCode) !== -1) {
          var trackInfo = {
            name: result.tracks[i].name,
            href: result.tracks[i].href,
            artist: result.tracks[i].artists[0].name
          };
          when(trackResult.displayTrack(trackInfo, this.results, displayArt)).then(lang.hitch(this, function(){
              domAttr.set(this.searchSummary, "innerHTML", "Displaying Results "+ trackResultNumber +" of "+ this.totalTracks);
              if (trackResultNumber % clearSplit === 0 || trackResultNumber === this.totalTracks) {
                domConstruct.place(domConstruct.toDom("<div style='clear:both'></div>"), this.results);
              }
              ++trackResultNumber;
          }));
        }
      }
    },

    clearList: function() {
      var clearResults;
      this.totalTracks = 0;
      if(dojoConfig.device !== "computer") {
        domConstruct.empty(this.results);
      }
      else{
        clearResults = fx.fadeOut({node: this.results}).play();
        on(clearResults, "End", lang.hitch(this, function(){
          domConstruct.empty(this.results);
        }));
      }
      domConstruct.empty(this.searchSummary);
    },

    show: function(){
      return this.domNode;
    }

  });
});