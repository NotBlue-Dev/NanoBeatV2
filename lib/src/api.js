const axios = require('axios')
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


// ### REDO PANEL DATA STRUCTURE TO MAKE IT WORK WITH MULTIPLE PANEL AT SAME TIME (backlaser etc) ###
// ### INIT IS NOT RUN ANYWHERE ### 

class Api {
    constructor(bsHandler, config) {
        this.bsHandler = bsHandler
        this.manage = Manage
        this.config = config
        this.events = []
        this.running = false
        this.panel = []
        // default
        this.mode = 'light'
    }

    setSplit(arg, ip, token) {
        this.panel.push({"ip":ip, "token":token, "data":arg})
    }

    setNanoIp(ip,token) {
        // ENABLE STREAMING MODE FOR NANOLEAF
        axios.put(`http://${ip}:16021/api/v1/${token}/effects`, {write:{ command: "display", animType: "extControl", extControlVersion: "v2" }}).then((result) => {}).catch((err) => {console.log(err)});
        
        // SPLIT
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
                let add = parseFloat(element.x) + parseFloat(element.y)
                posDic.push({id:element.panelId,sum:add})
                bottom.push({id:element.panelId, y:parseFloat(element.y)})
            });

            posDic = posDic.sort(function(a, b) {
                return a.sum - b.sum;
            });

            bottom = bottom.sort(function(a, b) {
                return a.y - b.y;
            });

            if(!(val % 1 === 0)) {
                val = Math.round(val)
            }

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

            this.setSplit(sorted, ip, token)
            this.initialize()

        }).catch((err) => {console.log(err)});

    }   
    

    initialize() {
        this.events = []

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

        const valueConfig = {
            0: conf.off,
            1: conf.blueFull,
            2: conf.blueFadeIn,
            3: conf.blueFadeOut,
            5: conf.redFull,
            6: conf.redFadeIn,
            7: conf.redFadeOut
        }

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
        if (this.bsHandler.socket === null) {
            setTimeout(() => {
                this.Play()
            }, 2500);
        } else {
            this.bsHandler.socket.onmessage = (json) => {

                let BSdata = new httpData(JSON.parse(json.data))
                event.forEach(ev => {
                    this.bsHandler.handleData(ev, BSdata)
                });
            }
        }
    }


}


module.exports = Api