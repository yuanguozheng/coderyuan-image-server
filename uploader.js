const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const LogUtil = require('./log');
const webpConverter = require('./webp-converter');

const config = require('./config');
const TARGET_DIR = config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_PATH);

const upload = multer({
    dest: path.join(TARGET_DIR, '.temp/'),
    fileFilter: (req, file, callback) => {
        const pToken = req.query.accessToken;
        const configToken = config.ConfigManager.getInstance().getValue(config.keys.KEY_ACCESS_TOKEN);
        if (pToken !== configToken) {
            callback(new Error('token is invalid'), false);
            return;
        }
        if (!file.mimetype.startsWith('image/')) {
            callback(new Error('file is not image'), false);
            return;
        }
        callback(null, true);
    }
}).single('image');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.end('failed');
        } else {
            let file = req.file;
            let ext = path.parse(file.originalname).ext;
            let ts = (new Date() * 1);
            let imageFilePath = path.join(TARGET_DIR, `${ts}${ext}`);
            fs.rename(file.path, imageFilePath, (err) => {
                if (err) {
                    LogUtil.error(err);
                    res.end('failed');
                } else {
                    webpConverter.convertToWebP(imageFilePath, path.join(TARGET_DIR, `${ts}.webp`));
                    res.end('ok');
                }
            });
        }
    });
});

module.exports.start = () => {
    const port = config.ConfigManager.getInstance().getValue(config.keys.KEY_UPLOADER_SERVER_PORT);
    app.listen(port, (err) => {
        if (err) {
            LogUtil.error(err);
        } else {
            LogUtil.info(`Uploader service has been started, port: ${port}`);
        }
    });
}