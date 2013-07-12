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
  "dojo/dom-construct",
  "dijit/_WidgetBase",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/_TemplatedMixin",
  "dijit/form/Button",
  "bpi/utils/util",
  "dojo/text!./templates/serviceView.html"
],

function(declare, lang, array, Deferred, domConst, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, Button, util, template) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    widgetsInTemplate: true,
    templateString: template,


    loadSettings: function(){
      var _self = this;
      var dfd = new Deferred();
      when(util.command("/opt/vc/bin/vcgencmd measure_temp"), function(res){
        domConst.place("<span>Current Pi Temperature: " + res.replace("temp=", "") + "</span>", _self._serviceView);
          when(util.command("/opt/vc/bin/vcgencmd measure_volts"), function(res){
            domConst.place("<br /><span>Volts: " + res.replace("volt=", "") + "</span>", _self._serviceView);
             when(util.command("/opt/vc/bin/vcgencmd get_mem arm"), function(res){
              domConst.place("<br /><span>ARM Memory: " + res.replace("arm=", "") + "</span>", _self._serviceView);
              when(util.command("/opt/vc/bin/vcgencmd get_mem gpu"), function(res){
                domConst.place("<br /><span>GPU Memory: " + res.replace("gpu=", "") + "</span>", _self._serviceView);
                dfd.resolve();  
              });            
            });
          });
      });
      return dfd.promise;
    }

  });
});