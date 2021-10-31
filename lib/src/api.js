class Api {
    constructor(config) {
        this.config = config
    }

    setNanoIp(ip,token) {
        this.setNanoIp = ip
        this.setNanoToken = token
    }
}

module.exports = Api