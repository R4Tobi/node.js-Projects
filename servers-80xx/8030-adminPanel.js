const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();

function getTimeStamp(){
    const timestamp = Date.now(); 
    const dateObject = new Date(timestamp);
    const date = (dateObject.getDate()).toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear();
    const hour = (dateObject.getHours()).toString().padStart(2, '0');
    const minute = (dateObject.getMinutes()).toString().padStart(2, '0');
    const second = (dateObject.getSeconds()).toString().padStart(2, '0');
    return `[${year}-${month}-${date} ${hour}:${minute}:${second}]`;
}

const absolutePath = path.join(__dirname, '..');

app.use("/data", express.static(absolutePath + "/htdocs-80xx/"));

const port = 8030;

app.listen(port, () => {
    console.log(`${getTimeStamp()} \x1b[0;36mlistening to port: ${port} @ adminPanelServer\x1b[0;37m`)
});

app.get('/', (request, response) => {
    response.set('Content-Type', 'text/html;charset=utf-8');
    fs.readFile(absolutePath + "/htdocs-80xx/8030-adminPanel/index.html", function(err, content){
        response.send(content);
    });
    console.log(`${getTimeStamp()} "/" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m with "GET" @ adminPanelServer`)
});

app.get('/adminPanel', (request, response) => {
    response.set('Content-Type', 'text/html;charset=utf-8');
    fs.readFile(absolutePath + "/htdocs-80xx/8030-adminPanel/adminPanel.html", function(err, content){
        response.send(content);
    });
    console.log(`${getTimeStamp()} "/adminPanel" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m with "GET" @ adminPanelServer`)
});