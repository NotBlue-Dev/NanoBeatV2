const arp = require('arp')

const find = require('local-devices');

class IpFinder {

    findIp(valid) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('timeout')
            }, 10000)
            
            let list = []

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