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
  "dojox/data/CouchDBRestStore"
],

  function(couchDB) {
  return {

    getValues: function(table) {
      var db = couchDB.getStores("/couchdb/");
      return db[table];
    },

    getValue: function(results, val) {
      for(var i = 0; i < results.length; i++){
        var item = results[i];
        if(item[val] !== undefined){
          return item[val];
        }
      }
    },

    addValue: function(table, val) {
      var db = couchDB.getStores("/couchdb/");
      db[table].newItem(val);
      db[table].save();
    },

    updateValue: function(table, field, val, q) {
      var db = couchDB.getStores("/couchdb/");

      this.getValues(table).fetch({
        query:"_design/all/_view/all",
        onComplete:function(results) {
          for(var i = 0; i < results.length; i++){
            var item = results[i];
            if(item[field] !== undefined){
              db[table].setValue(item, field, val);
            }
          }
          db[table].save();
        },
        onError: function(err) {

        }
      });

     // console.log(db[table].length);
     // return db[table];
    }

  };
});