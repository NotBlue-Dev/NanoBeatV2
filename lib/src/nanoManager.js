const api = require('./api')
const bonjour = require('bonjour')()
let browser = bonjour.find({ protocol: 'tcp' })
const axios = require('axios').default;
const request = require('request');

class nanoManager {
    constructor(IpFinder, configLoader, sendEvent, listenEvent) {
        this.sendEvent = sendEvent
        this.listenEvent = listenEvent
        this.ipFinder = IpFinder
        this.configLoader = configLoader
        this.nanoIpState = false
        this.nanoTokenState = false
        this.ipList = []
        this.api = new api(this.configLoader.load())
        this.initializeListeners()
    }

    initializeListeners() {
        this.listenEvent('find-ip', this.findIp.bind(this))
        this.listenEvent('define-ip', this.defineNanoIp.bind(this))
        this.listenEvent('save-config', this.save.bind(this))
        this.listenEvent('change-setting', this.updateSetting.bind(this))
        this.listenEvent('default-settings', this.setDefaultSettings.bind(this))
        this.listenEvent('auth', this.auth.bind(this))

        let ips = this.ipList

        browser.on('up', function (s) {
            if (s.type == 'nanoleafapi' && !ips.includes(s.addresses[0])) {
                ips.push(s.addresses[0])
            }
        })
    }

    start() {
        this.defineNanoIp(this.api.config.ip)
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
            this.api.config.ip = ip
            this.api.config.token = token
            this.save()
            this.api.setNanoIp(ip, token, this.sendEvent)
        }).catch(() => {})
    }

    defineNanoIp(ip) {
        const definedIp = ip || this.api.config.ip
        const definedToken = this.api.config.token
        this.nanoTokenState = true
        if(definedToken == undefined) {
            this.nanoTokenState = false
        }
        this.validateIp(definedIp, () => {
            this.nanoIpState && (this.api.config.ip = definedIp)
            this.nanoIpState && this.sendEvent('game-ip-defined', definedIp)
            !this.nanoIpState && this.sendEvent('game-ip-bad-defined', definedIp)
            this.nanoIpState && this.nanoTokenState && this.api.setNanoIp(definedIp, definedToken, this.sendEvent)
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

    updateSetting(arg) {
        // 
    }

    setDefaultSettings() {
        const defaultConfig = this.configLoader.loadDefault()
        this.api.setEffectsSetting(defaultConfig)
        this.getSettings()
    }

}

module.exports = nanoManager