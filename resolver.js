const path = require('path');
const fs = require('fs');
const config = require('./config');
const LogUtil = require('./log');
const BrowserUtils = require('./browser_utils');
const BaseService = require('./base_service');

const RESOURCE_ROOT = config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_DIR);

const EXT_MAP = {
    "image/avif": ".avif",
    "image/webp": ".webp",
    "image/heic": '.heic',
    "image/heif": '.heic',
};

const AVAILABLE_EXTENSIONS = config.ConfigManager.getInstance().getValue(config.keys.KEY_AVAILABLE_EXT);

/**
 * Parse url and send image.
 */
class ImageResolver extends BaseService {

    /**
     * Get the full image file path on the server.
     * 
     * @param {boolean} isAbsolutePath 
     * @param {string} extension 
     * @param {ParsedPath} pathInfo 
     */
    static _getImagePath(isAbsolutePath, extension, pathInfo) {
        return path.join(
            isAbsolutePath ? RESOURCE_ROOT : '',
            pathInfo.dir,
            pathInfo.name + pathInfo.ext + (extension ? extension : '')
        );
    };

    handleRequest(req, res) {
        const url = req.url
        const pathInfo = path.parse(url);

        if (!pathInfo || !pathInfo.name || !pathInfo.ext || !AVAILABLE_EXTENSIONS.includes(pathInfo.ext)) {
            LogUtil.error(`URL: ${req.url} is illegal.`);
            res.sendStatus(404);
            return;
        }

        const fullNormalFilePath = ImageResolver._getImagePath(true, null, pathInfo);

        const accepts = req.headers['accept'];
        LogUtil.info(`Target File Path: ${fullNormalFilePath}`);

        if (accepts && accepts.length !== 0) {
            const userAgent = req.headers['user-agent'];
            if (userAgent && BrowserUtils.isSafari(userAgent) && BrowserUtils.isSupportHeic(userAgent)) {
                const heicPath = ImageResolver._getImagePath(true, ".heic", pathInfo);

                if (fs.existsSync(heicPath)) {
                    LogUtil.info(`URL: ${req.url} Safari sends .heic`);
                    res.sendFile(heicPath, { headers: { 'Content-Type': "image/heic" } });
                    return;
                }
            } else {
                for (let mime in EXT_MAP) {
                    if (accepts.indexOf(mime) !== -1) {
                        const ext = EXT_MAP[mime];
                        const fullCompressedFilePath = ImageResolver._getImagePath(true, ext, pathInfo);

                        if (fs.existsSync(fullCompressedFilePath)) {
                            LogUtil.info(`URL: ${req.url} Accepts: ${accepts} sends ${ext}`);
                            res.sendFile(fullCompressedFilePath, { headers: { 'Content-Type': mime } });
                            return;
                        }
                    }
                }
            }
        }

        if (fs.existsSync(fullNormalFilePath)) {
            LogUtil.info(`URL: ${req.url} Accepts: ${accepts} sends normal`);
            res.sendFile(fullNormalFilePath);
            return;
        } else {
            LogUtil.error(`URL: ${req.url} Accepts: ${accepts} file not found, send nothing`);
            res.sendStatus(404);
            return;
        }
    }

    getServiceName() {
        return 'Image Resolver';
    }

    getServerPort() {
        return config.ConfigManager.getInstance().getValue(config.keys.KEY_RESOLVE_SERVER_PORT);
    }
}

module.exports = ImageResolver;