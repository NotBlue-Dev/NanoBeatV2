const api = require('./api')
const bonjour = require('bonjour')()
let browser = bonjour.find({ protocol: 'tcp' })
const axios = require('axios').default;
const request = require('request');

let ips = []

browser.on('up', function (s) {
    if (s.type == 'nanoleafapi' && !ips.includes(s.addresses[0])) {
        ips.push(s.addresses[0])
    }
})

class nanoManager {
    constructor(IpFinder, configLoader, beatsaberAdaptater, sendEvent, listenEvent) {
        this.sendEvent = sendEvent
        this.beatsaberAdaptater = beatsaberAdaptater
        this.listenEvent = listenEvent
        this.ipFinder = IpFinder
        this.configLoader = configLoader
        this.nanoIpState = false
        this.nanoTokenState = false
        this.ipList = ips
        this.api = new api(this.beatsaberAdaptater, this.configLoader.load())
        this.initializeListeners()
    }

    initializeListeners() {
        this.listenEvent('find-ip', this.findIp.bind(this))
        this.listenEvent('define-ip', this.defineNanoIp.bind(this))
        this.listenEvent('save-config', this.save.bind(this))
        this.listenEvent('change-setting', this.updateSetting.bind(this))
        this.listenEvent('default-settings', this.setDefaultSettings.bind(this))
        this.listenEvent('auth', this.auth.bind(this))
        this.listenEvent('set-mode', this.setMode.bind(this))
    }

    start() {
        this.beatsaberAdaptater
        
        .onConnected(() => {
            if(this.hapticsConnectionState !== true) {
                this.bsConnectionState = true
                this.sendEvent('bs-connected', {})
            }
        })  

        .onDisconnected(() => {
            if(this.hapticsConnectionState !== false) {
                this.bsConnectionState = false
                this.sendEvent('bs-disconnected', {})
            }
        })
        
        .connect()

        for(let i = 0; i<this.api.config.devices.length ; i++) {
            if (this.api.config.devices[i].auth === true && this.api.config.devices[i].token !== null  && this.api.config.devices[i].status !== false)  {
                this.defineNanoIp(this.api.config.devices[i])
            }
        }
    }

    setMode(arg) {
        this.api.mode = arg
    }

    isReady() {
        return this.nanoIpState
    }

    auth(ip) {
        this.nanoTokenState = false
        let event = this.sendEvent
        let token = null 

        let requestTokenOptions = {
            method: 'POST',
            url: `http://${ip}:16021/api/v1/new`,
        };

        let Oauth = new Promise((resolve, reject) => {
            request(requestTokenOptions, function(error,response,body) {
                try {
                    let tokens = JSON.parse(response.body).auth_token;
                    event('auth-succed', token)
                    token = tokens
                    this.nanoTokenState = true
                    resolve()
                } catch {
                    event('auth-failed')
                    reject()
                }
            })
        })

        Oauth.then(() => {
            let index = this.api.config.devices.findIndex(x => x.ip === ip) 
            this.api.config.devices[index].ip = ip
            this.api.config.devices[index].token = token
            this.api.config.devices[index].status = true
            this.api.config.devices[index].auth = true
            this.save()
            this.api.setNanoIp(ip, token, this.sendEvent)
        }).catch(() => {})
    }

    defineNanoIp(val) {
        if(val === undefined) return;
        let index = this.api.config.devices.findIndex(x => x.ip === val.ip) 
        const definedIp = val.ip || this.api.config.devices[index].ip
        const definedToken = val.token || this.api.config.devices[index].token
        this.nanoTokenState = true
        if(definedToken == undefined) {
            this.nanoTokenState = false
        }

        this.validateIp(definedIp, () => {
            this.nanoIpState && (this.api.config.devices[index].ip = definedIp)
            this.nanoIpState && this.sendEvent('game-ip-defined', definedIp)
            !this.nanoIpState && this.sendEvent('game-ip-bad-defined', definedIp)
            this.nanoIpState && this.nanoTokenState && this.api.setNanoIp(definedIp, definedToken)
        })

    }

    validateIp(ip, callback) {
        this.ipFinder.validate(ip, this.ipList).then(() => {this.nanoIpState = true}).catch(() => {this.nanoIpState = false} ).finally(callback)
    }

    findIp() {
        this.nanoIpState = false
        this.ipFinder.findIp(this.ipList)
        .then((ip)=> {
            this.sendEvent('nano-avalaible', ip)
            ip.forEach(element => {
                if (this.api.config.devices.findIndex(x => x.ip === element) === -1) {
                    this.api.config.devices.push({
                        ip: element,
                        token:null,
                        auth:false,
                        status:false
                    })
                }
            });
            this.save()


        }).catch((err) => {
            if(err === 'cancel') {
                this.sendEvent('find-ip-canceled')
            } else if (err === 'timeout') {
                this.sendEvent('find-ip-timeout')
            } else {
                this.sendEvent('find-ip-failed', err)
            }
        })
    }

    save() {
        this.configLoader.save(this.api.config, (err) => {
            console.log(this.api.config)
            if (err) {
                this.sendEvent('config-save-failed')
                return
            }
            this.sendEvent('config-save-success')
        })
    }

    updateSetting(effect,state) {
        let enable = this.api.config.mode[effect]
        if (false === state || true === state) {
            enable = state
        }

        this.api.setEffectSetting(effect, enable)
    }

    setDefaultSettings() {
        const defaultConfig = this.configLoader.loadDefault()
        this.api.setEffectsSetting(defaultConfig)
        this.getSettings()
    }

}

module.exports = nanoManager