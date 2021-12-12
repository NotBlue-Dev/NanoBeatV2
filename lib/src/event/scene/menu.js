const axios = require('axios').default;

/*
###############################
menu class:
 - When in menu show effect
###############################
*/

class menu {
    constructor(manage,options,panel,sendEvent) {
        this.manage = manage
        this.sendEvent = sendEvent
        this.options = options
        this.panel = panel
        
    }
    
    handle(httpData) {
        if(httpData.scene == "Menu") {
            this.sendEvent('log', "clear")
            this.manage.handle(5, 0, this.panel)

        } 

    }
}

module.exports = menu