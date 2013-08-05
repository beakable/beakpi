var http = require('http');
var nano = require('nano')('http://192.168.1.68:5984');
var exec = require('child_process').exec;
var cronJob = require('cron').CronJob;

var temperature = nano.use('temperature');

new cronJob('*/1   *    *    *    *', function() {

  function insertTemp(val) {
    temperature.insert({ temp:  val, time: new Date().getTime()}, new Date().getTime(), function(err, body, header) {
      if (err) {
        console.log('[nano Error] ', err.message);
        return;
      }
      console.log('Temperature Added ' + new Date().getTime());
    });
  }

  function puts(error, stdout, stderr) {
    insertTemp(stdout);
  }

  exec("php5 /var/www/php/temperature.php", puts);

}, null, true);


console.log("Now Running...");