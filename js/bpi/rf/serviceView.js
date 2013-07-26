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

/*
RF Commands
0x6 == All Lights Off
0xE == Status = Off
0x2 ==On
0xA == Preset Dim
0x1 == All Lights On
0x9 == Hail Acknowledge
0x5 == Bright
0xD == Status = On
0x7 == Extended Code
0xF == Status Request
0x3 == Off
0xB == Preset Dim
0x0 == All Units Off
0x8 == Hail Request
0x4 == Dim
0xC == Extended Data (analog)
*/

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/json",
  "dojo/Deferred",
  "dojo/dom-construct",
  "dijit/_WidgetBase",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/_TemplatedMixin",
  "dijit/form/Button",
  "bpi/utils/util",
  "dojo/text!./templates/serviceView.html"
],

function(declare, lang, array, JSON, Deferred, domConst, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, Button, util, template) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    widgetsInTemplate: true,
    templateString: template,

    _socket: null,
    _session: null,
    _CURRENT: 0,


    load: function(){
      var _self = this;
      var dfd = new Deferred();
      when(util.requestRF('<zbpPacket><Object>ZBP_System</Object><methodName>Sys_Authenticate</methodName><Arguments><Argument type="string">'+dojoConfig.radioFrequencySHAPassword+'</Argument></Arguments></zbpPacket>'), function(res){
        _self._session = "<session>" + res.session + "</session>";
        console.log(res)
        when(util.requestRF('<zbpPacket><Object>ZBP_Node</Object><methodName>Node_GetAllNodesJson</methodName><Arguments></Arguments>'+_self._session+'</zbpPacket>'), function(listRes) {
          _self.viewNodes(listRes);
          dfd.resolve();
        });
      });
      return dfd.promise;
    },

    viewNodes: function(nodes) {
      var nodeArray = JSON.parse(nodes.Arguments.Argument[1]);
      var _self = this;
      array.forEach(nodeArray, lang.hitch(this, function(node){
        if (node.name !=="") {
          var btnPowerOn = new Button({
            label: "On",
            rfid: node.id,
            onClick: function(){
              when(util.requestRF('<zbpPacket><Object>ZBP_Node</Object><methodName>Node_ClusterCommand</methodName><Arguments><Argument type="uchar" base="10">2</Argument><Argument type="ushort" base="10">'+this.rfid+'</Argument><Argument type="uchar" base="10">0</Argument><Argument type="ushort" base="10">0</Argument><Argument type="uchar" base="10">0</Argument><Argument type="QByteArray" base="10">[2]</Argument></Arguments>'+_self._session+'<id>'+this.rfid+'</id></zbpPacket>'), function(res) {
                console.log("Response: " , res);
              });
            }
          });

          var btnPowerOff = new Button({
            label: "Off",
            rfid: node.id,
            onClick: function(){
              when(util.requestRF('<zbpPacket><Object>ZBP_Node</Object><methodName>Node_ClusterCommand</methodName><Arguments><Argument type="uchar" base="10">2</Argument><Argument type="ushort" base="10">'+this.rfid+'</Argument><Argument type="uchar" base="10">0</Argument><Argument type="ushort" base="10">0</Argument><Argument type="uchar" base="10">0</Argument><Argument type="QByteArray" base="10">[3]</Argument></Arguments>'+_self._session+'<id>'+this.rfid+'</id></zbpPacket>'), function(res) {
                console.log("Response: " , _self._CURRENT);
                _self._CURRENT++;
              });
            }
          });

          var btnPowerDim = new Button({
            label: "Dim",
            rfid: node.id,
            onClick: function(){
              when(util.requestRF('<zbpPacket><Object>ZBP_Node</Object><methodName>Node_ClusterCommand</methodName><Arguments><Argument type="uchar" base="10">2</Argument><Argument type="ushort" base="10">'+this.rfid+'</Argument><Argument type="uchar" base="10">0</Argument><Argument type="ushort" base="10">0</Argument><Argument type="uchar" base="10">0</Argument><Argument type="QByteArray" base="10">[4]</Argument></Arguments>'+_self._session+'<id>'+this.rfid+'</id></zbpPacket>'), function(res) {
                console.log("Response: " , res);
              });
            }
          });

          var btnPowerBrighten = new Button({
            label: "Brighten",
            rfid: node.id,
            onClick: function(){
              when(util.requestRF('<zbpPacket><Object>ZBP_Node</Object><methodName>Node_ClusterCommand</methodName><Arguments><Argument type="uchar" base="10">2</Argument><Argument type="ushort" base="10">'+this.rfid+'</Argument><Argument type="uchar" base="10">0</Argument><Argument type="ushort" base="10">0</Argument><Argument type="uchar" base="10">0</Argument><Argument type="QByteArray" base="10">[5]</Argument></Arguments>'+_self._session+'<id>'+this.rfid+'</id></zbpPacket>'), function(res) {
                console.log("Response: " , _self._CURRENT);
                _self._CURRENT++;
              });
            }
          });

          if (node.name.toLowerCase().indexOf("lamp") === -1) {
            domConst.place("<h3>" +  node.name + "</h3>", this._serviceView);
            btnPowerOff.placeAt(this._serviceView);
            domConst.place("<span> - </span>", this._serviceView);
            btnPowerOn.placeAt(this._serviceView);
          }
          else {
            domConst.place("<h3>" +  node.name + "</h3>", this._serviceView);
            btnPowerOff.placeAt(this._serviceView);
            domConst.place("<span> - </span>", this._serviceView);
            btnPowerDim.placeAt(this._serviceView);
            domConst.place("<span> - </span>", this._serviceView);
            btnPowerBrighten .placeAt(this._serviceView);
            domConst.place("<span> - </span>", this._serviceView);
            btnPowerOn.placeAt(this._serviceView);
          }
        }
      }));
    }

  });
});