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
"dojo/store/Memory",
],

 function(xhr, JSON, Deferred, Memory) {
 return {

 	store: null,
 	storeLength: null,


  xmlToJson: function(xml) {
    
    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
      // do attributes
      if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType == 3) { // text
      obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
      for(var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = item.nodeName;
        if (typeof(obj[nodeName]) == "undefined") {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof(obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  },

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
    preventCache: false,
    }).then(function(data){
    	dfd.resolve(data);
    }, function(err){
    	dfd.resolve(undefined);
    }, function(evt){

    });  
	  return dfd.promise;
 	},

 	requestCurrentTrack: function() {
    var dfd = new Deferred();
    xhr("/php/currentTrack.php", {
    preventCache: false,
    }).then(function(data){
    	dfd.resolve(data);
    }, function(err){
    	dfd.resolve(undefined);
    }, function(evt){

    });  
    return dfd.promise;
 	},

 	requestCurrentSeek: function(){
	  var dfd = new Deferred();
	  xhr("/php/currentSeek.php", {
		preventCache: false,
	  }).then(function(data){
			dfd.resolve(data);
	  }, function(err){
			dfd.resolve(undefined);
	  }, function(evt){

	  });  
	  return dfd.promise;
 	},
  
  requestStoredPlaylists: function(){
    var dfd = new Deferred();
      xhr("/php/mpc.php?xhr=lsplaylists", {
      }).then(function(data){
        dfd.resolve(data);
      }, function(err){
        dfd.resolve(err);
      }, function(evt){

      });   
    return dfd.promise;
  },

  requestCurrentPlaylist: function(){
	  var dfd = new Deferred();
	  xhr("/php/currentPlaylist.php", {
		preventCache: false,
	  }).then(function(data){
			dfd.resolve(data);
	  }, function(err){
			dfd.resolve(undefined);
	  }, function(evt){

	  });  
	  return dfd.promise;
 	},

  commandPlayTrack: function(com){
     mopidy.tracklist.add(null, null, com)
  },

  commandTracklist: function(com){
     mopidy.tracklist[com]();
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
	  }).then(function(data){
      dfd.resolve(data);
	  }, function(err){
	  	dfd.resolve(err);
	  }, function(evt){
	  	dfd.resolve(evt);
	  });  
	  return dfd.promise;
  },

// ---------------------------


  requestRF: function(xml) {
    var _self = this;
    var dfd = new Deferred();
    xhr.post("/php/tcpsocket.php",{
      method: "POST",
      handleAs: "json",
      data: {
            xmlpost: xml
      }
    }).then(function(data){
      dfd.resolve(data);
    }, function(err){
      dfd.resolve(err);
    }, function(evt){
      dfd.resolve(evt);
    });  
    return dfd.promise;
  }

}
});