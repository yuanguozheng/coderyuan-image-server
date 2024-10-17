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

process.env.IMG_SERV_PID = process.pid;