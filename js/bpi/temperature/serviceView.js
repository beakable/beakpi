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
  "dojo/when",
  "dojo/dom-attr",
  "dojo/dom-construct",
  "dijit/_WidgetBase",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/_TemplatedMixin",
  "dijit/form/Select",
  "bpi/utils/util",
  "dojox/timing",
  "dojox/charting/Chart",
  "dojox/charting/axis2d/Default",
  "dojox/charting/plot2d/StackedLines",
  "dojox/charting/themes/Julie",
  "dojo/text!./templates/serviceView.html"
],

function(declare, lang, array, when, domAttr, domConst, _WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, Select, util, timing, Chart, Default, StackedLines, Julie, template) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    widgetsInTemplate: true,
    templateString: template,
    intervalCurrentPlaying: new timing.Timer(1500),
    storedTemperatures: null,

    hours: [
      {value: 0, text: "00:00"},
      {value: 12, text: "01:00"},
      {value: 24, text: "02:00"},
      {value: 36, text: "03:00"},
      {value: 48, text: "04:00"},
      {value: 60, text: "05:00"},
      {value: 72, text: "06:00"},
      {value: 84, text: "07:00"},
      {value: 96, text: "08:00"},
      {value: 108, text: "09:00"},
      {value: 120, text: "10:00"},
      {value: 134, text: "11:00"},
      {value: 144, text: "12:00"},
      {value: 156, text: "13:00"},
      {value: 168, text: "14:00"},
      {value: 180, text: "15:00"},
      {value: 192, text: "16:00"},
      {value: 204, text: "17:00"},
      {value: 216, text: "18:00"},
      {value: 228, text: "19:00"},
      {value: 240, text: "20:00"},
      {value: 252, text: "21:00"},
      {value: 264, text: "22:00"},
      {value: 276, text: "23:00"},
      {value: 288, text: "00:00"}
    ],

    load: function() {
      when(util.getStoredTemps(), lang.hitch(this, function(res){

        storedTemperatures = res;

        
        var currentTimestamp = new Date().getTime();
        var now = new Date(currentTimestamp);
        var storedDateArr = [];
        var lastStoredDate = null;
        array.forEach(res.rows, lang.hitch(this, function (val) {
          var  currentDate = new Date(val.key);
          var storedDateSplit = String(currentDate).split(" ");

          if (lastStoredDate !== storedDateSplit[0] + " " + storedDateSplit[1] + " " + storedDateSplit[2]) {
            lastStoredDate = storedDateSplit[0] + " " + storedDateSplit[1] + " " + storedDateSplit[2];
            storedDateArr.push({label: lastStoredDate, value: lastStoredDate});
          }
        }));

        var daySelect = new Select({
            name: "dateSelect",
            options: storedDateArr,
            onChange: lang.hitch(this, function(val){
              this._createGraph(val);
            })
        })
        daySelect.placeAt(this._daySelectHolder);
      }));
      
      when(this._updateCurrentTemp(), lang.hitch(this, function() {
        this.intervalCurrentPlaying.onTick = lang.hitch(this,function() {
          this._updateCurrentTemp();
        });
      }));
      this.intervalCurrentPlaying.start();
    },

    unload: function() {
      this.intervalCurrentPlaying.stop();
    },

    _createGraph: function(id) {
      var tempArray = [];
      var timeArray = [];
      var i = 0;
      var mins = 0;
      var timeAxis = [];
      array.forEach(storedTemperatures.rows, lang.hitch(this, function (val) {
        var  currentDate = new Date(val.key);
        var storedDateSplit = String(currentDate).split(" ");
        if (storedDateSplit[0] + " " + storedDateSplit[1] + " " + storedDateSplit[2] === id) {
          tempArray.push(val.value.replace(/[^0-9.]+/g, ''));
          timeArray.push(val.key);
          mins += 5;
          if (mins === 60) {
            i++;
            if (i === 24) {
              i = 0;
            }
            mins = 0;
          }
        }
      }));

      domConst.empty(this._graphHolder);

      var c = new Chart("stacked");
      var theme = Julie;
      c.addPlot("default", { type: StackedLines, tension: "S"})
      c.addAxis("x", {fixLower: "major", fixUpper: "major", labels: this.hours, majorTickStep: 12, minorTickStep: 1, max: 288,  fontColor: "white", stroke: "white"});
      c.addAxis("y", {vertical: true, fixLower: "major", fixUpper: "major", min: 60, max: 90, fontColor: "white", stroke: "white"});
      theme.chart.fill= "transparent";
      theme.plotarea.fill = "transparent";
      theme.axis.majorTick.color = "white";
      theme.axis.minorTick.color = "white ";

      c.setTheme(theme);

      c.addSeries("Series 2", tempArray, {stroke: {color: "red"}})
      c.render();
    },

    _updateCurrentTemp: function() {
      when(util.command("sudo usbtenkiget -T f"), lang.hitch(this, function(res) {
        domAttr.set(this._serviceView, "innerHTML", "Current Temperature: " + res);
      }));
      return;
      }
  });
});