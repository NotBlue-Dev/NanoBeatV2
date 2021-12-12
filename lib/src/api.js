// import lib
const axios = require('axios')

// import class/dto

const Center = require("./event/light/center");
const Backlaser = require("./event/light/backlaser");
const LeftRotate = require("./event/light/leftRotate");
const BigRing = require("./event/light/bigRing");
const RightRotate = require("./event/light/rightRotate");
const Bomb = require("./event/saber/bomb");
const Cut = require("./event/saber/cut");
const Wall = require("./event/saber/wall");
const Menu = require("./event/scene/menu");
const Manage = require("./event/light/valueManager");

/*
###############################
Api class:
 -split panel
 -init event with settings
 -start playing effect
###############################

bsHandler = beatsaberAdaptater.js
*/

class Api {
    constructor(bsHandler, config,sendEvent) {
        this.sendEvent = sendEvent
        this.bsHandler = bsHandler
        this.manage = Manage
        this.config = config
        this.events = []
        this.running = false
        this.panel = []
        this.delNanoIp.bind(this)
        // default mode
        this.start.bind(this)
        this.mode = 'light'
        
    }

    start() {
        this.bsHandler
        .onConnected(() => {
            if(this.running !== true) {
                this.Play()
            }
        })
        .onDisconnected(() => {
            this.running = false
        })

    }

    setSplit(arg, ip, token) {
        this.panel.forEach(element => {
            if(element.ip === ip) {
                this.delNanoIp(ip)
            }
        });
        this.sendEvent('log', {"ip":ip, "token":token, "data":arg})
        this.panel.push({"ip":ip, "token":token, "data":arg})
    }

    delNanoIp(ip) {
        
        this.panel.forEach(element => {
            if(element.ip === ip) {
                this.panel.splice(this.panel.indexOf(ip), 1)
            }
        });

        this.sendEvent('log', ip)
        
    }

    setNanoIp(ip,token) {
        // Enable streaming mode via udp
        axios.put(`http://${ip}:16021/api/v1/${token}/effects`, {write:{ command: "display", animType: "extControl", extControlVersion: "v2" }}).then((result) => this.sendEvent('log', "enable udp streaming")).catch((err) => {this.sendEvent('log', err)});
        
        // split the panel in 4 (left,right,bottom,center)
        axios.get(`http://${ip}:16021/api/v1/${token}/panelLayout/layout`).then((result) => {
            this.sendEvent('log', "get layout")
            let json = result.data;
            let total = json.numPanels;
            let data = json.positionData;

            let posDic = []
            let bottom = []
            let x;
            let val = total/3
            let sorted = []

            data.forEach(element => {
                // Add x and y so we get position
                let add = parseFloat(element.x) + parseFloat(element.y)
                posDic.push({id:element.panelId,sum:add})
                bottom.push({id:element.panelId, y:parseFloat(element.y)})
            });

            // sort position
            posDic = posDic.sort(function(a, b) {
                return a.sum - b.sum;
            });

            bottom = bottom.sort(function(a, b) {
                return a.y - b.y;
            });

            // if odd we round to >
            if(!(val % 1 === 0)) {
                val = Math.round(val)
            }

            // if our panels is odd we add 1 to one of our list
            for (let i=0; i<3; i++) {
                x = 0
                if(i === 0 && !(total/3 % 1 === 0)) {
                    if(val*3>total) {
                        x = -1
                    } else {
                        x = 1
                    }  
                }

                let pos = posDic.slice(0,val+x)
                posDic.splice(0,val+x)
                sorted.push(pos)
            }

            let posBot = bottom.slice(0,val)
            bottom.splice(0,val)
            sorted.push(posBot)

            // we have 4 list, ip, token ready to use
            this.setSplit(sorted, ip, token)

            // so we don't init 2 times
            if(this.events.length === 0) {
                this.initialize()
            }

        }).catch((err) => {console.log(err)});

    }   
    

    initialize() {
        this.sendEvent('log', "initialize")
        this.events = []

        // create class object
        const eventClass = {
            center: Center,
            backlaser: Backlaser,
            leftRotate: LeftRotate,
            rightRotate: RightRotate,
            bigRing: BigRing,
            bomb: Bomb,
            cut: Cut,
            wall: Wall,
            scene:Menu
        }

        let conf = this.config.mode.value

        // options for the differents light output (enable or not)
        const valueConfig = {
            0: conf.off,
            1: conf.blueFull,
            2: conf.blueFadeIn,
            3: conf.blueFadeOut,
            5: conf.redFull,
            6: conf.redFadeIn,
            7: conf.redFadeOut
        }

        // this.manage = our value manager making all the udp connection
        for (const [name,state] of Object.entries(this.config.mode.type)) {
            state && this.events.push(new (eventClass[name])(new (this.manage), valueConfig, this.panel,this.sendEvent))
        }

        if(!this.running) this.Play()
        
    }

    setEffectsSetting(settings) {
        this.config.mode = settings

        this.initialize()
    }

    setEffectSetting(name, options, cat) {
        if (cat === "type") {
            this.config.mode.type[name] = options
        } else {
            this.config.mode.value[name] = options
        }
    
        this.initialize()
    }

    Play() {
        this.sendEvent('log', "start api listener")
        this.running = true
        let event = this.events
        this.bsHandler.await(event)
    }


}


module.exports = Api