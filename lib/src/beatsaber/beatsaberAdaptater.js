


const WebSocket = require('ws');

class beatsaberAdaptater {
    constructor() {
        this.connected = false
        this.BSData = null
        this.socket = null
        this.initialize.bind(this)
        this.handleData.bind(this)
        this.connect.bind(this)
        this.handleConnected = () => {}
        this.handleDisconnected = () => {}

     }

    onConnected(callback) {
        this.handleConnected = callback
        return this
    }

    onDisconnected(callback) {
        this.handleDisconnected = callback
        return this
    }

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

    handleData(event, data) {
        event.handle(data)
    }

}

module.exports = beatsaberAdaptater