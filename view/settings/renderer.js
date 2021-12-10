const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("close").addEventListener("click", function (e) {
        ipcRenderer.send('close')
    }); 
});
