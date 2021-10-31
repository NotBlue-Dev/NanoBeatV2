const { remote, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {

    document.getElementById("find").addEventListener("click", find);

    function find(){
        ipcRenderer.send('find-ip');
    }

    let div = document.getElementById("nano")
    
    ipcRenderer.on('nano-avalaible', (event, arg) => {
        arg.forEach(element => {
            let a = document.createElement("a");
            a.onclick = function() {
                ipcRenderer.send('auth', element);
            }
            a.innerText = element
            div.appendChild(a)
        });
    });

    ipcRenderer.on('auth-succed', (event, arg) => {
        console.log(arg)
    });

    ipcRenderer.on('auth-failed', (event, arg) => {
        console.log('auth failed')
    });



});