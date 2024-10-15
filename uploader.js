const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');

const LogUtil = require('./log');

const config = require('./config');
const TARGET_DIR = config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_DIR);
const ADD_WATERMARK = config.ConfigManager.getInstance().getValue(config.keys.KEY_ADD_WATERMARK);
const URL_RREFIX = config.ConfigManager.getInstance().getValue(config.keys.KEY_URL_PREFIX);
const MAX_IMAGE_SIZE = config.ConfigManager.getInstance().getValue(config.keys.KEY_MAX_IMAGE_SIZE);
const COMPRESS_FORMATS = config.ConfigManager.getInstance().getValue(config.keys.KEY_FORMATS);
const GEN_COMPRESS = config.ConfigManager.getInstance().getValue(config.keys.KEY_GEN_COMPRESS);

const WaterMarker = require('./watermarker');

const UniResult = require('./universal-result');
const converter = require('./converter');

/**
 * Init multer.
 */
const upload = multer({
    dest: config.ConfigManager.getInstance().getImageTempPath(),
    fileFilter: (req, file, callback) => {
        const pToken = req.query.accessToken;
        const configToken = config.ConfigManager.getInstance().getValue(config.keys.KEY_ACCESS_TOKEN);
        // Check token
        if (pToken !== configToken) {
            callback(new Error('token is invalid'), false);
            return;
        }
        callback(null, true);
    },
    limits: {
        fileSize: Math.ceil(MAX_IMAGE_SIZE * 1024 * 1024)
    }
}).single('image');

const app = express();

/**
 * Router
 */
app.use('/', (req, res) => {
    const noWaterMark = (req.query.nomark === '1');
    upload(req, res, (err) => {
        if (err) {
            LogUtil.error(err);
            doResponse(null, err);
            return;
        }
        let file = req.file;
        if (!file) {
            doResponse(UniResult.Errors.PARAM_ERROR);
            return;
        }
        let ext = path.parse(file.originalname).ext;
        let ts = (new Date() * 1);
        let fileName = `${ts}${ext}`;
        let imageFilePath = path.join(TARGET_DIR, fileName);

        // If enable watermark, add watermark and save to target path.
        if (ADD_WATERMARK && !noWaterMark) {
            WaterMarker.markAndSave(file.path, imageFilePath, (err) => {
                if (!err) {
                    processFormats(imageFilePath, fileName);
                } else {
                    LogUtil.error(err);
                    doResponse(null, err);
                }
            });
        } else {
            // If not enable watermark or get an error when adding watermark, rename directly.
            moveFile(file.path, imageFilePath, fileName);
        }
    });

    const moveFile = (currentPath, destPath, fileName) => {
        fs.rename(currentPath, destPath, (err) => {
            if (err) {
                LogUtil.error(err);
                doResponse(null, err);
                return;
            } else {
                doResponse({
                    url: `${URL_RREFIX}${fileName}`
                });
            }
        });
    };

    const processFormats = (imageFilePath, fileName) => {
        if (GEN_COMPRESS) {
            converter(COMPRESS_FORMATS, imageFilePath)
        }
       
        doResponse({
            url: `${URL_RREFIX}${fileName}`
        });
    };

    /**
     * Send JSON response.
     * 
     * @param {UniResult} data 
     * @param {Error|null} err 
     */
    const doResponse = (data, err = null) => {
        if (data) {
            res.json(UniResult.UniResult.getSuccess(data));
        } else {
            res.json(UniResult.UniResult.getError(-1, err.message))
        }
        res.end();
    };
});

/**
 * Start service.
 */
const startServer = () => {
    const port = config.ConfigManager.getInstance().getValue(config.keys.KEY_UPLOADER_SERVER_PORT);
    const hostname = config.ConfigManager.getInstance().getValue(config.keys.KEY_BIND_LOCAL) ? '127.0.0.1' : null;

    app.listen(port, hostname, (err) => {
        if (err) {
            LogUtil.error(err);
        } else {
            LogUtil.info(`Uploader service has been started, port: ${port}`);
        }
    });
}

module.exports = {
    startServer: startServer
};