const { ipcRenderer } = require('electron');

let auth = []
let current = []
let count = 0

window.addEventListener('DOMContentLoaded', () => {
    const bsIndic = document.getElementById('indic')
    const txtPop = document.getElementById('txtPop')

    document.getElementById("close").addEventListener("click", function (e) {
        ipcRenderer.send('close')
    }); 

    document.getElementById("refresh").addEventListener("click", ipcRenderer.send('find-ip'));

    ipcRenderer.on('bs-connected', (event, arg) => {
        bsIndic.classList.add('green')
        bsIndic.classList.remove('red')
    });

    ipcRenderer.on('bs-disconnected', (event, arg) => {
        bsIndic.classList.add('red')
        bsIndic.classList.remove('green')
    });

    ipcRenderer.on('nano-avalaible', (event, arg) => {
        clear()
        arg.forEach(element => {
            let authbool = false
            let state = false

            if(current.includes(element)) {
                state = true
            }
            if(auth.includes(element)) {
                authbool = true
            }
            createPanels(element,state,authbool)
        })
    });

    ipcRenderer.on('data-updated', (event, arg) => {
        clear()
        arg.config.forEach(panel => {  
            
            if(panel.status) {
                current.push(panel.ip)
            }
            if(panel.auth) {
                auth.push(panel.ip)
            }
            createPanels(panel.ip,panel.status,panel.auth)
        });
    });

    ipcRenderer.on('auth-succed', (event, arg) => {
        console.log('auth succed')
        showback(true)
        txtPop.innerHTML = "Auth Succed, Now you can use this panel with nanobeat"
    });


    ipcRenderer.on('auth-failed', (event, arg) => {
        console.log('auth failed')
        showback(false)
        txtPop.innerHTML = "Auth Failed, make sure your panel was in auth mode !"
    });

    // first run 
    ipcRenderer.on('ready', () => {
        ipcRenderer.send('get-data');
    })

    // reload/switch
    ipcRenderer.send('get-data');
});

function showback(reload) {
    const container = document.getElementById('cont')
    const pop = document.getElementById('pop')
    const cont = document.getElementById('hover')
    setTimeout(() => {
        cont.classList.remove('cover')
        container.classList.remove('opac')
        pop.classList.add('hide')
        if(reload) {
            ipcRenderer.send('get-data')
        }
    }, 4000);
}

function clear() {
    count = 0
    const pContain = document.getElementById("pContain")
    while (pContain.firstChild) {
        pContain.removeChild(pContain.lastChild);
    }
}

function createPanels(ip,states,auth) {
    count += 1
    let divMain = document.getElementById("pContain")

    let hr = document.createElement('hr');
    divMain.appendChild(hr)

    let divPanel = document.createElement('div');
    divPanel.classList.add('panel')
    
    let img = document.createElement('img');
    img.src = "../img/panels.png"
    img.onclick = function() {
        authRender(ip)
    }
    divPanel.appendChild(img)

    let infoTXT = document.createElement('div');
    infoTXT.onclick = function() {
        authRender(ip)
    }
    infoTXT.classList.add('infoTXT')
    let semi = document.createElement('a');
    semi.classList.add('semibold')
    textName = document.createTextNode("Lights Panels"); 
    semi.appendChild(textName);
    let ipTxt = document.createElement('a');
    ipTxt.classList.add('ip')
    ipName = document.createTextNode(ip); 
    ipTxt.appendChild(ipName);
    
    infoTXT.appendChild(semi)
    infoTXT.appendChild(ipTxt)
    divPanel.appendChild(infoTXT)

    let div = document.createElement('div');
    div.onclick = function() {
        authRender(ip)
    }
    let state = document.createElement('span');
    state.classList.add('dot')
    auth ? state.classList.add('green') : state.classList.add('red')
    
    let stateTxt = document.createElement('a');
    stateTxt.classList.add('state')
    StateName = document.createTextNode(auth ? 'Connected' : 'Disconnected'); 
    stateTxt.appendChild(StateName);
    div.appendChild(state)
    div.appendChild(stateTxt)
    divPanel.appendChild(div)

    let label = document.createElement('label');
    label.classList.add('switch')
    let input = document.createElement('input');
    input.setAttribute("type", "checkbox");
    input.checked = states
    input.onclick = () => {
        ipcRenderer.send('change-panel-status',[ip,input.checked]);
    }
    let span = document.createElement('span');
    span.classList.add('slider')
    span.classList.add('round')
    label.appendChild(input)
    label.appendChild(span)
    divPanel.appendChild(label)
    let counter = document.getElementById('count')
    counter.innerHTML = `You have ${count} devices !`;
    divMain.appendChild(divPanel)
}

function authRender(ip) {
    const container = document.getElementById('cont')
    const pop = document.getElementById('pop')
    const cont = document.getElementById('hover')
    ipcRenderer.send('auth', ip);
    cont.classList.add('cover')
    container.classList.add('opac')
    pop.classList.remove('hide')
}

    // ipcRenderer.on('game-ip-defined', (event, arg) => {
    //     console.log(arg)
    // });

// });