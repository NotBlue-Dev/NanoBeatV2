const axios = require('axios')
const WebSocket = require('ws');
const httpData = require("./httpData");

const Center = require("./event/light/center");
const Backlaser = require("./event/light/backlaser");
const BlueFadeIn = require("./event/light/blueFadeIn");
const BlueFadeOut = require("./event/light/blueFadeOut");
const BlueFull = require("./event/light/blueFull");
const LeftRotate = require("./event/light/leftRotate");
const Off = require("./event/light/off");
const RedFadeIn = require("./event/light/redFadeIn");
const RedFadeOut = require("./event/light/redFadeOut");
const RedFull = require("./event/light/redFull");
const RightRotate = require("./event/light/rightRotate");

const Bomb = require("./event/saber/bomb");
const Cut = require("./event/saber/cut");
const Wall = require("./event/saber/wall");

class Api {
    constructor(config) {
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
        
        // NOW STREAMING DATA USING UDP
    
    }

    initialize() {
        this.events = []

        const eventClass = {
            center: Center,
            backlaser: Backlaser,
            blueFadeIn: BlueFadeIn,
            blueFadeOut: BlueFadeOut,
            blueFull: BlueFull,
            off: Off,
            leftRotate: LeftRotate,
            redFull:RedFull,
            redFadeIn: RedFadeIn,
            redFadeOut: RedFadeOut,
            rightRotate: RightRotate,
            bomb: Bomb,
            cut: Cut,
            wall: Wall
        }

        for (const [name,state] of Object.entries(this.config.mode)) {
            state && this.events.push(new (eventClass[name]))
        }
        // INIT
        this.startPlay()
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

                
            }


        }
        openWS()
    }


}




// http://${this.setNanoIp}:16021/api/v1/${this.setNanoToken}

module.exports = Api