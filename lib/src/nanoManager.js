// Import
const api = require('./api')
const bonjour = require('bonjour')()
const request = require('request');
const browser = bonjour.find({ protocol: 'tcp' })

let ips = []

// get all the devices replying to the bonjour protocol

browser.on('up', function (s) {
    if (s.type == 'nanoleafapi' && !ips.includes(s.addresses[0])) {
        ips.push(s.addresses[0])
    }
})

/*
###############################
nanoManager class:
 -call api class
 -manage all the event listener (beatsaber connection, update/reset settings, mode)
 -manage nanoleaf connection (auth, ip)
###############################
*/

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
        this.api = new api(this.beatsaberAdaptater, this.configLoader.load(),sendEvent)
        this.initializeListeners()
    }

    // Init all the event
    initializeListeners() {
        this.listenEvent('find-ip', this.findIp.bind(this))
        this.listenEvent('define-ip', this.defineNanoIp.bind(this))
        this.listenEvent('save-config', this.save.bind(this))
        this.listenEvent('change-panel-status', this.changePanel.bind(this))
        this.listenEvent('change-setting', this.updateSetting.bind(this))
        this.listenEvent('default-settings', this.setDefaultSettings.bind(this))
        this.listenEvent('auth', this.auth.bind(this))
        this.listenEvent('get-data', this.getData.bind(this))
        this.listenEvent('get-settings', this.getSettings.bind(this))
        this.listenEvent('set-mode', this.setMode.bind(this))
    }

    // manage event (connection/disconection beatsaber)
    start() {
        this.beatsaberAdaptater
        
        .onConnected(() => {

            if(this.bsConnectionState !== true) {
                this.api.initialize()
                this.api.running = true
                this.bsConnectionState = true
                this.sendEvent('log', "connected to bs")
                this.sendEvent('bs-connected', {})
            }
        })  

        .onDisconnected(() => {

            
            if(this.bsConnectionState !== false) {
                this.api.initialize()
                this.api.running = false
                this.bsConnectionState = false
                this.sendEvent('log', "disconnected from bs")
                this.sendEvent('bs-disconnected', {})
            }
        })
        
        .connect()

        // Load all the panels in the api
        this.load()
        
        this.sendEvent('ready')
    }
    
    setMode(arg) {
        this.api.mode = arg
    }

    isReady() {
        return this.nanoIpState
    }

    load() {
        for(let i = 0; i<this.api.config.devices.length ; i++) {
            if (this.api.config.devices[i].auth === true && this.api.config.devices[i].token !== null  && this.api.config.devices[i].status !== false)  {
                this.defineNanoIp(this.api.config.devices[i])
                this.sendEvent('log', this.api.config.devices[i])
            }
        }
    }

    changePanel(data) {
        let index = this.api.config.devices.findIndex(x => x.ip === data[0]) 
        this.api.config.devices[index].status = data[1]
        if(data[1]) {
            this.load()
        } else {
            this.sendEvent('log', "delete panel")
            this.api.delNanoIp(data[0])
        }
    }

    // Auth nanoleaf (hold 5s power button)
    auth(ip) {
        this.nanoTokenState = false
        let event = this.sendEvent
        let token = null 

        let requestTokenOptions = {
            method: 'POST',
            url: `http://${ip}:16021/api/v1/new`,
        };

        let Oauth = new Promise((resolve, reject) => {
            setTimeout(() => {
                request(requestTokenOptions, function(error,response,body) {
                    try {
                        let tokens = JSON.parse(response.body).auth_token;
                        event('auth-succed',{"ip":ip,"token": token})
                        token = tokens
                        this.nanoTokenState = true
                        resolve()
                    } catch {
                        event('auth-failed',{"ip":ip})
                        reject()
                    }
                })
            }, 15000);
        })

        // Write to config our new data
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
        // find our panel in the dict
        let index = this.api.config.devices.findIndex(x => x.ip === val.ip) 

        const definedIp = val.ip || this.api.config.devices[index].ip
        const definedToken = val.token || this.api.config.devices[index].token

        this.nanoTokenState = true
        if(definedToken == undefined) {
            this.nanoTokenState = false
        }

        // Call check if ip is a nanoleaf ip
        this.validateIp(definedIp, () => {
            this.nanoIpState && (this.api.config.devices[index].ip = definedIp)
            this.nanoIpState && this.sendEvent('game-ip-defined', definedIp)
            !this.nanoIpState && this.sendEvent('game-ip-bad-defined', definedIp)
            this.nanoIpState && this.nanoTokenState && this.api.setNanoIp(definedIp, definedToken)
        })

    }
    
    // Call validate from ipFinder
    validateIp(ip, callback) {
        this.ipFinder.validate(ip, this.ipList).then(() => {this.nanoIpState = true}).catch(() => {this.nanoIpState = false} ).finally(callback)
    }

    getData() {
        this.sendEvent('data-updated', {
            statusBS: this.bsConnectionState,
            config: this.api.config.devices,
        })
    }

    getSettings() {
        this.sendEvent('dataSettings-updated', {
            info:[
                this.api.config.desc.LightsTypes,
                this.api.config.desc.Saber,
                this.api.config.desc.LightsValues,
                this.api.config.desc.General
            ],
            rest:this.api.config.mode
        })
    }

    // push our new data to the config
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

    // write config to the json file
    save() {
        this.configLoader.save(this.api.config, (err) => {
            if (err) {
                this.sendEvent('config-save-failed')
                return
            }
            this.sendEvent('config-save-success')
        })
    }


    updateSetting(obj) {
        let enable;
        if (obj.category === "type") {
            enable = this.api.config.mode.type[obj.effect]
        } else {

            enable = this.api.config.mode.value[obj.effect]
        }
        
        if (false === obj.state || true === obj.state) {
            enable = obj.state
        }
        
        this.api.setEffectSetting(obj.effect, obj.state, obj.category)
    }

    setDefaultSettings() {
        const defaultConfig = this.configLoader.loadDefault()
        this.api.setEffectsSetting(defaultConfig)
        this.getSettings()
    }

}

module.exports = nanoManager