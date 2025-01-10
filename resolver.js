const path = require('path');
const fs = require('fs');
const config = require('./config');
const LogUtil = require('./log');
const BrowserUtils = require('./browser_utils');
const BaseService = require('./base_service');

const RESOURCE_ROOT = config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_DIR);

const EXT_MAP = {
    "image/avif": ".avif",
    "image/heic": '.heic',
    "image/heif": '.heic',
    "image/webp": ".webp",
};

const AVAILABLE_EXTENSIONS = config.ConfigManager.getInstance().getValue(config.keys.KEY_AVAILABLE_EXT);

/**
 * Parse url and send image.
 */
class ImageResolver extends BaseService {

    handleRequest(req, res) {
        const url = req.url
        const pathInfo = path.parse(url);

        if (!pathInfo || !pathInfo.name || !pathInfo.ext || !AVAILABLE_EXTENSIONS.includes(pathInfo.ext)) {
            LogUtil.error(`URL: ${req.url} is illegal.`);
            res.sendStatus(404);
            return;
        }

        const fullNormalFilePath = getImagePath(true, null, pathInfo);
        const accepts = req.headers['accept'];
        LogUtil.info(`Target File Path: ${fullNormalFilePath}`);

        const supportedExts = getSupportedExtensions(accepts);
        for (let index = 0; index < supportedExts.length; index++) {
            const element = supportedExts[index];
            const fullCompressedFilePath = getImagePath(true, element.ext, pathInfo);
            if (fs.statSync(fullCompressedFilePath).size > 0) {
                LogUtil.info(`URL: ${req.url} Accepts: ${accepts} sends ${element.ext}`);
                res.sendFile(fullCompressedFilePath, { headers: { 'Content-Type': element.mime } });
                return;
            }
        }

        const userAgent = req.headers['user-agent'];
        if (userAgent && BrowserUtils.isSafari(userAgent) && BrowserUtils.isSupportHeic(userAgent)) {
            const heicPath = getImagePath(true, ".heic", pathInfo);

            if (fs.statSync(heicPath).size > 0) {
                LogUtil.info(`URL: ${req.url} Safari sends .heic`);
                res.sendFile(heicPath, { headers: { 'Content-Type': "image/heic" } });
                return;
            }
        }

        // No accepts maybe not a browser, send normal image
        if (fs.statSync(fullNormalFilePath).size > 0) {
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

const MAX_ACCEPT_LENGTH = 1000; // 定义 Accept 头的最大长度

function getSupportedExtensions(acceptHeader) {
    const result = [];
    if (!acceptHeader || acceptHeader.length === 0 || acceptHeader.length > MAX_ACCEPT_LENGTH) {
        return result;
    }
    let start = 0;
    let type = '';
    for (let i = 0; i <= acceptHeader.length; i++) {
        const char = acceptHeader[i];
        if (char === ',' || i === acceptHeader.length) {
            type = acceptHeader.slice(start, i).split(';')[0].trim();
            if (EXT_MAP[type]) {
                result.push({
                    ext: EXT_MAP[type],
                    mime: type,
                });
            }
            start = i + 1;
        }
    }
    return result;
}

/**
 * Get the full image file path on the server.
 * 
 * @param {boolean} isAbsolutePath 
 * @param {string} extension 
 * @param {ParsedPath} pathInfo 
 */
function getImagePath(isAbsolutePath, extension, pathInfo) {
    return path.join(
        isAbsolutePath ? RESOURCE_ROOT : '',
        pathInfo.dir,
        pathInfo.name + pathInfo.ext + (extension ? extension : '')
    );
};

module.exports = ImageResolver;