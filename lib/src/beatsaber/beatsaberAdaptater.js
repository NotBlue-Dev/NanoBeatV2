// import
const WebSocket = require('ws');

/*
###############################
beatsaberAdaptater class:
 -check beatsaber mod status
 -connect to bs mod
###############################
*/

class beatsaberAdaptater {
    constructor() {
        this.connected = false
        this.BSData = null
        this.socket = null
        this.initialize.bind(this)
        this.connect.bind(this)
        this.handleConnected = () => {}
        this.handleDisconnected = () => {}

     }
    
    // on connection/disconnection -> callback -> send event
    onConnected(callback) {
        this.handleConnected = callback
        return this
    }

    onDisconnected(callback) {
        this.handleDisconnected = callback
        return this
    }

    // create ws client
    connect() {
        try {
            this.socket = new WebSocket("ws://127.0.0.1:6557/socket")
        } catch {
            setTimeout(() => {
                this.connect()
            }, 2500);
        } finally {
            this.initialize()
        }
    }

    // handle ws client error, open, close
    initialize() {
        this.socket.onclose = () => {
            this.connected = false
            setTimeout(() => {
                this.connect()
            }, 2500);
            this.handleDisconnected("Disconected, close")
        }

        this.socket.onopen = () => {

            if(this.connected != true) {
                this.connected = true
                this.handleConnected('BeatSaber HTTP STATUS')
            }
            
        }

        this.socket.onerror = () => {
            this.connected = false
            this.handleDisconnected("Disconected, error")
        }   

        
    }

}

module.exports = beatsaberAdaptater