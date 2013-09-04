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
  "dojo/Deferred",
  "dojo/dom",
  "dojo/dom-construct",
  "dijit/_WidgetBase",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/_TemplatedMixin",
  "dijit/form/Button",
  "dijit/form/Select",
  "bpi/utils/util",
  "bpi/utils/couchdb",
  "dojox/timing",
  "dojo/text!./templates/serviceView.html"
],

function(declare, lang, array, Deferred, dom, domConst, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, Button, Select, util, couchdb, timing, template) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    widgetsInTemplate: true,
    templateString: template,

    _intervalCurrentUsage: new timing.Timer(3000),

    _refreshCurrentUsage: function() {
      var _self = this;
      var dfd = new Deferred();
      when(util.getSystemUsage(), function(resData){
        when(util.command("/opt/vc/bin/vcgencmd measure_temp"), function(res){
          domConst.empty(_self._serviceViewCurrent);
          systemData = resData.split("|");
          domConst.place("<span>Current CPU Usage: " + systemData[0] + "%</span>", _self._serviceViewCurrent);
          domConst.place("<br /><span>Current Memory Usage: "  + systemData[2] + " / " + systemData[1] + " MB</span>", _self._serviceViewCurrent);
          domConst.place("<br /><span>Current Pi Temperature: " + res[0].replace("temp=", "") + "</span>", _self._serviceViewCurrent);
          dfd.resolve();
        });
      });
      return dfd.promise;
    },

    endSettings: function() {
      this._intervalCurrentUsage.stop();
    },

    load: function() {
      var _self = this;
      var dfd = new Deferred();
      var systemData = [];

      couchdb.getValues("settings").fetch({
        query:"_design/all/_view/all",
        onComplete:function(results){
        },
        onError: function(err){
        }
      });

      var themeSelect = new Select({
        name: "colourScheme",
        style: "color: #000; width:200px",
        options: [
            { label: "Original BeakPi", value: "original" },
            { label: "Drugged Lemonade", value: "lemonade"},
            { label: "Firebelly Toad", value: "firebelly" },
            { label: "Burnt Toast", value: "burnt" },
            { label: "Clear Clouds", value: "clear" }
        ]
      }).placeAt(this._serviceViewControls);

      new Button({
        name: "saveScheme",
        label: "Update Sceheme",
        onClick: lang.hitch(this, function() {
          couchdb.updateValue("settings", "theme", themeSelect.get("value"));
            if(dojoConfig.device === "phone") {
              dom.byId("beakPiTheme").href = 'css/' + themeSelect.get("value") + '/bpiMobile.css';
            }
            else {
              dom.byId("beakPiTheme").href = 'css/' + themeSelect.get("value") + '/bpiMain.css';
            }
        })
      }).placeAt(this._serviceViewControls);

      this._intervalCurrentUsage.onTick = lang.hitch(this,function() {
        this._refreshCurrentUsage();
      });
      this._intervalCurrentUsage.start();
      when(this._refreshCurrentUsage(), function(){
        domConst.place("<br /><span>__________________________</span><br />", _self._serviceViewInfo);
        when(util.command("/opt/vc/bin/vcgencmd measure_volts"), function(res){
          domConst.place("<br /><span>Volts: " + res[0].replace("volt=", "") + "</span>", _self._serviceViewInfo);
           when(util.command("/opt/vc/bin/vcgencmd get_mem arm"), function(res){
            domConst.place("<br /><span>ARM Memory: " + res[0].replace("arm=", "") + "</span>", _self._serviceViewInfo);
            when(util.command("/opt/vc/bin/vcgencmd get_mem gpu"), function(res){
              domConst.place("<br /><span>GPU Memory: " + res[0].replace("gpu=", "") + "</span>", _self._serviceViewInfo);
              dfd.resolve();
            });
          });
        });
      });
      return dfd.promise;
    }

  });
});