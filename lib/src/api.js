// import lib
const axios = require('axios')

// import class/dto
const httpData = require("./httpData");
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
    constructor(bsHandler, config) {
        this.bsHandler = bsHandler
        this.manage = Manage
        this.config = config
        this.events = []
        this.running = false
        this.panel = []
        // default mode
        this.mode = 'light'
    }

    setSplit(arg, ip, token) {
        this.panel.push({"ip":ip, "token":token, "data":arg})
    }

    setNanoIp(ip,token) {
        // Enable streaming mode via udp
        axios.put(`http://${ip}:16021/api/v1/${token}/effects`, {write:{ command: "display", animType: "extControl", extControlVersion: "v2" }}).then((result) => {}).catch((err) => {console.log(err)});
        
        // split the panel in 4 (left,right,bottom,center)
        axios.get(`http://${ip}:16021/api/v1/${token}/panelLayout/layout`).then((result) => {
            
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
            state && this.events.push(new (eventClass[name])(new (this.manage), valueConfig, this.panel))
        }

        if(!this.running) this.Play()

    }


    setEffectsSetting(settings) {
        this.config.events = settings

        this.initializeEffects()
    }

    setEffectSetting(name, options) {
        this.config.mode[name] = options

        this.initializeEffects()
    }

    Play() {
        this.running = true

        let event = this.events
        // if socket is not created, retry after 2.5s
        if (this.bsHandler.socket === null) {
            setTimeout(() => {
                this.Play()
            }, 2500);
        } else {
            this.bsHandler.socket.onmessage = (json) => {
                // push data to dto
                let BSdata = new httpData(JSON.parse(json.data))
                // for each event call
                event.forEach(ev => {
                    ev.handle(BSdata)
                });
            }
        }
    }


}


module.exports = Api