/*
###############################
center class:
 - call handle with type of light(4) + effect(fade etc), color(beatmapEvent.value)
###############################
*/

class center {
    constructor(manage,options,panel,sendEvent) {
        this.sendEvent = sendEvent
        this.options = options
        this.manage = manage
        this.panel = panel
    }

    handle(httpData) {
        if(httpData.beatmapEvent != null && httpData.beatmapEvent.type === 4) {
            let value = httpData.getValueBeatMap()
            // check if we enabled this event in settings
            if(this.options[value] === true) {
                this.sendEvent('log', "center")
                this.manage.handle(httpData.beatmapEvent.type, value, this.panel)
            }
        }
    }
}

module.exports = center