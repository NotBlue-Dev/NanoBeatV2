const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const bsIndic = document.getElementById('indic')

    document.getElementById("close").addEventListener("click", function (e) {
        ipcRenderer.send('close')
    }); 

    ipcRenderer.on('bs-connected', (event, arg) => {
        bsIndic.classList.add('green')
        bsIndic.classList.remove('red')
    });

    ipcRenderer.on('bs-disconnected', (event, arg) => {
        bsIndic.classList.add('red')
        bsIndic.classList.remove('green')
    });

    ipcRenderer.on('dataSettings-updated', (event,arg) => {
        showSettings(arg)
    })
    
    ipcRenderer.send('get-settings');
});

function reset() {
    ipcRenderer.send('default-settings')
    location.reload();
    return false;
}

function clear() {
    count = 0
    const pContain = document.getElementById("settings")
    while (pContain.firstChild) {
        pContain.removeChild(pContain.lastChild);
    }
}

function showSettings(obj) {
    let main = document.getElementById('settings')

    obj.info.forEach(element => {

        let titleSettings = document.createElement('div');
        titleSettings.classList.add('titleSettings')
        
        let semibold = document.createElement('a');
        semibold.classList.add('semibold')
        semiboldTxt = document.createTextNode(element.name); 
        semibold.appendChild(semiboldTxt);
        
        let infoset = document.createElement('a');
        infoset.classList.add('infoset')
        infosetTXT = document.createTextNode(element.main); 
        infoset.appendChild(infosetTXT);

        titleSettings.appendChild(semibold)
        titleSettings.appendChild(infoset)
        
        main.appendChild(titleSettings)

        for (const [key, value] of Object.entries(element)) {
            let itemSettings = document.createElement('div');
            itemSettings.classList.add('itemSettings')
           
            if(key !== "name" && key !== "main") {
                let val = false
                let cat
                if(obj.rest.type[key] !== undefined) {
                    val = obj.rest.type[key]
                    cat = "type"
                }
                if(obj.rest.value[key] !== undefined) {
                    val = obj.rest.value[key]
                    cat = "value"
                }

                let nameEff = document.createElement('a');
                nameEffTxt = document.createTextNode(key); 
                nameEff.appendChild(nameEffTxt);
                
                let infoVal = document.createElement('a');
                infoTxtVal = document.createTextNode(value); 
                infoVal.appendChild(infoTxtVal);
        
                itemSettings.appendChild(nameEff)
                itemSettings.appendChild(infoVal)

                let label = document.createElement('label');
                label.classList.add('switch')
                label.classList.add('spaceR')
                let input = document.createElement('input');
                input.setAttribute("type", "checkbox");
                input.checked = val
                input.onclick = () => {
                    ipcRenderer.send('change-setting',{
                        effect: key,
                        category:cat,
                        state:input.checked,
                    })
                    ipcRenderer.send('save-config');
                }
                let span = document.createElement('span');
                span.classList.add('slider')
                span.classList.add('round')
                label.appendChild(input)
                label.appendChild(span)
                itemSettings.appendChild(label)
                let hritem = document.createElement('hr');
                main.appendChild(hritem)
                main.appendChild(itemSettings)
                
            }

        }
    });
}
