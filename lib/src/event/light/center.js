/*
###############################
center class:
 - call handle with type of light(4) + effect(fade etc), color(beatmapEvent.value)
###############################
*/

class center {
    constructor(manage,options,panel) {
        this.manage = manage
        this.options = options
        this.panel = panel
    }

    handle(httpData) {
        if(httpData.beatmapEvent != null && httpData.beatmapEvent.type === 4) {
            let value = httpData.getValueBeatMap()
            // check if we enabled this event in settings
            if(this.options[value] === true) {
                this.manage.handle(httpData.beatmapEvent.type, value, this.panel)
            }
        }
    }
}

module.exports = center