# BeakPi Home Automation

Follow more about this project on Twitter: [Beakable Twitter for BeakPi](https://twitter.com/Beakable)


![Spotify Player Interface](http://beakable.com/img/beakpi/image-3.png)![Pandora Player Interface](http://beakable.com/img/beakpi/image-2.png)

![Desktop Player Interface](http://beakable.com/img/beakpi/desk-view.jpg)

[More Images of themes and player here](http://imgur.com/a/4KRRS)

The following video shows an early state of BeakPi: http://www.youtube.com/watch?v=8AcSKF8fZjw

====


The latest video shows the Spotify Player and RF control of lights.

Since this video Pandora has been implemented as well as a basic room temperature output and themes.


====

These setup instructions cover setting BeakPi up from a fresh OS install.

Currently it is presummed you are pulling this source for either using as a Spotify Player, Pandora Player, a Harmony RF Gateway, or all three.

Requirements for the Spotify Player: Spotify Premium Account - https://www.spotify.com/

Requirements for the Pandora Player: Free or Paid Pandora Account - http://www.pandora.com/

Requirements for the RF Gateway: ZBPLM - https://www.simplehomenet.com/proddetail.asp?prod=ZigBee_INSTEON_X10_Interface

Requirements for the Temperature USB: http://www.dracal.com/store/products/usbtenki/index.php

The eventual aim of BeakPi is not to be tied to set devices and allow for easy modifcation of system command calls. However right now these are the peripherals being used.

 ====


After installing line 7 to 12 in index.php holds the required config parameters to run BeakPi.



### Update first:

`sudo apt-get update`


### Install apache and PHP:

`sudo apt-get install php5-common libapache2-mod-php5 php5-cli`

You should now be able to go to the IP address of your Pi in a browser and see a "It Works!" message


### Pull BeakPi Source:

```
cd /var/www
sudo git clone https://github.com/beakable/beakpi.git .
```
## Install CouchDB 

```
sudo apt-get install couchdb
```

Create a Table called Settings

Add a Field: "theme" 
with the value: "clear"

So it looks like the following:

````
_id: 09abf27c06c77ee0d116ed7c1400b697
_rev: 73-5266717cd8db3070edc70c0bfdf41642
theme: clear

```
Add a view called "all" which does the following:

```
function(doc) {
  emit(doc._id, doc);
}
```

UPDATE PROXY to access couchdb without cross domain proxy issues (Need to look at using localhost rather than fixed IP).
Change the IP 192.168.1.68 to reflect your fixed IP -- Temporary.

```
sudo a2enmod proxy

sudo nano /etc/apache2/mods-enabled/proxy.conf

ProxyRequests On
ProxyPass /couchdb http://192.168.1.68:5984

sudo service apache2 restart
```

## Pi Settings

```
sudo usermod -G video www-data
sudo reboot
```

## Pandora

### Install pianod:

http://deviousfish.com/pianod/index.html

You will probably need to do the following first

```
sudo apt-get install libgcrypt11-dev libgnutls-dev libjson0-dev libfaad-dev ksh
```

Download the latest tar from DeviousFish and install:

http://deviousfish.com/Downloads/pianod/

```
cd
sudo wget http://deviousfish.com/Downloads/pianod/pianod-latest.tar.gz
tar zxvf pianod-latest.tar.gz
cd pianod-latest
sudo ./configure 
sudp make
sudo make install
```

### Setup pianod

Create the service file:

```
sudo nano /etc/init.d/pianod
```

Inside it place:

```
#! /bin/sh
### BEGIN INIT INFO
# Provides:          pianod
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Starts pianod
# Description:       pianod is a clent/server for Pandora.  This init script
#                    copied and repurposed from RasPi init.d/lirc
### END INIT INFO

# Load functions
. /lib/lsb/init-functions

# Load config file if exists
CONFIGFILE=/etc/pianod.conf
if [ -f "$CONFIGFILE" ]; then
  . "$CONFIGFILE"
fi

# Use value set by config file or else defaults
DAEMON=${DAEMON:-/usr/sbin/pianod}
test -f $DAEMON || exit 0

case "$1" in
  start)
    log_daemon_msg "Starting pianod"

    # Load param from config file or else use default
    STARTSCRIPT=${STARTSCRIPT:-/etc/pianod.startscript}

    if [ ! -f "$STARTSCRIPT" ]; then
      log_warning_msg "$STARTSCRIPT not found"
      log_end_msg 1
    else
      # Use params from config file if available or leave blank for defaults
      USERFILE=${USERFILE:-/etc/pianod.userfile}
      ARGS="-i $STARTSCRIPT ${PORT:+-p $PORT} ${USERFILE:+-u $USERFILE} ${LOGGING:+$LOGGING} $ARGS"

      #/usr/local/bin/ao_example > /tmp/ao_example.log 2>&1
      #$DAEMON $ARGS > /tmp/pianod.log 2>&1
      start-stop-daemon --start --background --quiet --exec $DAEMON -- $ARGS
      exitval=$?

      # Because we are using --background flag to force pianod into the BG,
      # we can't get the actual return value from pianod, so 0 doesn't 
      # necessarily mean it actually started
      if [ $exitval = 0 ]; then
        # Check whether it started, but it might be too early...
        start-stop-daemon --status --exec $DAEMON
        exitval=$?
        
        # If hasn't started yet, wait a little while...
        if [ $exitval = 3 ]; then
          sleep 0.5
          start-stop-daemon --status --exec $DAEMON
          exitval=$?
        fi

        # Wait a little more...
        if [ $exitval = 3 ]; then
          sleep 0.5
          start-stop-daemon --status --exec $DAEMON
          exitval=$?
        fi

        # Wait a little more...
        if [ $exitval = 3 ]; then
          sleep 0.5
          start-stop-daemon --status --exec $DAEMON
          exitval=$?
        fi

        # Waited long enough; report success or failure
        log_end_msg $exitval
      else
        log_end_msg $exitval
      fi
    fi
    ;;

  stop)
    log_daemon_msg "Stopping pianod"
    start-stop-daemon --stop --quiet --exec $DAEMON
    log_end_msg $?
    ;;

  restart|reload|force-reload)
    $0 stop
    sleep 1
    $0 start
    ;;

  status)
    status_of_proc $DAEMON "pianod"
    ;;

  *)
    echo "Usage: /etc/init.d/pianod {start|stop|reload|restart|force-reload}"
    echo "Configuration loaded from $CONFIGFILE"
    exit 1
    ;;
esac

exit 0
```

```
sudo touch /etc/pianod.passwd
sudo chmod 777 /etc/pianod.passwd
sudo touch /etc/pianod.startscript
sudo chmod 777 /etc/pianod.startscript
sudo nano /etc/pianod.startscript

```

Inside the startscript file place:

```
user admin admin
pandora user PANDORAUSER PANDORAPASS
```

```
sudo touch /etc/pianod.conf
sudo chmod 777 /etc/pianod.conf
sudo nano /etc/pianod.conf

```
Inside the conf file place:

```
#!/bin/sh
DAEMON=/usr/local/bin/pianod
STARTSCRIPT=/etc/pianod.startscript
USERFILE=/etc/pianod.passwd
# default port 4445
PORT=
# LOGGING=-Z/dev/stderr
LOGGING=
# run as user pi
ARGS="-n root"
```

```
sudo update-rc.d pianod  defaults 
```

Perform a `service pianod start`

Reboot your Pi

## Spotify

### Install Mopidy:

http://docs.mopidy.com/en/latest/installation/raspberrypi/

```
sudo modprobe ipv6
echo ipv6 | sudo tee -a /etc/modules
wget -q -O - http://apt.mopidy.com/mopidy.gpg | sudo apt-key add -
sudo wget -q -O /etc/apt/sources.list.d/mopidy.list http://apt.mopidy.com/mopidy.list
sudo apt-get update
sudo apt-get install mopidy
```


### Setup Mopidy:

```
cd
mkdir .config
mkdir .config/mopidy
touch .config/mopidy/mopidy.conf
nano .config/mopidy/mopidy.conf
```

In the config file:
```
[mpd]
hostname = ::

[http]
enabled = true
hostname = ::
port = 6680

[spotify]
username = SPOTIFYUSER
password = SPOTIFYPASS

[local]
enabled = false

[scrobbler]
enabled = false
```

Running `mopidy` should now work.


### Setup Mopidy as A Service:

http://delarre.net/posts/setting-up-a-raspberry-pi-media-center/

```
sudo adduser --system mopidy
sudo adduser mopidy audio
sudo mkdir /home/mopidy/.config
sudo mkdir /home/mopidy/.config/mopidy
cd
sudo cp .config/mopidy/mopidy.conf /home/mopidy/.config/mopidy/mopidy.conf
sudo nano /etc/init.d/mopidy
```

Paste in the following (For a description of what you're doing check out Ben Delarres great blog post linked):

```
#!/bin/bash
# mopidy daemon
# chkconfig: 345 20 80
# description: mopidy daemon
# processname: mopidy
### BEGIN INIT INFO
# Provides:          mopidy deamon
# Required-Start:    $remote_fs $syslog $network
# Required-Stop:     $remote_fs $syslog $network
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start mopidy daemon at boot time
# Description:       Enable mopidy music server
### END INIT INFO

DAEMON_PATH="/usr/bin/"

DAEMON=mopidy
DAEMONOPTS=""

NAME=mopidy
DESC="My mopidy init script"
PIDFILE=/var/run/$NAME.pid
SCRIPTNAME=/etc/init.d/$NAME

case "$1" in
start)
        echo "Starting Mopidy Daemon"
        start-stop-daemon --start --chuid mopidy --background --exec /usr/bin/mopidy \
                --pidfile $PIDFILE --make-pidfile \
                -- 2>/var/log/mopidy.log
;;
stop)
     echo "Stopping Mopidy Daemon"
        start-stop-daemon --stop --exec /usr/bin/mopidy --pidfile $PIDFILE
;;

restart)
        $0 stop
        $0 start
;;

*)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
esac
```

Then:

```
sudo chmod +x /etc/init.d/mopidy
sudo update-rc.d mopidy defaults
sudo touch /var/log/mopidy.log
sudo chmod 666 /var/log/mopidy.log
sudo touch /var/run/mopidy.pid
sudo chmod 666 /var/run/mopidy.pid
sudo service mopidy start
```

## Smartenit RF 

### To Setup Smartenit RF Gateway:

https://www.simplehomenet.com/solutions.asp?page_id=HomAidPi

`sudo nano /etc/apt/sources.list`

Add to the end of the file:

`deb http://harmonygateway.com/repo/ZBPServer/debian/arm/RPi /`

Then:

```
sudo apt-get update
sudo apt-get install zbpserver
sudo reboot
sudo service zbp start
Use http://harmonygateway.com/ to setup initial Config.
```



## Misc Setup


### Setup Wi-Pi Dongle:

http://www.element14.com/community/docs/DOC-49107/l/wi-pi-wi-pi-wlan-installation-procedure-for-raspbian-on-raspberry-pi

`sudo nano /etc/network/interfaces`

For WPA/WPA2 add to the end of the file:

```
auto wlan0
iface wlan0 inet dhcp
wpa-ssid YOUWIFINANE
wpa-psk YOURWIFIPASS
```


I had issues due to other stuff in the networking file, my final file looked like:

```
auto lo
iface lo inet loopback
iface eth0 inet dhcp
auto wlan0
allow-hotplug wlan0
iface wlan0 inet dhcp
wpa-ssid YOUWIFINANE
wpa-psk YOURWIFIPASS
```

Then:

`sudo service networking restart`


### To setup FTP

```
sudo apt-get install vsftpd
sudo chmod -R 777 /var/www/
```






