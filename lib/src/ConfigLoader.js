// import

const path = require('path');
const fs = require('fs');

/*
###############################
ConfigLoader class:
 -load json file
 -save object to file
 -reset to default
###############################
*/

class ConfigLoader {
    constructor(rootPath) {
        this.rootPath = rootPath
        this.defaultSettingPath = path.join(__dirname, '../assets/default.json')
    }

    loadDefault() {
        return this.loadJsonFile(this.defaultSettingPath);
    }

    // create our object from json file
    load() {
        const customConfigPath = path.join(this.rootPath, 'config.json');

        return {
            devices:[{
                ip: null,
                token:null,
                auth:false,
                status:false
            }],
            mode: {
                ...this.loadJsonFile(this.defaultSettingPath)
            },
            ...this.loadJsonFile(customConfigPath)
        }
    }

    loadJsonFile(filePath) {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath))
        }

        return {}
    }

    // write object to file
    save(config, callback) {
        fs.writeFile(path.join(this.rootPath, `config.json`), JSON.stringify(config), (err) => {
            if (typeof callback === 'function') {
                callback(err)
            }
        })
    }
}

module.exports = ConfigLoader