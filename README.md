====
BeakPi

BeakPi is at a very basic stage currently. It is an open source home automation system for the Raspberry Pi.

Currently it only supports home audio which requires:

1 - Spotify Premium Account

2 - Mopidy: http://www.mopidy.com/

3 - MPC and MPD

4 - Apache and PHP installed

====

It almost supports RF interfacing for X10 and Insteon Devices using: https://www.simplehomenet.com/proddetail.asp?prod=ZigBee_INSTEON_X10_Interface

====


To Install:

1 - Navigate to your web root

2 - Perform: `git clone https://github.com/beakable/beakpi.git .`

3 - Configure line 7, 8, 9 and 10 of index.php to reflect your Mopidy websocket address and Spotify region account

4 - Done
