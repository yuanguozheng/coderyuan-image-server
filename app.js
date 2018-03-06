const config = require('./config');
const resolverEnable = config.ConfigManager.getInstance().getValue(config.keys.KEY_RESOLVER_ENABLE);
const uploaderEnable = config.ConfigManager.getInstance().getValue(config.keys.KEY_UPLOADER_ENABLE);

if (resolverEnable) {
    const ImageResolver = require('./resolver');
    new ImageResolver().startServer();
}

if (uploaderEnable) {
    const uploader = require('./uploader');
    uploader.start();
}