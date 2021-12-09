const { remote, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("close").addEventListener("click", function (e) {
        remote.getCurrentWindow().close()
    }); 
});
