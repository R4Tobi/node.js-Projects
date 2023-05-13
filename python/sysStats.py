import time, psutil
from gpiozero import CPUTemperature
import json

try:
    while True:
        file = open("/home/pi/nodeJS/python/data/systemStats.json", "w")

        jsonStr = '{\n' + '"CPU_TEMP":"' + str(CPUTemperature().temperature) +' °C",\n' + '"CPU_USAGE":"' + str(psutil.cpu_percent(interval=0, percpu=False)) + '%",\n' + '"CPU_FREQ":"' + str(psutil.cpu_freq()[0]) + ' MHz",\n' + '"RAM_USAGE":"' + str(psutil.virtual_memory()[2]) + '%"\n' + '}'
        file.write(jsonStr)
        file.close()
        time.sleep(1)
except KeyboardInterrupt:
    print(" \n Cleaning up!")

