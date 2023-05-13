#!usr/bin/bash

sudo killall -9 node > "/home/pi/nodeJS/logs/shutdown.log"
wait

DATE=$(date +"%F")

sudo python3 /home/pi/nodeJS/python/sysStats.py &

sudo node /home/pi/nodeJS/servers-80xx/80xx-indexPage.js >> "/home/pi/nodeJS/logs/log-$DATE.log" &
sudo node /home/pi/nodeJS/servers-80xx/8010-serverStatusPage.js >> "/home/pi/nodeJS/logs/log-$DATE.log" &
sudo node /home/pi/nodeJS/servers-80xx/8020-ToDo.js >> "/home/pi/nodeJS/logs/log-$DATE.log" &
sudo node /home/pi/nodeJS/servers-80xx/8030-adminPanel.js >> "/home/pi/nodeJS/logs/log-$DATE.log" &
sudo node /home/pi/nodeJS/servers-80xx/8040-GPIOControl.js >> "/home/pi/nodeJS/logs/log-$DATE.log" &

sudo node /home/pi/nodeJS/rest-workspace-90xx/index.js >> "/home/pi/nodeJS/logs/log-$DATE.log" &
