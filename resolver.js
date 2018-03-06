const URL = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');
const staticServer = require('node-static');
const config = require('./config');
const LogUtil = require('./log');

const RESOURCE_ROOT = config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_DIR);
const SERVER_PORT = config.ConfigManager.getInstance().getValue(config.keys.KEY_RESOLVE_SERVER_PORT);

class ImageResolver {

    constructor() {
        this._fileServer = new staticServer.Server(RESOURCE_ROOT, {
            cache: null,
            gzip: true
        });
    }

    _getImagePath(isAbsolutePath, needWebp, pathInfo) {
        return path.join(
            isAbsolutePath ? RESOURCE_ROOT : '',
            pathInfo.dir,
            pathInfo.name + (needWebp ? '.webp' : pathInfo.ext)
        );
    };

    startServer() {
        http.createServer((req, res) => {
            req.addListener('end', () => {
                const url = URL.parse(req.url);

                const pathInfo = path.parse(url.pathname);
                const fullWebpFilePath = this._getImagePath(true, true, pathInfo);
                const relativeWebpFilePath = this._getImagePath(false, true, pathInfo);
                const fullNormalFilePath = this._getImagePath(true, false, pathInfo);
                const relativeNormalFilePath = this._getImagePath(false, false, pathInfo);

                const accepts = req.headers['accept'];
                LogUtil.info(`Target File Path: ${fullNormalFilePath}`);

                if (accepts && accepts.indexOf('image/webp') !== -1 && fs.existsSync(fullWebpFilePath)) {
                    LogUtil.info(`URL: ${req.url} Accepts: ${accepts} send webp`);
                    this._fileServer.serveFile(relativeWebpFilePath, 200, { 'Content-Type': 'image/webp' }, req, res);
                } else if (fs.existsSync(fullNormalFilePath)) {
                    LogUtil.info(`URL: ${req.url} Accepts: ${accepts} send normal`);
                    this._fileServer.serveFile(relativeNormalFilePath, 200, {}, req, res);
                } else {
                    LogUtil.error(`URL: ${req.url} Accepts: ${accepts} file not found, send nothing`);
                    res.statusCode = 404;
                    res.end();
                }
            }).resume();
        }).listen(SERVER_PORT, (err) => {
            if (err) {
                LogUtil.error(err)
            } else {
                LogUtil.info(`Resolver service has been started, port: ${SERVER_PORT}`);
            }
        });
    }
}

module.exports = ImageResolver;