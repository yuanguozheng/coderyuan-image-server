const path = require('path');
const fs = require('fs');
const gm = require('gm');
const config = require('./config');
const LogUtil = require('./log');

const WATERMARK_PATH = config.ConfigManager.getInstance().getValue(config.keys.KEY_WATERMARK_PATH);
const IMAGE_SAVE_DIR = config.ConfigManager.getInstance().getValue(config.keys.KEY_IMAGE_DIR);

/**
 * An util to attach watermark on target image.
 */
class WaterMarker {

    /**
     * add watermark & save to a file.
     * 
     * @param {string} rawImagePath original image file path.
     * @param {string} outputPath output image file path.
     * @param {function} callback cb.
     */
    static markAndSave(rawImagePath, outputPath, callback) {
        WaterMarker._getImageSize(rawImagePath, (width, height) => {
            if (width <= 0 || height <= 0) {
                callback(new Error('Image load error.'))
                return;
            }

            // default watermark rate
            const rateH = 0.15;
            const rateW = 0.50;

            WaterMarker._getImageSize(WATERMARK_PATH, (wmWidth, wmHeight) => {
                if (wmWidth <= 0 || wmHeight <= 0) {
                    callback(new Error('Image load error.'))
                    return;
                }

                let targetWmWidth = 0;
                let targetWmHeight = 0;

                // if width > height, use width as reference.
                if (width > height) {
                    targetWmWidth = width * rateW;
                    targetWmHeight = targetWmWidth / wmWidth * wmHeight;
                } else {
                    targetWmHeight = height * rateH;
                    targetWmWidth = targetWmHeight / wmHeight * wmWidth;
                }

                if (!targetWmHeight || !targetWmWidth) {
                    callback(new Error('Image size error.'))
                    return;
                }

                const targetX = width - targetWmWidth;
                const targetY = height - targetWmHeight;

                const tempDir = config.ConfigManager.getInstance().getImageTempPath();
                const fullTargetTempWmPath = path.join(tempDir, `wm_${new Date() * 1}.png`);

                /**
                 * 1. Resize the watermark as a temporary file.
                 * 2. Do mosaic (use original image and resized watermark).
                 * 3. Delete temporary watermark.
                 */
                const resizedWm = gm(WATERMARK_PATH).resize(targetWmWidth, targetWmHeight).write(fullTargetTempWmPath, (err) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    gm().in('-page', '+0+0')
                        .in(rawImagePath)
                        .in('-page', `+${targetX}+${targetY}`)
                        .in(fullTargetTempWmPath)
                        .mosaic()
                        .write(outputPath, (err) => {
                            if (err) {
                                LogUtil.error(err);
                            }
                            if (fs.existsSync(fullTargetTempWmPath)) {
                                fs.unlinkSync(fullTargetTempWmPath);
                            }
                            callback(err);
                        });
                });
            });
        });
    }

    /**
     * Get image size.
     * 
     * @param {string} path 
     * @param {function(number, number)} callback 
     * @private
     */
    static _getImageSize(path, callback) {
        gm(path).size((err, imageSize) => {
            if (err) {
                LogUtil.error(err);
                callback(-1, -1);
            } else {
                callback(imageSize.width, imageSize.height);
            }
        });
    }
}

module.exports = WaterMarker;