class backlaser {
    constructor(manage,options) {
        this.manage = manage
        this.options = options
    }

    handle(httpData) {
        if(httpData.beatmapEvent != null && httpData.beatmapEvent.type === 0) {
            let value = httpData.getValueBeatMap()
            if(this.options[value] === true) {
                this.manage.handle(httpData.beatmapEvent.type, value)
            }
        }
    }
}

module.exports = backlaser