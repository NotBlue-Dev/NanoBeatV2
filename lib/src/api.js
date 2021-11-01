const axios = require('axios')
const WebSocket = require('ws');
const httpData = require("./httpData");

const Center = require("./event/light/center");
const Backlaser = require("./event/light/backlaser");
const LeftRotate = require("./event/light/leftRotate");
const BigRing = require("./event/light/bigRing");
const RightRotate = require("./event/light/rightRotate");

const Bomb = require("./event/saber/bomb");
const Cut = require("./event/saber/cut");
const Wall = require("./event/saber/wall");

const Manage = require("./event/light/valueManager");


class Api {
    constructor(config) {
        this.manage = Manage
        this.config = config
        this.events = []
        // default
        this.mode = 'light'
        this.initialize()
    }

    setNanoIp(ip,token) {
        this.setNanoIp = ip
        this.setNanoToken = token
        
        // ENABLE STREAMING MODE FOR NANOLEAF
        axios.put(`http://${this.setNanoIp}:16021/api/v1/${this.setNanoToken}/effects`, {write:{ command: "display", animType: "extControl", extControlVersion: "v2" }}).then((result) => {}).catch((err) => {console.log(err)});
        
        // SPLIT
        axios.get(`http://${this.setNanoIp}:16021/api/v1/${this.setNanoToken}/panelLayout/layout`).then((result) => {
            let json = result.data;
            let total = json.numPanels;
            let data = json.positionData;
            let posDic = []
            data.forEach(element => {
                let add = parseFloat(element.x) + parseFloat(element.y)
                posDic.push({id:element.panelId,sum:add})
            });
            posDic = posDic.sort(function(a, b) {
                return a.sum - b.sum;
            });
            console.log(posDic)
            // sort list + systeme odd or even

        }).catch((err) => {console.log(err)});

        this.startPlay()
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
            wall: Wall
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
            state && this.events.push(new (eventClass[name])(new (this.manage), valueConfig))
        }
    }


    setEffectsSetting(settings) {
        this.config.events = settings

        this.initializeEffects()
    }

    setEffectSetting(name, options) {
        this.config.mode[name] = options

        this.initializeEffects()
    }

    startPlay() {
        let event = this.events
        function openWS() {
            let socket = new WebSocket("ws://127.0.0.1:6557/socket");
        
            socket.onclose = function(event) {
                
                setTimeout(() => {
                    socket = null;
                    openWS()
                }, 2500);

            }

            socket.onerror = function(e) {
                // catch
            }
            
            socket.onmessage = function(json) {
                const BSData = new httpData(JSON.parse(json.data))
                event.forEach(ev => {
                    ev.handle(BSData);
                });
            }


        }
        openWS()
    }


}

// type 4 : center
// type 3: right rotate
// type 2: left rotate 
// type 1: big ring
// type 0: backlaser

// 0: Off
// 1 blue full
// 2: blue + fade in (trans time = 200ms)
// 3: blue + fade out (go back to off after 200 ms)
// 5 red full
// 6: red _ fade in (trans time = 200ms)
// 7: red _ fade out (go back to off after 200 ms)



// http://${this.setNanoIp}:16021/api/v1/${this.setNanoToken}

module.exports = Api