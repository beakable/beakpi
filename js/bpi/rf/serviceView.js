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


    loadRfNodes: function(){
      var _self = this;
      var dfd = new Deferred();
      when(util.requestRF('<zbpPacket><Object>ZBP_System</Object><methodName>Sys_Authenticate</methodName><Arguments><Argument type="string">b02e5b66ace6dc3b459be661062c452b50ea1c13</Argument></Arguments></zbpPacket>'), function(res){
        res = _self._filterData(res);
        _self._session = "<session>" + res.session + "</session>";
        when(util.requestRF('<zbpPacket><Object>ZBP_Node</Object><methodName>Node_GetAllNodesJson</methodName><Arguments></Arguments>'+_self._session+'</zbpPacket>'), function(listRes){
           listRes = _self._filterData(listRes);
            console.log(listRes);
          _self.viewNodes(listRes);
          dfd.resolve();
        });
      });
      return dfd.promise;
    },

    _filterData: function(result) {
      if(result.data) {
        return result.data;
      }
      else{
        return result;
      }
    },


    viewNodes: function(nodes) {
      var nodeArray = JSON.parse(nodes.Arguments.Argument[1]);
      var _self = this;
      array.forEach(nodeArray, lang.hitch(this, function(node){
        if(node.name !=="") {
          var btnPowerOn = new Button({
            label: "Off",
            rfid: node.id,
            onClick: function(){
              when(util.requestRF('<zbpPacket><Object>ZBP_Node</Object><methodName>Node_ClusterCommand</methodName><Arguments><Argument type="uchar" base="10">2</Argument><Argument type="ushort" base="10">'+this.rfid+'</Argument><Argument type="uchar" base="10">0</Argument><Argument type="ushort" base="10">0</Argument><Argument type="uchar" base="10">0</Argument><Argument type="QByteArray" base="10">[19,0]</Argument></Arguments>'+_self._session+'<id>14921</id></zbpPacket>'), function(res) {
                console.log("Response: " , res);
              });
            }
          });
          var btnPowerOff = new Button({
            label: "On",
            rfid: node.id,
            onClick: function(){
              when(util.requestRF('<zbpPacket><Object>ZBP_Node</Object><methodName>Node_ClusterCommand</methodName><Arguments><Argument type="uchar" base="10">2</Argument><Argument type="ushort" base="10">'+this.rfid+'</Argument><Argument type="uchar" base="10">0</Argument><Argument type="ushort" base="10">0</Argument><Argument type="uchar" base="10">0</Argument><Argument type="QByteArray" base="10">[2,0]</Argument></Arguments>'+_self._session+'<id>14921</id></zbpPacket>'), function(res) {
                console.log("Response: " , _self._CURRENT);
                _self._CURRENT++;
              });
            }
          });

          domConst.place("<h2>" +  node.name + "</h2>", this._serviceView);
          btnPowerOn.placeAt(this._serviceView);
          btnPowerOff.placeAt(this._serviceView);
        }
      }));
    }

  });
});