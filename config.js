const yaml = require('js-yaml');
const fs = require('fs');

let _instance;

class ConfigManager {

    constructor() {
        try {
            this._allConfigs = yaml.safeLoad(fs.readFileSync('./config.yml'));
        } catch (e) {
            console.log(e);
        }
    }

    static getInstance() {
        if (!_instance) {
            _instance = new ConfigManager();
        }
        return _instance;
    }

    getValue(key) {
        if (!this._allConfigs) {
            return null;
        }
        if (!key in this._allConfigs) {
            return null;
        }
        return this._allConfigs[key];
    }
}

module.exports.ConfigManager = ConfigManager;
module.exports.keys = {
    KEY_IMAGE_PATH: 'img_path',
    KEY_RESOLVE_SERVER_PORT: 'resolve_server_port',
    KEY_LOG_ENABLE: 'log_enable',
    KEY_ACCESS_TOKEN: 'access_token',
    KEY_UPLOADER_SERVER_PORT: 'uploader_server_port'
};