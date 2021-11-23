const axios = require('axios').default;

class menu {
    constructor(manage,options,panel) {
        this.manage = manage
        this.options = options
        this.panel = panel
        this.obj = 	{write : {command : "request", animName : "Romantic"}}
    }
    
    handle(httpData) {
        if(httpData.scene === "Menu") {
          for(let i = 0; i < this.panel.length; i++ ) {
            axios.put(`http://${this.panel[i].ip}:16021/api/v1/${this.panel[i].token}/effects`, this.obj).then((result) => {
              console.log(result)
            }).catch((err) => {console.log(err)});
          }
        } 

    }
}

module.exports = menu