const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const config = require('./config');
const LogUtil = require('./log');

const WATERMARK_PATH = config.ConfigManager.getInstance().getValue(config.keys.KEY_WATERMARK_PATH);

/**
 * An util to attach watermark on target image.
 */
class WaterMarker {

    /**
     * add watermark & save to a file.
     * 
     * @param {string} rawImagePath original image file path.
     * @param {string} outputPath output image file path.
     * @param {function(Error)} callback cb.
     */
    static async markAndSave(rawImagePath, outputPath, callback) {
        try {
            const rawSize = await WaterMarker._getImageSize(rawImagePath);
            let width = rawSize.width;
            let height = rawSize.height;
            if (width <= 0 || height <= 0) {
                callback(new Error('Image load error.'));
                return;
            }

            // default watermark rate
            const rateH = 0.15;
            const rateW = 0.50;

            const wmSize = await WaterMarker._getImageSize(WATERMARK_PATH);
            let wmWidth = wmSize.width;
            let wmHeight = wmSize.height;
            if (wmWidth <= 0 || wmHeight <= 0) {
                callback(new Error('Watermark load error.'));
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

            targetWmHeight = Math.ceil(targetWmHeight);
            targetWmWidth = Math.ceil(targetWmWidth);

            const tempDir = config.ConfigManager.getInstance().getImageTempPath();
            const fullTargetTempWmPath = path.join(tempDir, `wm_${new Date().getTime()}.png`);

            // Resize the watermark and save it temporarily
            await sharp(WATERMARK_PATH)
                .resize({ width: Math.min(targetWmWidth, width), height: Math.min(targetWmHeight, height), fit: 'inside' })
                .toFile(fullTargetTempWmPath);

            // Composite the watermark onto the original image
            await sharp(rawImagePath)
                .composite([{ input: fullTargetTempWmPath, gravity: 'southeast' }]) // `gravity` controls the position
                .toFile(outputPath);

            // Clean up the temporary watermark file
            if (fs.existsSync(fullTargetTempWmPath)) {
                fs.unlinkSync(fullTargetTempWmPath);
            }

            callback(null);
        } catch (err) {
            callback(err);
        }
    }

    /**
     * Get image size.
     * 
     * @param {string} imagePath 
     * @returns {Promise<{width: number, height: number}>}
     * @private
     */
    static async _getImageSize(imagePath) {
        try {
            const { width, height } = await sharp(imagePath).metadata();
            return { width, height };
        } catch (err) {
            LogUtil.error("Get image size error:" + err);
            return { width: -1, height: -1 };
        }
    }
}

module.exports = WaterMarker;