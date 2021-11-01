class leftRotate {
    constructor(manage,options,panel) {
        this.manage = manage
        this.options = options
        this.panel = panel
    }

    handle(httpData) {
        if(httpData.beatmapEvent != null && httpData.beatmapEvent.type === 2) {
            let value = httpData.getValueBeatMap()
            if(this.options[value] === true) {
                this.manage.handle(httpData.beatmapEvent.type, value, this.panel)
            }
        }
    }
}

module.exports = leftRotate