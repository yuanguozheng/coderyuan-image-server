const fs = require('fs');
const config = require('./config');
const configMgr = config.ConfigManager.getInstance();
const resolverEnable = configMgr.getValue(config.keys.KEY_RESOLVER_ENABLE);
const uploaderEnable = configMgr.getValue(config.keys.KEY_UPLOADER_ENABLE);

if (resolverEnable) {
    const ImageResolver = require('./resolver');
    new ImageResolver().startServer();
}

if (uploaderEnable) {
    const ImageUploader = require('./uploader');
    new ImageUploader().startServer();
}

if (process.platform === 'linux') {
    fs.writeFile(configMgr.getValue(config.keys.KEY_PID_FILE), process.pid + '', () => { });
}