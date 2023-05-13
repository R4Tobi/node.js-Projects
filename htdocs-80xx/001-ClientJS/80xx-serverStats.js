function login(){
    var xhr = new XMLHttpRequest();
    var stayLoggedIn = document.getElementById('stayLoggedIn').checked;
    xhr.open("POST", `${getRestUrl()}/login`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(`{
        "username": "${document.getElementById('username').value}",
        "password": "${document.getElementById('password').value}",
        "from": "statusPage"
    }`)
    xhr.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            if (stayLoggedIn == false){
                sessionStorage.setItem("statusPage", true)
                window.open("/statusPage_user", "_self")
            } else if(stayLoggedIn == true){
                setCookie("user", true)
                window.open("/statusPage", "_self")
            } 
        }
        if (this.readyState == 4 && this.status == 403) {
            document.getElementById("content").innerHTML = `
            <div class="form">
                <h3>Error 403</h3>
                <p>Keine Berechtigungen. Wahrscheinlich wurde ein falscher Benutzername oder ein falsches Passwort angegeben</p>
                <input type="button" value="Zurück" onclick="window.location.reload();">
            </div>
            `
        }
    }
}

function logout(){
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    window.open("/", "_self")
}

function getSysInfo(){
    var auth;
    if(sessionStorage.getItem("auth")){
        auth = sessionStorage.getItem("auth")
    }else if (getCookie("auth")){
        auth = getCookie("auth")
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", getRestUrl() + "/getData", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(`{
        "auth": "${auth}"
    }`)
    xhr.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(xhr.response);

            document.getElementById("content").innerHTML = `
                <span>CPU-Temp: ${result.CPU_TEMP}</span>
                <span>CPU-Last: ${result.CPU_USAGE}</span>
                <span>CPU-Freq: ${result.CPU_FREQ}</span>
                <span>RAM-Last: ${result.RAM_USAGE}</span>
                <a href="http://${window.location.hostname}:80/">Zurück zum Linktree</a>
            `;
        }
    }
}