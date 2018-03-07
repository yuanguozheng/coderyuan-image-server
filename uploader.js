const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const LogUtil = require('./log');
const webpConverter = require('./webp-converter');

const config = require('./config');
const TARGET_DIR = config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_DIR);
const GEN_WEBP = config.ConfigManager.getInstance().getValue(config.keys.KEY_GEN_WEBP);
const ADD_WATERMARK = config.ConfigManager.getInstance().getValue(config.keys.KEY_ADD_WATERMARK);
const URL_RREFIX = config.ConfigManager.getInstance().getValue(config.keys.KEY_URL_PREFIX);
const MAX_IMAGE_SIZE = config.ConfigManager.getInstance().getValue(config.keys.KEY_MAX_IMAGE_SIZE);

const WaterMarker = require('./watermarker');

const UniResult = require('./universal-result');

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

app.use(bodyParser.urlencoded({
    extended: true
}));

/**
 * Router
 */
app.use('/', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            LogUtil.error(err);
            doResponse(null, err);
            return;
        }
        let file = req.file;
        let ext = path.parse(file.originalname).ext;
        let ts = (new Date() * 1);
        let imageFilePath = path.join(TARGET_DIR, `${ts}${ext}`);
        // If enable watermark, add watermark and save to target path.
        if (ADD_WATERMARK) {
            WaterMarker.markAndSave(file.path, imageFilePath, (err) => {
                if (!err) {
                    doResponse({
                        url: `${URL_RREFIX}${imageFilePath}`
                    });
                    return;
                }
                LogUtil.error(err);
            })
        }
        // If not enable watermark or get an error when adding watermark, rename directly.
        fs.rename(file.path, imageFilePath, (err) => {
            if (err) {
                LogUtil.error(err);
                doResponse(null, err);
                return;
            } else {
                // If enable webp, convert the image to webp but ignore the result.
                if (GEN_WEBP) {
                    webpConverter.convertToWebP(imageFilePath, path.join(TARGET_DIR, `${ts}.webp`));
                }
                doResponse({
                    url: `${URL_RREFIX}${imageFilePath}`
                });
            }
        });
    })

    /**
     * Send JSON response.
     * 
     * @param {UniResult} data 
     * @param {string|null} errMsg 
     */
    const doResponse = (data, errMsg = null) => {
        if (data) {
            res.json(UniResult.UniResult.getSuccess(data));
        } else {
            res.json(UniResult.UniResult.getError(-1, errMsg))
        }
        res.end();
    }
});

/**
 * Start service.
 */
const startServer = () => {
    const port = config.ConfigManager.getInstance().getValue(config.keys.KEY_UPLOADER_SERVER_PORT);
    app.listen(port, (err) => {
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