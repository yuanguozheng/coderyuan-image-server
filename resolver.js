const URL = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');
const staticServer = require('node-static');
const config = require('./config');
const LogUtil = require('./log');

const RESOURCE_ROOT = config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_DIR);
const SERVER_PORT = config.ConfigManager.getInstance().getValue(config.keys.KEY_RESOLVE_SERVER_PORT);

const EXT_WEBP = '.webp';
const EXT_AVIF = '.avif';

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
                const url = URL.parse(req.url);

                const pathInfo = path.parse(url.pathname);

                if (!pathInfo.name) {
                    LogUtil.error(`URL: ${req.url} is illegal.`);
                    res.statusCode = 404;
                    res.end();
                    return;
                }

                const fullAvifFilePath = this._getImagePath(true, EXT_AVIF, pathInfo);
                const relativeAvifFilePath = this._getImagePath(false, EXT_AVIF, pathInfo);
                const fullWebpFilePath = this._getImagePath(true, EXT_WEBP, pathInfo);
                const relativeWebpFilePath = this._getImagePath(false, EXT_WEBP, pathInfo);
                const fullNormalFilePath = this._getImagePath(true, null, pathInfo);
                const relativeNormalFilePath = this._getImagePath(false, null, pathInfo);

                const accepts = req.headers['accept'];
                LogUtil.info(`Target File Path: ${fullNormalFilePath}`);

                // If HTTP header accepts contains 'image/avif' (like Chrome/Edge), return avif file.
                if (accepts && accepts.indexOf('image/avif') !== -1 && fs.existsSync(fullAvifFilePath)) {
                    LogUtil.info(`URL: ${req.url} Accepts: ${accepts} send avif`);
                    this._fileServer.serveFile(relativeAvifFilePath, 200, { 'Content-Type': 'image/avif' }, req, res);
                } else if (accepts && accepts.indexOf('image/webp') !== -1 && fs.existsSync(fullWebpFilePath)) { 
                    // If HTTP header accepts contains 'image/webp' (like Chrome), return webp file.
                    LogUtil.info(`URL: ${req.url} Accepts: ${accepts} send webp`);
                    this._fileServer.serveFile(relativeWebpFilePath, 200, { 'Content-Type': 'image/webp' }, req, res);
                } else if (fs.existsSync(fullNormalFilePath)) {  // If not (like Safari), return png/jpg file.
                    LogUtil.info(`URL: ${req.url} Accepts: ${accepts} send normal`);
                    this._fileServer.serveFile(relativeNormalFilePath, 200, {}, req, res);
                } else {  // file not existed.
                    LogUtil.error(`URL: ${req.url} Accepts: ${accepts} file not found, send nothing`);
                    res.statusCode = 404;
                    res.end();
                }
            }).resume();
        }).listen(SERVER_PORT, hostname, (err) => {
            if (err) {
                LogUtil.error(err)
            } else {
                LogUtil.info(`Resolver service has been started, port: ${SERVER_PORT}`);
            }
        });
    }
}

module.exports = ImageResolver;