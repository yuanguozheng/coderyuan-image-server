const URL = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');
const staticServer = require('node-static');
const config = require('./config');
const LogUtil = require('./log');
const BrowserUtils = require('./browser_utils');

const RESOURCE_ROOT = config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_DIR);
const SERVER_PORT = config.ConfigManager.getInstance().getValue(config.keys.KEY_RESOLVE_SERVER_PORT);

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
class ImageResolver {

    constructor() {
        // Init node-static, no cache
        this._fileServer = new staticServer.Server(RESOURCE_ROOT, {
            cache: null,
            gzip: true
        });
    }

    /**
     * Get the full image file path on the server.
     * 
     * @param {boolean} isAbsolutePath 
     * @param {string} extension 
     * @param {ParsedPath} pathInfo 
     */
    _getImagePath(isAbsolutePath, extension, pathInfo) {
        return path.join(
            isAbsolutePath ? RESOURCE_ROOT : '',
            pathInfo.dir,
            pathInfo.name + pathInfo.ext + (extension ? extension : '')
        );
    };

    /**
     * Start service.
     */
    startServer() {
        const hostname = config.ConfigManager.getInstance().getValue(config.keys.KEY_BIND_LOCAL) ? '127.0.0.1' : null;

        http.createServer((req, res) => {
            req.addListener('end', () => {
                try {
                    const url = URL.parse(req.url);
                    const pathInfo = path.parse(url.pathname);
        
                    if (!pathInfo || !pathInfo.name || !pathInfo.ext || !AVAILABLE_EXTENSIONS.includes(pathInfo.ext)) {
                        LogUtil.error(`URL: ${req.url} is illegal.`);
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
        
                    const fullNormalFilePath = this._getImagePath(true, null, pathInfo);
                    const relativeNormalFilePath = this._getImagePath(false, null, pathInfo);
        
                    const accepts = req.headers['accept'];
                    LogUtil.info(`Target File Path: ${fullNormalFilePath}`);
        
                    if (accepts && accepts.length !== 0) {
                        const userAgent = req.headers['user-agent'];
                        if (userAgent && BrowserUtils.isSafari(userAgent) && BrowserUtils.isSupportHeic(userAgent)) {
                            const heicPath = this._getImagePath(true, ".heic", pathInfo);
                            const relativeHeicPath = this._getImagePath(false, ".heic", pathInfo);
        
                            if (fs.existsSync(heicPath)) {
                                LogUtil.info(`URL: ${req.url} Safari sends .heic`);
                                if (!res.headersSent) {
                                    this._fileServer.serveFile(relativeHeicPath, 200, { 'Content-Type': "image/heic" }, req, res);
                                }
                                return;
                            }
                        } else {
                            for (let mime in EXT_MAP) {
                                if (accepts.indexOf(mime) !== -1) {
                                    const ext = EXT_MAP[mime];
                                    const fullCompressedFilePath = this._getImagePath(true, ext, pathInfo);
                                    const relativeCompressedFilePath = this._getImagePath(false, ext, pathInfo);
        
                                    if (fs.existsSync(fullCompressedFilePath)) {
                                        LogUtil.info(`URL: ${req.url} Accepts: ${accepts} sends ${ext}`);
                                        if (!res.headersSent) {
                                            this._fileServer.serveFile(relativeCompressedFilePath, 200, { 'Content-Type': mime }, req, res);
                                        }
                                        return;
                                    }
                                }
                            }
                        }
                    }
        
                    if (fs.existsSync(fullNormalFilePath)) {
                        LogUtil.info(`URL: ${req.url} Accepts: ${accepts} sends normal`);
                        if (!res.headersSent) {
                            this._fileServer.serveFile(relativeNormalFilePath, 200, {}, req, res);
                        }
                    } else {
                        LogUtil.error(`URL: ${req.url} Accepts: ${accepts} file not found, send nothing`);
                        res.statusCode = 404;
                        res.end();
                    }
                } catch (error) {
                    LogUtil.error(`Error handling request: ${error}`);
                    if (!res.headersSent) {
                        res.statusCode = 500;
                        res.end('Internal Server Error');
                    }
                }
            }).resume();
        }).listen(SERVER_PORT, hostname, (err) => {
            if (err) {
                LogUtil.error(err);
            } else {
                LogUtil.info(`Resolver service has been started, port: ${SERVER_PORT}`);
            }
        });
        
    }
}

module.exports = ImageResolver;