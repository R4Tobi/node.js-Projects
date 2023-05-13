const fs = require('fs');
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const absolutePath = path.join(__dirname, '..');
const port = 8010;

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

//public folder
app.use("/data", express.static(absolutePath + "/htdocs-80xx/"));

app.listen(port, () => {
    console.log(`${getTimeStamp()} \x1b[0;36mlistening to port: ${port} @ ServerStatusPage\x1b[0;37m`)
});

app.get('/', (request, response) => {
    response.set('Content-Type', 'text/html;charset=utf-8');
    response.set('Access-Control-Allow-Origin', '*');
    fs.readFile(absolutePath + "/htdocs-80xx/8010-serverStatusPage/index.html", function(err, content){
        response.send(content);
    });
    console.log(`${getTimeStamp()} "/" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m with "GET" @ ServerStatusPage`)
});

app.get('/statusPage', (request, response) => {
    response.set('Content-Type', 'text/html;charset=utf-8');
    response.set('Access-Control-Allow-Origin', '*');
    fs.readFile(absolutePath + "/htdocs-80xx/8010-serverStatusPage/serverStatus.html", function(err, content){
        response.send(content);
    });
    console.log(`${getTimeStamp()} "/statusPage" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m with "GET" @ ServerStatusPage`)
});