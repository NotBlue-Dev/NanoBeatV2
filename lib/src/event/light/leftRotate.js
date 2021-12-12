/*
###############################
leftRotate class:
 - call handle with type of light(2) + effect(fade etc), color(beatmapEvent.value)
###############################
*/

class leftRotate {
    constructor(manage,options,panel,sendEvent) {
        this.sendEvent = sendEvent
        this.manage = manage
        this.options = options
        this.panel = panel
    }

    handle(httpData) {
        if(httpData.beatmapEvent != null && httpData.beatmapEvent.type === 2) {
            let value = httpData.getValueBeatMap()
            // check if we enabled this event in settings
            if(this.options[value] === true) {
                this.sendEvent('log', "leftRotate")
                this.manage.handle(httpData.beatmapEvent.type, value, this.panel)
            }
        }
    }
}

module.exports = leftRotate