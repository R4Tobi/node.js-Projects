function ToDoLogin(){
    var stayLoggedIn = document.getElementById("stayLoggedIn").checked;
    xhr = new XMLHttpRequest();
    xhr.open("POST", `${getRestUrl()}/login`, true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    request = `{
        "from" : "ToDoLogin",
        "username" : "${document.getElementById("user").value}",
        "password" : "${document.getElementById("password").value}"
    }`
    xhr.send(request);
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(this.response)
            if(stayLoggedIn == true){
                setCookie("user", result.user, 2);
                setCookie("role", result.role, 2);
                setCookie("sub", result.sub, 2);
                setCookie("auth", result.auth, 2)
                setCookie("email", result.email)
                window.open("/ToDo", "_self");
            } else if(stayLoggedIn == false){
                sessionStorage.setItem("user", result.user, 2);
                sessionStorage.setItem("role", result.role, 2);
                sessionStorage.setItem("sub", result.sub, 2);
                sessionStorage.setItem("auth", result.auth, 2);
                sessionStorage.setItem("email", result.email)
                window.open("/ToDo", "_self");
            }
        }
        if (this.readyState == 4 && this.status == 403) {
            document.getElementById("login").innerHTML = `
            <div class="form">
                <h3>Error 403</h3>
                <p>Keine Berechtigungen. Wahrscheinlich wurde ein falscher Benutzername oder ein falsches Passwort angegeben</p>
                <input type="button" value="Zurück" onclick="window.location.reload();">
            </div>
            `
        }
    };
}

function getUsers(){
    var taskUserField = document.getElementById("taskUser");
    var userCookie;
    if(sessionStorage.getItem("sub")){
        userCookie = sessionStorage.getItem("sub")
    } else if (getCookie("sub")){
        userCookie = getCookie("sub")
    }
    users = userCookie.split(",")

    for(index = 0; index < users.length; index++){
        userOption = users[index];
        taskUserField.innerHTML += `
            <option value="${userOption}">${userOption}</option>
        `
    }

}

function addToDo(fromForm, elem){
    var auth;
    if(sessionStorage.getItem("auth")){
        auth = sessionStorage.getItem("auth")
    }else if (getCookie("auth")){
        auth = getCookie("auth")
    }
    var user;
    if(sessionStorage.getItem("user")){
        user = sessionStorage.getItem("user")
    }else if (getCookie("user")){
        user = getCookie("user")
    }
    var email;
    if(sessionStorage.getItem("email")){
        email = sessionStorage.getItem("email")
    }else if (getCookie("email")){
        email = getCookie("email")
    }
    if(fromForm === false){
        var requestData = {
            "TASK_NAME" : document.getElementById("taskName").value,
            "TASK_DATE" : document.getElementById("taskDate").value,
            "TASK_DESC" : document.getElementById("taskDesc").value,
            "USER" : document.getElementById("taskUser").value,
            "TASK_SUP" : user,
            "auth" : auth,
            "email" : email
        }
        xhr = new XMLHttpRequest();
        xhr.open("POST", `${getRestUrl()}/addToDo`, true);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(requestData));

        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                openResponseField(this.response);
            }
        };
    }
    if(fromForm === true){
        user = elem.children[4].textContent.replace("Bearbeiter: ", "")
        desc = elem.children[3].textContent.replace("Beschreibung: ", "");
        date = elem.children[2].textContent.replace("Datum: ", "");

        var parent = elem.parentElement;
        name = parent.children[0].textContent;

        var taskSup;
        if(sessionStorage.getItem("user")){
            taskSup = sessionStorage.getItem("user")
        } else if (getCookie("user")){
            taskSup = getCookie("user")
        }

        var requestData = {
            "TASK_NAME" : name,
            "TASK_DATE" : date,
            "TASK_DESC" : desc,
            "USER" : user,
            "TASK_SUP" : taskSup,
            "auth" : auth
        }
        xhr = new XMLHttpRequest();
        xhr.open("POST", `${getRestUrl()}/addToDo`, true);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(requestData));

        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                openResponseField(this.response);
            }
        };
    }
}

function getToDo(user, role){
    var auth;
    if(sessionStorage.getItem("auth")){
        auth = sessionStorage.getItem("auth")
    }else if (getCookie("auth")){
        auth = getCookie("auth")
    }
    document.getElementById("personnel").innerHTML = `
        Hallo <span id="taskSup">${user}</span><br>
        Deine Rolle(n): ${role}
    `;
    if(role.includes("TaskCreator")){
        document.getElementById("requestToDo").style.display = "block";
        var requestField = document.getElementById("requestToDo");
        requestField.innerHTML = "<input type='button' value='Neues ToDo erstellen' onclick='toggleToDoForm()'>";
    }
    xhr = new XMLHttpRequest();
    xhr.open("POST", `${getRestUrl()}/getToDo`, true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(`{
        "user" : "${user}",
        "auth": "${auth}"
    }`)
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            selfTaskField = document.getElementById("tasks");
            otherTaskField = document.getElementById("otherTasks");
            finishedTaskField = document.getElementById("finishedTasks");

            var result = JSON.parse(this.response);

            for(index = 0; index < result.self.length; index++){
                task = JSON.parse(result.self[index]);
                selfTaskField.innerHTML += `
                    <div class="task">
                        <h3>${task.TASK_NAME}</h3>
                        <div class="content">
                            <span><input type="checkbox" onclick="remToDo(this.parentElement)" name="erledigt">Erledigt</span>
                            <span class="meta">Datum: ${task.TASK_DATE}</span>
                            <span class="meta">Beschreibung: ${task.TASK_DESC}</span>
                            <span class="meta">ToDo-Ersteller: ${task.TASK_SUP}</span>
                            <span class="meta" id="${task.TASK_ID}">ToDo-ID: ${task.TASK_ID}</span>
                        </div>
                    </div>
                `
            }
            if(result.other.length != 0){
                otherTaskField.innerHTML += "<h3>Erstellte ToDo's</h3>";
            }
            for(jndex = 0; jndex < result.other.length; jndex++){
                task = JSON.parse(result.other[jndex]);
                otherTaskField.innerHTML += `
                    <div class="task">
                        <h3>${task.TASK_NAME}</h3>
                        <div class="content">
                        <span class="meta">Datum: ${task.TASK_DATE}</span>
                        <span class="meta">Beschreibung: ${task.TASK_DESC}</span>
                        <span class="meta">Bearbeiter: ${task.USER}</span>
                        <span class="meta" id="${task.TASK_ID}">ToDo-ID: ${task.TASK_ID}</span>
                        </div>
                    </div>
                `
            }
            if(result.finished.length != 0){
                finishedTaskField.innerHTML += "<h3>Zu überprüfende ToDo's</h3>";
            }
            for(kndex = 0; kndex < result.finished.length; kndex++){
                task = JSON.parse(result.finished[kndex]);
                finishedTaskField.innerHTML += `
                    <div class="task finished">
                        <h3>${task.TASK_NAME}</h3>
                        <div class="content">
                            <input type="button" onclick="remToDo(this)" value="Erledigt" class="meta-btn">
                            <input type="button" onclick="addToDo(true, this.parentElement); remToDo(this)" value="nicht Erledigt" class="meta-btn">
                            <span class="meta">Datum: ${task.TASK_DATE}</span>
                            <span class="meta">Beschreibung: ${task.TASK_DESC}</span>
                            <span class="meta">Bearbeiter: ${task.USER}</span>
                            <span class="meta" id="${task.TASK_ID}">ToDo-ID: ${task.TASK_ID}</span>
                        </content>
                    </div>
                `
            }
        }
    };
}

function toggleToDoForm (){
    var toDoForm = document.getElementById("toDoForm");
    if(toDoForm.style.display == "none"){
        toDoForm.style.display = "flex";
    }else if(toDoForm.style.display == "flex"){
        toDoForm.style.display = "none";
    }
}

function remToDo(elem){
    var auth;
    if(sessionStorage.getItem("auth")){
        auth = sessionStorage.getItem("auth")
    }else if (getCookie("auth")){
        auth = getCookie("auth")
    }
    var checkBox = elem
    var div = elem.parentElement;
    var id = div.lastElementChild.id;
    div.parentElement.style.display = "none";

    xhr = new XMLHttpRequest();
    xhr.open("POST", `${getRestUrl()}/remToDo`, true);
    xhr.setRequestHeader('Content-Type', 'application/json')

    if(div.parentElement.className.includes("finished")){
        xhr.send(
            JSON.stringify({
                TASK_ID : id,
                finished : true,
                auth: auth
            })
        )
    }else{
        xhr.send(
            JSON.stringify({
                TASK_ID : id,
                finished : false,
                auth: auth
            })
        )
    }
}

function openResponseField(response){
    var responseField = document.getElementById("response");
    responseField.style.display = "block";
    responseField.innerHTML = `
        <h3>Anfrage gesendet</h3>
        <p>Das ToDo wurde an den angegebenen Bearbeiter gesendet</p>
        <input type="button" onclick="window.open('/ToDo', '_self');" value="Okay">
    `
}

function logout(){
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    window.open("/", "_self")
}