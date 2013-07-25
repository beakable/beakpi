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
  "dojo/request/xhr",
  "dojo/json",
  "dojo/Deferred",
  "dojo/store/Memory"
],

  function(xhr, JSON, Deferred, Memory) {
  return {

    store: null,
    storeLength: null,

    storeSet: function(saveName, saveValues) {
      if(this.store === null) {
        var dataToSave = [{id:0, name: saveName, value: saveValues}];
        this.store = new Memory({data: dataToSave});
        this.storeLength ++;
      }
      else {
        var exists = this.storeCheck(saveName);
        if (exists >= 0) {
          this.store.remove(exists);
          this.storeLength --;
        }
        this.store.put({id:this.storeLength, name: saveName, value: saveValues});
        this.storeLength ++;
      }
    },

    storeCheck: function(loadName) {
      var toFind = null;
      if(this.store !== null) {
        toFind = this.store.query({name: loadName});
        return toFind[0].id;
      }
    },

    storeGet: function(loadName) {
      var toFind = null;
      if(this.store !== null) {
        toFind = this.store.query({name: loadName});
        return toFind[0].value;
      }
    }, 

    requestSearch: function(path) {
      var dfd = new Deferred();
      xhr("/php/search.php?xhr="+path, {
        handleAs: "json"
      }).then(function(data){
        dfd.resolve(data);
      }, function(err){

      }, function(evt){

      });
      return dfd.promise;
    },

    requestCoverArt: function(path) {
      var dfd = new Deferred();
      xhr("/php/coverart.php?xhr=" + path, {
        preventCache: false
      }).then(function(data){
        dfd.resolve(data);
      }, function(err){
        dfd.resolve(undefined);
      }, function(evt){
      });
      return dfd.promise;
    },

    commandPlayTrack: function(com){
       mopidy.tracklist.add(null, null, com);
    },

    commandTracklist: function(com){
       mopidy.tracklist[com]();
    },
    commandShuffleTracks: function() {
      mopidy.tracklist.shuffle();
    },

    commandPlayer: function(com,args){
      if(args){
        mopidy.playback[com](args);
      }
      else{
        mopidy.playback[com]();
      }
    },

    command: function(com){
      var dfd = new Deferred();
      xhr("/php/command.php?xhr=" + com, {
        preventCache: true,
        handleAs: "json"
      }).then(function(data){
        dfd.resolve(data);
      }, function(err){
        dfd.resolve(err);
      });
      return dfd.promise;
    },

  // ---------------------------
  // RF Stuff

    requestRF: function(xml) {
      var dfd = new Deferred();
      xhr.post("/php/tcpsocket.php",{
        method: "POST",
        handleAs: "json",
        data: {
              xmlpost: xml
        }
      }).then(function(data){
        console.log(data);
        dfd.resolve(data);
      }, function(err){
        dfd.resolve(err);
      });
      return dfd.promise;
    },

  //-----------------------
  // Settings Stuff

    getSystemUsage: function(){
      var dfd = new Deferred();
      xhr("/php/systemuse.php", {
      }).then(function(data){
        dfd.resolve(data);
      }, function(err){
        dfd.resolve(err);
      });
      return dfd.promise;
    }

  };
});