function login(){
    var xhr = new XMLHttpRequest();
    var stayLoggedIn = document.getElementById('stayLoggedIn').checked;
    xhr.open("POST", `${getRestUrl()}/login`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(`{
        "username": "${document.getElementById('username').value}",
        "password": "${document.getElementById('password').value}",
        "from": "adminPanel"
    }`)
    xhr.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(this.response)
            if (stayLoggedIn == false){
                sessionStorage.setItem("user", result.user)
                sessionStorage.setItem("auth", result.auth)
                window.open("/adminPanel", "_self")
            } else if(stayLoggedIn == true){
                setCookie("user", result.user)
                setCookie("auth", result.auth)
                setCookie("role", result.role)
                setCookie("sub", result.sub)
                setCookie("email", result.email)
                window.open("/adminPanel", "_self")
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

            parent = document.getElementById("content");
            var progressCPU = parent.children[1];
            var progressRAM = parent.children[3];
            progressCPU.value = result.CPU_USAGE.replace("%", "");
            progressRAM.value = result.RAM_USAGE.replace("%", "");
        }
    }
}

function restart(){
    var auth;
    if(sessionStorage.getItem("auth")){
        auth = sessionStorage.getItem("auth")
    }else if (getCookie("auth")){
        auth = getCookie("auth")
    }
    var conti = confirm("node-Services neu starten! \n Möchten sie Fortfahren?");
    if(conti){
        var xhr = new XMLHttpRequest();
            xhr.open("POST", `${getRestUrl()}/adminPanel`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(`{
                "method" : "restart",
                "auth"   : "${auth}"
            }`)
            xhr.onreadystatechange = function(){}
    }
}

function reboot(){
    var auth;
    if(sessionStorage.getItem("auth")){
        auth = sessionStorage.getItem("auth")
    }else if (getCookie("auth")){
        auth = getCookie("auth")
    }
    var conti = confirm("Neustarten kann bis zu eine Minute dauern! \n Möchten sie Fortfahren?");
    if(conti){
        var xhr = new XMLHttpRequest();
            xhr.open("POST", `${getRestUrl()}/adminPanel`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(`{
                "method" : "reboot",
                "auth"   : "${auth}"
            }`)
            xhr.onreadystatechange = function(){}
    }
}