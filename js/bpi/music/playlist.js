/*  This file is part of BeakPi.

    Foobar is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Foobar is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>. */


 define([
 	"dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/when",
  "dojo/aspect",
  "dojo/dom-construct",
  "dojo/dom-attr",
 	"dijit/_WidgetBase",
 	"dijit/_TemplatedMixin",
  "dijit/form/Button",
  "dijit/bpi/music/track",
  "dijit/bpi/utils/util",
 	"dojo/text!./templates/playlist.html",
 ],

 function (declare, lang, when, aspect, domConstruct, domAttr, _WidgetBase, _TemplatedMixin, Button, track, util, template){
 	return declare([_WidgetBase, _TemplatedMixin], {
 		templateString: template,

 		postCreate: function() {
      
 		},

    listStoredPlaylists: function() {
      var storedPlaylists = [], self = this;
      domConstruct.empty(this.playlistStored);
      when(util.requestStoredPlaylists()).then(lang.hitch(this, function(res){
        res = res.replace(/\n/g,"$%^");
        storedPlaylists = res.split("$%^");
        for(i = 0; i <= storedPlaylists.length; i++ ){
          if(storedPlaylists[i] !== "" && storedPlaylists[i] !== undefined && storedPlaylists[i] !== "Starred") {
            var myButton = new Button({
                label: storedPlaylists[i],
                onClick: function(){
                  util.command(("mpc load '" + this.label +"'")).then( lang.hitch(this, function(res) {
                    self.list();
                  }));
                }
            });
            myButton.placeAt(this.playlistStored);
          }
        }
      }));
    },

    list: function() {
      var tracklist = [], i, individualTrack = [];
      domConstruct.empty(this.playlistCurrent);
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
    }
  
 	});
 });