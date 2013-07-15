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
"dojo/on",
"dojo/when",
"dojo/Deferred",
"dojo/dom-construct",
"dojo/dom-attr",
"dojo/dom-class",
"dijit/_WidgetBase",
"dijit/_TemplatedMixin",
"dijit/_WidgetsInTemplateMixin",
"dijit/registry",
"bpi/utils/util",
"dojox/widget/Toaster",
"dojo/text!./templates/track.html",
"dijit/form/Button",
"dojox/html/ellipsis"
],

function(declare, lang, fx, on, when, Deferred, domConstruct, domAttr, domClass, _WidgetBase,  _TemplatedMixin, _WidgetsInTemplateMixin, registry, util, Toaster, template) {
 	return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
  	widgetsInTemplate: true,
    templateString: template,

    _coverArt: null,
  	_title: null,
  	_btnPlay: null,
  	_btnQueue: null,

    onPlaylistRemove: function (){
      // Synthetic Event
    },

    getArt: function(track) {
      var dfd = new Deferred();
      when(util.requestCoverArt(track.href)).then(lang.hitch(this, function(art) {
        dfd.resolve(art);
      }));
      return dfd.promise;
    },

    displayQueuedPopup: function(toast, title){
        pos = "tr-down";
        msg_type = "message";
        toast.positionDirection = pos;
        toast.setContent(("Queued " + title), msg_type, 1000);
        toast.show();
      },

    displayArt: function(track) {
      when(this.getArt(track)).then(lang.hitch(this, function(res) {
        domAttr.set(this._coverArt, "innerHTML", "<img style='float:left; height:100px' src='"+res+"' />");
        fx.fadeIn({node: this.domNode}).play()
      }));
      domAttr.set(this._title, "innerHTML", track.name + "<br/>" + track.artist);
      domClass.add(this._track, "trackWithArt");
      domConstruct.place(this._buttons, this._track, "last");
    },

  	displayTrack: function(track, container, displayArt) {
  		var dfd = new Deferred();
  		if (track !== undefined) {
          if (displayArt) {
            this.displayArt(track);
          }
          else {
            domAttr.set(this._title, "innerHTML", "<span class='dojoxEllipsis name'>" + track.name + "</span>" + "<br/><span class='dojoxEllipsis artist'>" + track.artist + "</span>");
            domClass.add(this._track, "trackWithoutArt");
            fx.fadeIn({node: this.domNode}).play()
          }
					domConstruct.place(this.domNode, container);
				  
				  this.href = track.href;
					on(this._btnPlay, "click", lang.hitch(this, function(evt){
              if(isNaN(this.href)) {
                when(util.commandTracklist("clear")).then(lang.hitch(this, function() {
                  when(util.commandPlayTrack(this.href)).then(lang.hitch(this, function(res) {
                    util.commandPlayer("play");
                  }));
                }));
              }
              else {
                when(util.command("mpc play " + this.href)).then(lang.hitch(this, function(res) {
                  util.commandPlayer("play");
                }));
              }
            }));
            if(isNaN(this.href)) {
              on(this._btnQueue, "click", lang.hitch(this, function(evt) {
                when(util.commandPlayTrack(this.href)).then(lang.hitch(this, function(res) {
                  var title = "toaster" + track.name + Math.random()*100;
                  var myToaster = new Toaster({id: title}, this._track.domNode);
                  this.displayQueuedPopup(myToaster,track.name);
                  this._btnQueue.set( "disabled", "true");
                }));
              }));
            }
            else {
              this._btnQueue.set("label", " × ");
              on(this._btnQueue, "click", lang.hitch(this, function(evt) {
                when(util.command("mpc del " + this.href)).then(lang.hitch(this, function(res) {
                  this.onPlaylistRemove();
                }));
              }));
            }
					dfd.resolve();   
      }
      return dfd.promise;	
  	}

	});
});