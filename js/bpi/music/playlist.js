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
  "dojo/aspect",
  "dojo/on",
  "dojo/touch",
  "dojo/dom-construct",
  "dojo/dom-attr",
  "dojo/dom-geometry",
  "dojo/dom-style",
  "dijit/_WidgetBase",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/_TemplatedMixin",
  "dijit/form/Button",
  "bpi/music/track",
  "bpi/utils/util",
  "dojo/text!./templates/playlist.html"
],

function (declare, lang, win, when, aspect, on, touch, domConst, domAttr, domGeom, domStyle, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, Button, track, util, template){
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: template,

    postCreate: function() {
      if(dojoConfig.device !== "computer") {
        on(this._btnStored, "click", lang.hitch(this, function(evt)  {
          this._loadStoredPlaylists();
        }));
      }
      else{
        domStyle.set(this._btnStored, "display", "none");
        domStyle.set(this.slideInHolder, "display", "block");
        this.listStoredPlaylists(this.slideInHolder, "<br />");
      }
    },

    listStoredPlaylists: function(domHolder, buttonSplit) {
      var storedPlaylists = [], _self = this;
      when(util.requestStoredPlaylists()).then(lang.hitch(this, function(res){
        res = res.replace(/\n/g,"$%^");
        storedPlaylists = res.split("$%^");
        domConst.empty(domHolder);
        for (i = 0; i <= storedPlaylists.length; i++) {
          if (storedPlaylists[i] !== "" && storedPlaylists[i] !== undefined && storedPlaylists[i] !== "Starred") {
            var btnPlaylistTitle = new Button({
              label: storedPlaylists[i],
              onClick: function(){
                util.command(("mpc load '" + this.label +"'")).then( lang.hitch(this, function(res) {
                  _self.list();
                }));
              }
            });
            btnPlaylistTitle.placeAt(domHolder);
            domStyle.set(btnPlaylistTitle.domNode,"width","80%");
            domStyle.set(btnPlaylistTitle.domNode.firstChild, "display", "block");
            if (buttonSplit) {
              domConst.place(buttonSplit, domHolder);
            }
          }
        }
      }));
    },

    list: function() {
      var tracklist = [], i, individualTrack = [];
      domConst.empty(this.playlistCurrent);
      when(util.requestCurrentPlaylist()).then(lang.hitch(this, function(res){
        if(res) {
          res = res.replace(/\n/g,"$%^");
          tracklist = res.split("$%^");
          for(i = 0; i <= tracklist.length; i++ ){
            if(tracklist[i] !== "" && tracklist[i] !== undefined) {
              var trackResult = new track;
              individualTrack = tracklist[i].split(" - ");
              when(trackResult.displayTrack({name: individualTrack[0], href: (i + 1), artist: individualTrack[1]}, this.playlistCurrent, false)).then(lang.hitch(this, function(){
                aspect.after(trackResult, "onPlaylistRemove", lang.hitch(this, function(){ this.list() }));
              }));
            }
          }
        }
        else{
          domAttr.set(this.playlistCurrent, "innerHTML", "<span class='noSongs'>No songs Queued</span>");
        }
      }));
    },

    clear: function() {
      domAttr.set(this.playlistCurrent, "innerHTML", "<span class='noSongs'>No songs Queued</span>");
    },

    _loadStoredPlaylists: function() {
      domStyle.set(this.slideInEnder, "display", "block");
      domStyle.set(this.slideInHolder, "display", "block");
      this.listStoredPlaylists(this.slideInHolder, "<br />");
      domStyle.set(win.body(), "overflow", "hidden");
      on(this.slideInEnder, "click", lang.hitch(this, function(evt)  {
      domStyle.set(this.slideInEnder, "display", "none");
      domStyle.set(this.slideInHolder, "display", "none");
      }));
    }

  });
});