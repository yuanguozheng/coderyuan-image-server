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
const AVAILABLE_EXTENSIONS = config.ConfigManager.getInstance().getValue(config.keys.KEY_AVAILABLE_EXT);

const WaterMarker = require('./watermarker');

const UniResult = require('./universal-result');
const converter = require('./converter');
const BaseService = require('./base_service');

class ImageUploader extends BaseService {

    constructor() {
        super();
        /**
         * Init multer.
         */
        this.upload = multer({
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
    }

    handleRequest(req, res) {
        const noWaterMark = (req.query.nomark === '1');
        this.upload(req, res, (err) => {
            if (err) {
                LogUtil.error(err);
                ImageUploader._doResponse(null, err, res);
                return;
            }
            let file = req.file;
            if (!file) {
                ImageUploader._doErrResponse(UniResult.Errors.PARAM_ERROR, res);
                return;
            }
            let ext = path.parse(file.originalname).ext;
            if (!ext || ext.length === 0) {
                ImageUploader._doErrResponse(UniResult.Errors.PARAM_ERROR, res);
                return;
            }
            ext = ext.toLowerCase();
            if (!AVAILABLE_EXTENSIONS.includes(ext)) {
                LogUtil.error("Upload unsupported file type: " + ext);
                ImageUploader._doErrResponse(UniResult.Errors.PARAM_ERROR, res);
                return;
            }
            let ts = (new Date() * 1);
            let fileName = `${ts}${ext}`;
            let imageFilePath = path.join(TARGET_DIR, fileName);

            // If enable watermark, add watermark and save to target path.
            if (ADD_WATERMARK && !noWaterMark) {
                WaterMarker.markAndSave(file.path, imageFilePath, (err) => {
                    if (!err) {
                        ImageUploader._processFormats(imageFilePath, fileName, res);
                    } else {
                        LogUtil.error('Add watermark error: ' + err);
                        ImageUploader._doResponse(null, err, res);
                    }
                });
            } else {
                // If not enable watermark or get an error when adding watermark, rename directly.
                ImageUploader._moveFile(file.path, imageFilePath, fileName, res);
            }
        });
    }

    getServiceName() {
        return 'Image Uploader';
    }

    getServerPort() {
        return config.ConfigManager.getInstance().getValue(config.keys.KEY_UPLOADER_SERVER_PORT);
    }

    static _moveFile(currentPath, destPath, fileName, res) {
        fs.rename(currentPath, destPath, (err) => {
            if (err) {
                LogUtil.error('Move file error: ' + err);
                ImageUploader._doResponse(null, err, res);
                return;
            } else {
                ImageUploader._doNoErrResponse({
                    url: `${URL_RREFIX}${fileName}`
                }, res);
            }
        });
    };

    static _processFormats(imageFilePath, fileName, res) {
        if (GEN_COMPRESS) {
            converter(COMPRESS_FORMATS, imageFilePath)
        }

        ImageUploader._doNoErrResponse({
            url: `${URL_RREFIX}${fileName}`
        }, res);
    };

    /**
     * Send JSON response.
     * 
     * @param {UniResult} data 
     * @param {Error|null} err 
     * @param {express.Response} res 
     */
    static _doResponse(data, err = null, res) {
        if (data) {
            res.json(UniResult.UniResult.getSuccess(data));
        } else {
            res.json(UniResult.UniResult.getError(-1, err.message))
        }
        res.end();
    }

    static _doNoErrResponse(data, res) {
        ImageUploader._doResponse(data, null, res);
    }

    static _doErrResponse(err, res) {
        res.json(err)
        res.end();
    }
}

module.exports = ImageUploader;