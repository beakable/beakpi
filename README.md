Update first:
`sudo apt-get update`

Install apache and PHP: 
`sudo apt-get install php5-common libapache2-mod-php5 php5-cli`

You should now be able to go to the IP address of your Pi in a browser and see a "It Works!" message

Install Mopidy:
http://docs.mopidy.com/en/latest/installation/raspberrypi/

```sudo modprobe ipv6
echo ipv6 | sudo tee -a /etc/modules
wget -q -O - http://apt.mopidy.com/mopidy.gpg | sudo apt-key add -
sudo wget -q -O /etc/apt/sources.list.d/mopidy.list http://apt.mopidy.com/mopidy.list
sudo apt-get update
sudo apt-get install mopidy```


Setup Mopidy:
```cd
mkdir .config
mkdir .config/mopidy
touch .config/mopidy/mopidy.conf
nano .config/mopidy/mopidy.conf```

In the config file:
```[mpd]
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
enabled = false```

Running mopidy should now work.


Setup Mopidy as A Service:
http://delarre.net/posts/setting-up-a-raspberry-pi-media-center/

```sudo adduser --system mopidy
sudo adduser mopidy audio
sudo mkdir /home/mopidy/.config
sudo mkdir /home/mopidy/.config/mopidy
cd
sudo cp .config/mopidy/mopidy.conf /home/mopidy/.config/mopidy/mopidy.conf
sudo nano /etc/init.d/mopidy```

Paste in the following (For a description of what you're doing check out Ben Delarres great blog post linked):

```#!/bin/bash
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
esac```

Then:
```sudo chmod +x /etc/init.d/mopidy
sudo update-rc.d mopidy defaults
sudo touch /var/log/mopidy.log
sudo chmod 666 /var/log/mopidy.log
sudo touch /var/run/mopidy.pid
sudo chmod 666 /var/run/mopidy.pid
sudo service mopidy start```


Pull BeakPi Source:
```cd /var/www
sudo git clone https://github.com/beakable/beakpi.git .```

Setup Wi-Pi Dongle:
http://www.element14.com/community/docs/DOC-49107/l/wi-pi-wi-pi-wlan-installation-procedure-for-raspbian-on-raspberry-pi

`sudo nano /etc/network/interfaces`

For WPA/WPA2 add to the end of the file:

```auto wlan0
iface wlan0 inet dhcp
wpa-ssid YOUWIFINANE
wpa-psk YOURWIFIPASS```


I had issues due to other stuff in the networking file, my final file looked like:

```auto lo

iface lo inet loopback
iface eth0 inet dhcp

auto wlan0
allow-hotplug wlan0
iface wlan0 inet dhcp
wpa-ssid YOUWIFINANE
wpa-psk YOURWIFIPASS```


Then:

`sudo service networking restart`

To setup access to system info for Settings:

```sudo usermod -G video www-data
sudo reboot```

To setup FTP

```sudo apt-get install vsftpd
sudo chmod -R 777 /var/www/```

To Setup Smartenit RF Gateway:
https://www.simplehomenet.com/solutions.asp?page_id=HomAidPi

`sudo nano /etc/apt/sources.list`

Add to the end of the file:

`deb http://harmonygateway.com/repo/ZBPServer/debian/arm/RPi /`

Then:
```sudo apt-get update
sudo apt-get install zbpserver
sudo reboot
sudo service zbp start`
Use http://harmonygateway.com/ to setup initial Config.```
