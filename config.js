const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

let _instance;

/**
 * Some const key defined for fetch configs.
 */
const keys = {
    KEY_IMAGE_DIR: 'img_dir',
    KEY_RESOLVE_SERVER_PORT: 'resolve_server_port',
    KEY_LOG_ENABLE: 'log_enable',
    KEY_ACCESS_TOKEN: 'access_token',
    KEY_UPLOADER_SERVER_PORT: 'uploader_server_port',
    KEY_RESOLVER_ENABLE: 'resolver_enable',
    KEY_UPLOADER_ENABLE: 'uploader_enable',
    KEY_WATERMARK_PATH: 'watermark_path',
    KEY_GEN_COMPRESS: 'generate_compressed',
    KEY_FORMATS: 'compressed_formats',
    KEY_ADD_WATERMARK: 'add_watermark',
    KEY_MAX_IMAGE_SIZE: 'max_image_size',
    KEY_URL_PREFIX: 'image_server_url_prefix',
    KEY_BIND_LOCAL: 'bind_local_address',
    KEY_AVAILABLE_EXT: 'available_image_extensions'
};

/**
 * A manager for managing configs.
 */
class ConfigManager {

    constructor() {
        try {
            this._allConfigs = yaml.load(fs.readFileSync('./config.yml'));
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Get single instance.
     * 
     * @returns {ConfigManager}
     */
    static getInstance() {
        if (!_instance) {
            _instance = new ConfigManager();
        }
        return _instance;
    }

    /**
     * get config value by key
     * 
     * @param {string} key 
     * @returns {string|number} value
     */
    getValue(key) {
        if (!this._allConfigs) {
            return null;
        }
        if (!key in this._allConfigs) {
            return null;
        }
        return this._allConfigs[key];
    }

    /**
     * Get the temporary directory for saving temporary images and ensure the directory is existed.
     * 
     * @returns {string|null} full temporary directory path
     */
    getImageTempPath() {
        const imageDir = this.getValue(keys.KEY_IMAGE_DIR);
        if (!imageDir || !fs.existsSync(imageDir)) {
            return null;
        }
        const tempDir = path.join(imageDir, '.temp/');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        return tempDir;
    }
}

module.exports.ConfigManager = ConfigManager;
module.exports.keys = keys;