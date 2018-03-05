const express = require('express');
const multer = require('multer');
const config = require('./config');

const upload = multer({
    dest: config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_PATH)
});

const app = express();

app.use('/', (req, res) => {

});