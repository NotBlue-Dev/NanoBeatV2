// import
const find = require('local-devices');

/*
###############################
IpFinder class:
 -find nanoleaf ip
 -check if ip is valid
###############################
*/

class IpFinder {

    // create promise wich is resolved if ip is found
    findIp(valid) {
        return new Promise((resolve, reject) => {
            // reject if timeout
            setTimeout(() => {
                reject('timeout')
            }, 10000)
            
            let list = []

            // get all the potential ip and valide them
            find().then(devices => {
                devices.forEach(data => {
                    this.validate(data.ip, valid).then(() => {
                        list.push(data.ip)
                    }).catch(() => {})
                });
                resolve(list)
            })                   
        })
    }
    
    // compare potential ip to the ip found by bonjour protocol in nanoManager
    validate(ip, valid) {
        return new Promise((resolve, reject) => {
            if(valid.includes(ip)) {
                resolve()
            } else {
                reject()
            }
        })
    }
}

module.exports = IpFinder