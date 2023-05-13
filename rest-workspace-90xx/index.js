const fs = require('fs');
const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const { exec } = require('child_process');

//SQL Connection
const connection = mysql.createConnection({
	host     : '127.0.0.1',
	user     : 'root',
	password : '#35bT-015',
	database : 'nodelogin',
    port: '7000'
});

const app = express();
const absolutePath = path.join(__dirname, '..');
const port = 9000;

//public folder
app.use("/data", express.static(absolutePath + "/htdocs-80xx/"));

//JSON
app.use(express.json())

//CORS
app.use(cors({
    origin: "*",
    methods: "POST"
}))

//Start server
app.listen(port, () => {
    console.log(`${getTimeStamp()} \x1b[0;36mlistening to port: ${port} @ RESTServer\x1b[0;37m`)
});

/*
*  ----------------------------------------------------------
*                    Global used functions
*  ----------------------------------------------------------
*/

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

/* 
*  ----------------------------------------------------------
*                  CORE LOGIN/AUTH FUNCTIONS
*  ----------------------------------------------------------
*/
async function login(username, password, request, response){
    if (username && password) {
        //Base64 String of username:password
        let data = `${username}:${password}`;
        let buff = new Buffer.from(data, "ascii")
        let auth = buff.toString("base64");

        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) console.log(error);
            // If the account exists
            var is = false;
            if (results.length > 0) {
                response.set('Content-Type', 'application/json;charset=utf-8');
                response.send(`{
                    "user": "${username}",
                    "role": "${results[0].role}",
                    "sub" : "${results[0].sub}",
                    "auth": "${auth}",
                    "email": "${results[0].email}"
                }`);
                is = true;
            } else {
                response.set('Content-Type', 'text/html;charset=utf-8');
                console.log(`${getTimeStamp()} \x1b[0;31m"/login" Blocked request from \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;31m Send Status 403 @ RESTServer\x1b[0;37m`)
                response.status(403).send("Forbidden");
            }			
            response.end();
        });
    } else {
        response.set('Content-Type', 'text/html;charset=utf-8');
        response.status(403).send("Forbidden");
        console.log(`${getTimeStamp()} \x1b[0;31m"/login" Blocked request from \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "").replace("::ffff:", "")}\x1b[0;31m Send Status 403 @ RESTServer\x1b[0;37m`)
        response.end();
    }
}

async function checkAuth(auth, roleNeeded, callback){
    let buff = new Buffer.from(auth, 'base64');
    let textRAW = buff.toString('ascii');
    text = textRAW.split(":")
    let username = text[0];
    let password = text[1];

    connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (error) console.log(error);

        if(results.length > 0 && (results[0].role).includes(roleNeeded) || results.length > 0 && (results[0].role).includes("admin")){
            return callback(true, username);
        }else{
            return callback(false, username);
        }
    });
}

/* 
*  ----------------------------------------------------------
*                      EMAIL FUNCTION
*  ----------------------------------------------------------
*/
async function sendmail(htmlContent, subject, address) {
    // create reusable transporter object using the default SMTP transport
    try {
        let transporter = nodemailer.createTransport({
            host: "localhost",
            port: 6000,
            secure: false, // true for 6000, false for other ports
            auth: {
                user: "node@localhost",
                pass: "1105",
            },
        });

        // send mail with defined transport object
        await transporter.sendMail({
            from: '"node-serv-01" "<noreply@node-serv-01>"', // sender address
            to: address, // list of receivers
            subject: subject, // Subject line
            html: htmlContent, // html body
        });
    } catch (error) { console.log(`${getTimeStamp()} : \x1b[0;31mERROR @ RESTServer\n ${error}\x1b[0;37m`) }
}
/* 
*  ----------------------------------------------------------
*                            DOCS
*  ----------------------------------------------------------
*/
app.get("/", (request, response) => {
    response.send("Cannot GET /");
})

app.get("/docs", (request, response) => {
    var filecontent = fs.readFileSync(absolutePath + "/htdocs-90xx/docs/index.html")
    response.send(filecontent);
})

/* 
*  ----------------------------------------------------------
*                        SYSTEM STATS
*  ----------------------------------------------------------
*/
app.post("/getData", async (request, response) => {
    var auth = request.body.auth;
    checkAuth(auth, "status", (bool, user) => {
        console.log(`${getTimeStamp()} "/getData" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m by \x1b[0;33m${user}\x1b[0;37m with "POST" @ RESTServer`)
        if(bool == true){
            response.set('Access-Control-Allow-Origin', '*');
            var filecontent = fs.readFileSync(absolutePath + "/python/data/systemStats.json")
            response.send(filecontent);
        }else{
            response.status(403).send("Forbidden");
            console.log(`${getTimeStamp()} \x1b[0;31m"/getData" Blocked request from \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;31m by \x1b[0;33m${user}\x1b[0;31m Send Status 403 @ RESTServer\x1b[0;37m`) 
        }
    })
})

/* 
*  ----------------------------------------------------------
*                           LOGIN
*  ----------------------------------------------------------
*/
app.post("/login", async (request, response) => {
    console.log(`${getTimeStamp()} "/login" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m with "POST" @ RESTServer`)
    let username = request.body.username;
    let password = request.body.password;
    await login(username, password, request, response)
})

/* 
*  ----------------------------------------------------------
*                           TODO
*  ----------------------------------------------------------
*/
app.post('/getToDo', function(request, response){
    var user = request.body.user;
    var auth = request.body.auth;
    checkAuth(auth, "TaskReader", (bool, user) => {
        console.log(`${getTimeStamp()} "/getToDo" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m by \x1b[0;33m${user}\x1b[0;37m with "POST" @ RESTServer`)
        if(bool == true){
            var todos = fs.readFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/todos.json");
            var finishedToDos = fs.readFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/finishedToDos.json");

            var todoObj = JSON.parse(todos);
            var finishedToDoObj = JSON.parse(finishedToDos);
            var tasks = {
                "self" : [],
                "other" : [],
                "finished": []
            };
            var index;
            for(index = 0; index < todoObj.taskData.length; index++){
                if (todoObj.taskData[index].USER == user){
                    tasks.self.push(JSON.stringify(todoObj.taskData[index]))
                }
                if (todoObj.taskData[index].TASK_SUP == user){
                    tasks.other.push(JSON.stringify(todoObj.taskData[index]))
                }
            }    
            for(jndex = 0; jndex < finishedToDoObj.taskData.length; jndex++){
                if (finishedToDoObj.taskData[jndex].TASK_SUP == user){
                    tasks.finished.push(JSON.stringify(finishedToDoObj.taskData[jndex]))
                }
            }
            response.set('Content-Type', 'application/json;charset=utf-8');
            response.send(tasks);
        }else{
            response.status(403).send("Forbidden");
            console.log(`${getTimeStamp()} \x1b[0;31m"/getToDo" Blocked request from \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;31m by \x1b[0;33m${user}\x1b[0;31m Send Status 403 @ RESTServer\x1b[0;37m`)
        }
    })
});

app.post('/addToDo', function(request, response){
    var auth = request.body.auth;
    checkAuth(auth, "TaskCreator", (bool, user) => {
        console.log(`${getTimeStamp()} "/addToDo" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m by \x1b[0;33m${user}\x1b[0;37m with "POST" @ RESTServer`)
        if(bool == true){
            taskDataFromRequest = request.body;
            if(taskDataFromRequest.TASK_NAME == "" || taskDataFromRequest.TASK_NAME == undefined || taskDataFromRequest.TASK_USER == "" || taskDataFromRequest.TASK_USER){
                response.status(400).send("Bad Request")
                console.log(`${getTimeStamp()} \x1b[0;31m"/addToDo" Blocked request from \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;31m by \x1b[0;33m${user}\x1b[0;31m Send Status 400 @ RESTServer\x1b[0;37m`)
                return;
            }
            var todosRAW = fs.readFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/todos.json");
            var todos = JSON.parse(todosRAW.toString());
            var lastID = parseInt(todos.taskData[todos.taskData.length - 1].TASK_ID, 10);
            var newID = lastID + 1;
            message = JSON.stringify(taskDataFromRequest)
            sendmail(message, "Neues ToDo", request.body.email)
            taskDataFromRequest.TASK_ID = newID.toString();
            todos.taskData.push(taskDataFromRequest);
            fs.writeFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/todos.json", JSON.stringify(todos));
            response.set('Content-Type', 'text/plain;charset=utf-8');
            response.send("Success");
        }else{
            response.status(403).send("Forbidden");
            console.log(`${getTimeStamp()} \x1b[0;31m"/addToDo" Blocked request from \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;31m by \x1b[0;33m${user}\x1b[0;31m Send Status 403 @ RESTServer\x1b[0;37m`)
        }
    })
});

app.post('/remToDo', function(request, response){
    var auth = request.body.auth;
    checkAuth(auth, "TaskReader", (bool, user) => {
        console.log(`${getTimeStamp()} "/remToDo" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m by \x1b[0;33m${user}\x1b[0;37m with "POST" @ RESTServer`)
        if(bool == true){
            taskId = request.body.TASK_ID;
            finished = request.body.finished;
            if(finished == false){
                var todosRAW = fs.readFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/todos.json");
                var finishedToDosRAW = fs.readFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/finishedToDos.json");
                var todos = JSON.parse(todosRAW.toString());
                var finishedToDos = JSON.parse(finishedToDosRAW.toString());
                for(index = 0; index < todos.taskData.length; index++){
                    if(todos.taskData[index].TASK_ID == taskId){
                        finishedToDos.taskData.push(todos.taskData[index]);
                        todos.taskData.splice(index, 1);
                    }
                }
                fs.writeFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/todos.json", JSON.stringify(todos));
                fs.writeFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/finishedToDos.json", JSON.stringify(finishedToDos));
                response.set('Content-Type', 'text/plain;charset=utf-8');
                response.send("Success");
            }
            if(finished == true){
                var finishedToDosRAW = fs.readFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/finishedToDos.json");
                var todos = JSON.parse(finishedToDosRAW.toString());
                for(index = 0; index < todos.taskData.length; index++){
                    if(todos.taskData[index].TASK_ID == taskId){
                        todos.taskData.splice(index, 1);
                    }
                }
                fs.writeFileSync(absolutePath + "/rest-workspace-90xx/ToDo-Data/finishedToDos.json", JSON.stringify(todos));
                response.set('Content-Type', 'text/plain;charset=utf-8');
                response.send("Success");
            }
        }else{
            response.status(403).send("Forbidden");
            console.log(`${getTimeStamp()} \x1b[0;31m"/remToDo" Blocked request from \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;31m by \x1b[0;33m${user}\x1b[0;31m Send Status 403 @ RESTServer\x1b[0;37m`)
        }
    });    
});

/* 
*  ----------------------------------------------------------
*                        ADMIN PANEL
*  ----------------------------------------------------------
*/

app.post("/adminPanel", (request, response) => {
    action = request.body.method
    var auth = request.body.auth;
    checkAuth(auth, "admin", (bool, user) => {
        console.log(`${getTimeStamp()} "/adminPanel, ${action}" requested by \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;37m by \x1b[0;33m${user}\x1b[0;37m with "POST" @ RESTServer`)
        if(bool){
            if(action == "restart"){
                console.log(`\x1b[0;33mRestart requested by \x1b[0;33m${user}\x1b[0;37m`);
                response.send("restarting...")
                exec('sudo sh /home/pi/nodeJS/node-restart.sh',
                (error, stdout, stderr) => {
                    console.log(stdout);
                    console.log(stderr);
                    if (error !== null) {
                        console.log(`exec error: ${error} @ RESTServer`);
                    }
                });
            } else if(action == "reboot"){
                console.log(`\x1b[0;33mRestart requested by \x1b[0;33m${user}\x1b[0;37m`);
                response.send("rebooting...")
                exec('sudo reboot',
                (error, stdout, stderr) => {
                    console.log(stdout);
                    console.log(stderr);
                    if (error !== null) {
                        console.log(`exec error: ${error} @ RESTServer`);
                    }
                });
            }
        }else{
            response.status(403).send("Forbidden");
            console.log(`${getTimeStamp()} \x1b[0;31m"/adminPanel, ${action}" Blocked request from \x1b[0;33m${request.socket.remoteAddress.replace("::ffff:", "")}\x1b[0;31m by \x1b[0;33m${user}\x1b[0;31m Send Status 403 @ RESTServer\x1b[0;37m`)
        }
    })
});